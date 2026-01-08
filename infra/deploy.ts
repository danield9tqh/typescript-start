import { $ } from "bun";
import { tmpdir, homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
import Cloudflare from "cloudflare";
import packageJson from "../package.json";

// Configuration - set your custom domain here
const CUSTOM_DOMAIN = "myapp.example.com"; // e.g., "myapp.example.com"

if (!CUSTOM_DOMAIN) {
    console.error("CUSTOM_DOMAIN must be set in ./infra/deploy.ts");
    process.exit(1);
}

// Resolve paths
const infraDir = import.meta.dir;
const rootDir = join(infraDir, "..");
const stateFilePath = join(infraDir, "deploy-state.json");
const APP_NAME = packageJson.name;

/**
 * Get Cloudflare API token from environment or wrangler config
 * Wrangler stores OAuth tokens at:
 * - macOS: ~/Library/Preferences/.wrangler/config/default.toml
 * - Linux/Windows: ~/.wrangler/config/default.toml
 */
async function getCloudflareToken(): Promise<string | undefined> {
    // Run a lightweight wrangler command to trigger OAuth token refresh if needed
    // wrangler automatically refreshes expired tokens
    try {
        await $`wrangler whoami`.quiet();
    } catch {
        // Ignore errors - user might not be logged in
    }

    // Read from wrangler config (same location wrangler login uses)
    const wranglerConfigPaths = [
        join(homedir(), "Library/Preferences/.wrangler/config/default.toml"), // macOS
        join(homedir(), ".wrangler/config/default.toml"), // Linux/Windows
    ];

    for (const configPath of wranglerConfigPaths) {
        if (existsSync(configPath)) {
            try {
                const content = readFileSync(configPath, "utf-8");
                const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
                if (match) {
                    return match[1];
                }
            } catch {
                // Continue to next path
            }
        }
    }

    return undefined;
}

interface DeployState {
    databaseId?: string;
    databaseName?: string;
    authSecretSet?: boolean;
}

async function loadOrCreateState(): Promise<DeployState> {
    // Get token from env or wrangler config (triggers refresh if needed)
    const apiToken = await getCloudflareToken();

    if (!apiToken) {
        console.error("No Cloudflare credentials found run 'wrangler login'");
        process.exit(1);
    }

    const cf = new Cloudflare({ apiToken });
    const databaseName = `${APP_NAME}-db`;
    if (!existsSync(stateFilePath)) {
        Bun.write(stateFilePath, JSON.stringify({}));
    }

    const state = await Bun.file(stateFilePath).json();
    if (!state.databaseId) {
        // Use Cloudflare SDK
        console.log("🔄 Creating D1 database via Cloudflare API...");


        const accounts = await cf.accounts.list();
        const accountId = accounts.result?.[0]?.id;
        if (!accountId) {
            throw new Error("No Cloudflare account found");
        }

        const database = await cf.d1.database.create({
            account_id: accountId,
            name: databaseName,
        });

        const databaseId = database.uuid;
        if (!databaseId) {
            throw new Error("Failed to create D1 database - no UUID returned");
        }

        state.databaseId = databaseId;
        state.databaseName = databaseName;
    }

    await Bun.write(stateFilePath, JSON.stringify(state));
    console.log(`✅ Saved state to deploy-state.json`);

    return state;
}

async function deploy() {
    // Load or create database and secrets
    const { databaseId, databaseName, authSecretSet } = await loadOrCreateState();

    // Configuration
    const config = {
        database: {
            name: databaseName,
            id: databaseId,
        },
        worker: {
            name: APP_NAME,
            customDomain: CUSTOM_DOMAIN,
        },
        schema: join(rootDir, "auth/db-schema.ts"),
        migrations: join(infraDir, "migrations"),
    };

    // Generate wrangler config with absolute paths
    const wranglerConfig = {
        $schema: "node_modules/wrangler/config-schema.json",
        name: config.worker.name,
        main: join(infraDir, "index.ts"),
        compatibility_date: "2024-12-01",
        compatibility_flags: ["nodejs_compat"],
        assets: {
            directory: join(rootDir, "dist"),
            binding: "ASSETS",
            not_found_handling: "single-page-application",
        },
        d1_databases: [
            {
                binding: "DB",
                database_name: config.database.name,
                database_id: config.database.id,
                migrations_dir: config.migrations,
            },
        ],
        routes: [
            {
                pattern: CUSTOM_DOMAIN,
                custom_domain: true,
            },
        ],
        observability: {
            logs: {
                enabled: true,
                head_sampling_rate: 1,
                invocation_logs: true,
            },
        },
    };

    // Write wrangler config to temp file
    const configPath = join(tmpdir(), "wrangler.json");
    await Bun.write(configPath, JSON.stringify(wranglerConfig, null, 2));

    console.log("🔄 Building frontend...");
    const build = await Bun.build({
        entrypoints: [join(rootDir, "frontend/index.html")],
        outdir: join(rootDir, "dist"),
        sourcemap: "external",
        target: "browser",
        minify: true,
        define: {
            "process.env.NODE_ENV": '"production"',
        },
    });

    console.log("🔄 Generating migrations from schema...");
    await $`drizzle-kit generate --dialect=sqlite --schema=${config.schema} --out=${config.migrations}`;

    console.log("🔄 Applying migrations to D1...");
    await $`wrangler d1 migrations apply ${config.database.name} --remote --config=${configPath}`;

    console.log("🚀 Deploying worker...");
    await $`wrangler deploy --config=${configPath}`;

    // Upload secrets to the worker (only if not already set)
    if (!authSecretSet) {
        console.log("🔐 Uploading secrets...");
        const authSecret = randomBytes(32).toString("base64");
        const secretProc = Bun.spawn(["wrangler", "secret", "put", "BETTER_AUTH_SECRET", "--config", configPath], {
            stdin: "pipe",
            stdout: "inherit",
            stderr: "inherit",
        });
        secretProc.stdin.write(authSecret);
        secretProc.stdin.end();
        await secretProc.exited;
        console.log("✅ Secrets uploaded");

        const state = await Bun.file(stateFilePath).json();
        state.authSecretSet = true;
        await Bun.write(stateFilePath, JSON.stringify(state));
        // Update state to mark secret as set
    } else {
        console.log("✅ Auth secret already configured");
    }

    console.log("✅ Deployment complete!");
}

deploy().catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
});


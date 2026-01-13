import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import backend, { type Env as BackendEnv } from "../backend/server";
import { createAuth } from "../auth/auth";
import * as schema from "../auth/db-schema";
import type { D1Database } from "@cloudflare/workers-types";

interface Env {
    Bindings: {
        ASSETS: { fetch: (request: Request) => Promise<Response> };
        DB: D1Database;
        BETTER_AUTH_SECRET: string;
    };
    Variables: BackendEnv["Variables"];
}

const app = new Hono<Env>();

// Middleware to set up auth and db with D1 database
app.use("/api/*", async (c, next) => {
    const url = new URL(c.req.url);
    const db = drizzle(c.env.DB, { schema });
    const auth = createAuth({
        database: drizzleAdapter(db, { provider: "sqlite", schema }),
        rpID: url.hostname,
        rpName: "Bun App",
        origin: url.origin,
        secret: c.env.BETTER_AUTH_SECRET,
    });
    c.set("db", db);
    c.set("auth", auth);
    await next();
});

// API routes
app.route("/api", backend);

// Static assets for everything else
app.get("*", (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
});

export default app;


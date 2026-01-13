import { serve } from "bun";
import index from "./frontend/index.html";
import backend, { type Env } from "./backend/server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Database } from "bun:sqlite";
import * as schema from "./auth/db-schema";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { createAuth } from "auth/auth";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { Hono } from "hono";

const database = new Database("./dev.db");
const db = drizzle(database, { schema });

// Push schema to database (sync schema changes)
const pushResult = await pushSQLiteSchema(schema, db as any);
if (pushResult.statementsToExecute.length > 0) {
  console.log("Applying schema changes...");
  await pushResult.apply();
  console.log("✅ Schema pushed");
} else {
  console.log("✅ Schema already up to date");
}

const auth = createAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  rpID: "localhost",
  rpName: "Bun App",
  origin: "http://localhost:3000",
});

const api = new Hono<Env>()
  .use(async (c, next) => {
    c.set("db", db);
    c.set("auth", auth);
    await next();
  })
  .route("/api", backend);

const server = serve({
  routes: {
    "/api/*": async (req) => api.fetch(req),
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Listening on ${server.url}`);

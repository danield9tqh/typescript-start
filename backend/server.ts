import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAuth } from "auth/auth";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "../auth/db-schema";

export type DrizzleDb = BaseSQLiteDatabase<"async" | "sync", unknown, typeof schema>;

export interface Env {
  Variables: {
    db: DrizzleDb;
    auth: ReturnType<typeof createAuth>;
  };
}

const backend = new Hono<Env>()
  .on(["GET", "POST"], "/auth/*", (c) => {
    return c.var.auth.handler(c.req.raw);
  })
  .get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  })
  .post(
    "/hello",
    zValidator(
      "json",
      z.object({
        name: z.string(),
      })
    ),
    (c) => {
      const { name } = c.req.valid("json");
      return c.json({ message: `Hello, ${name}!` });
    }
  );

export type App = typeof backend;
export default backend;

import { hc } from "hono/client";
import type { App } from "../backend/server";

export const client = hc<App>("/api");


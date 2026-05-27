import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "@config/config.env.js";
import * as schema from "./schemas/index.js";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Minimal DB setup - since we use JSON storage, we make this optional/dummy
// to prevent crashes if DATABASE_URL is missing.

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy" 
});

// We export db but it might fail if we try to use it without a real DB.
// Our storage implementation will avoid using this.
export const db = drizzle(pool, { schema });

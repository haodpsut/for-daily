// Next.js auto-loads .env.local for app routes. CLI scripts (seed/export/import)
// load dotenv themselves at the top of each script. We do NOT import dotenv here
// because middleware (Edge Runtime) cannot use Node APIs like process.cwd().

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | undefined;

function initDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set in .env.local for Next.js, or pass as env var for CLI scripts.",
    );
  }
  const isProduction = process.env.NODE_ENV === "production";
  const client = postgres(url, {
    max: isProduction ? 1 : 10,
    prepare: false,
    ssl: url.includes("sslmode=require") ? "require" : undefined,
  });
  return drizzle(client, { schema });
}

// Lazy proxy — defers DB init until first query
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!_db) _db = initDb();
    return Reflect.get(_db, prop, _db);
  },
});

export { schema };

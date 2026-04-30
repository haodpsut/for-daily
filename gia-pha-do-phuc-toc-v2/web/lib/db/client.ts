import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | undefined;

function initDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required (set in .env.local). " +
        "If you see this during 'next build', set DATABASE_URL even to a stub — " +
        "next build evaluates server modules eagerly.",
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

// Lazy proxy — defers DB init until first query so 'next build' doesn't crash
// when DATABASE_URL is missing at build time (build doesn't run queries).
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!_db) _db = initDb();
    return Reflect.get(_db, prop, _db);
  },
});

export { schema };

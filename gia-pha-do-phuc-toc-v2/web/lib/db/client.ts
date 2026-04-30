import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (set in .env.local)");
}

const isProduction = process.env.NODE_ENV === "production";

const queryClient = postgres(databaseUrl, {
  max: isProduction ? 1 : 10,        // Vercel serverless: 1 connection per invocation
  prepare: false,                     // Required for transaction-pooler / serverless-compatible
  ssl: databaseUrl.includes("sslmode=require") ? "require" : undefined,
});

export const db = drizzle(queryClient, { schema });
export { schema };

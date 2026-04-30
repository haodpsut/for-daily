import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (set in .env.local)");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  verbose: false,
  // strict: false → drizzle-kit push không hỏi confirm (cần thiết cho non-TTY install).
  // Rủi ro mất data ở schema-change destructive được mitigated bởi backup.sh chạy trước update.sh.
  strict: false,
});

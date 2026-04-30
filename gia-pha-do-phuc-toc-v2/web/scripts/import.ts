/**
 * Import script — restore DB from a GiaPhaBundle v1 folder.
 *
 * Usage: npm run import ./path/to/bundle/
 *
 * Behaviour:
 *   - Wipes all tables (TRUNCATE CASCADE), then inserts from JSON files in dependency order.
 *   - Skips files that don't exist (e.g. older bundles without media tables).
 *   - Validates manifest.json bundleVersion compatibility.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db, schema } from "../lib/db/client";

const SUPPORTED_VERSIONS = ["1.0.0"];

// Insert order = dependency order (parents first).
// persons MUST come before ancestral_hall_info (founder_person_id FK).
const IMPORT_ORDER: Array<[string, keyof typeof schema]> = [
  ["persons", "persons"],
  ["ancestral_hall_info", "ancestralHallInfo"],
  ["person_details_private", "personDetailsPrivate"],
  ["relationships", "relationships"],
  ["death_anniversaries", "deathAnniversaries"],
  ["rituals", "rituals"],
  ["ritual_occurrences", "ritualOccurrences"],
  ["annual_reports", "annualReports"],
  ["contributions", "contributions"],
  ["heritage_items", "heritageItems"],
  ["graves", "graves"],
  ["grave_visits", "graveVisits"],
  ["media_items", "mediaItems"],
  ["media_links", "mediaLinks"],
];

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// Auto-convert ISO datetime strings (timestamp columns) → Date.
// Plain YYYY-MM-DD (date columns) are left as strings.
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && ISO_DATETIME_REGEX.test(value)) {
    return new Date(value);
  }
  return value;
}

async function loadJson<T>(p: string): Promise<T[]> {
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw, dateReviver) as T[];
}

async function run() {
  const bundleDir = process.argv[2];
  if (!bundleDir) {
    console.error("❌ Usage: npm run import <bundle-dir>");
    process.exit(1);
  }

  const absDir = path.resolve(process.cwd(), bundleDir);
  console.log("📥 Importing from:", absDir);

  // Validate manifest
  const manifestPath = path.join(absDir, "manifest.json");
  if (!(await fileExists(manifestPath))) {
    console.error("❌ manifest.json not found — invalid bundle");
    process.exit(1);
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  if (!SUPPORTED_VERSIONS.includes(manifest.bundleVersion)) {
    console.error(`❌ Unsupported bundle version: ${manifest.bundleVersion}. Supported: ${SUPPORTED_VERSIONS.join(", ")}`);
    process.exit(1);
  }
  console.log(`  Bundle: ${manifest.bundleFormat} v${manifest.bundleVersion} (exported ${manifest.exportedAt})`);
  console.log("");

  // Wipe
  console.log("🗑️  Truncating tables...");
  await db.execute(sql`
    TRUNCATE TABLE
      audit_log,
      media_links, media_items,
      grave_visits, graves,
      heritage_items,
      contributions, annual_reports,
      ritual_occurrences, rituals,
      death_anniversaries,
      relationships, person_details_private, persons,
      ancestral_hall_info,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log("");

  // Insert
  for (const [filename, tableKey] of IMPORT_ORDER) {
    const filePath = path.join(absDir, `${filename}.json`);
    if (!(await fileExists(filePath))) {
      console.log(`  ⊘ ${filename}: skipped (file not in bundle)`);
      continue;
    }
    const rows = await loadJson<Record<string, unknown>>(filePath);
    if (rows.length === 0) {
      console.log(`  ⊘ ${filename}: 0 rows`);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(schema[tableKey] as any).values(rows as any);
    console.log(`  ✓ ${filename}: ${rows.length}`);
  }

  console.log("");
  console.log("✅ Import complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});

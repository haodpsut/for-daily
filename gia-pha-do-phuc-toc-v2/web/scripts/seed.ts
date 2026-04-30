/**
 * Seed script — wipe DB + insert sample data from data/seed/*.json
 *
 * Usage: npm run seed
 * WARNING: Destroys ALL data. Run `npm run export ./data/backups/<name>` first if you have real data.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db, schema } from "../lib/db/client";

const SEED_DIR = path.resolve(process.cwd(), "data/seed");

// Drizzle timestamp columns expect Date objects, but JSON only has strings.
// Auto-convert any ISO 8601 datetime string (with time component) to Date.
// Plain `YYYY-MM-DD` strings (date columns) are left untouched.
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && ISO_DATETIME_REGEX.test(value)) {
    return new Date(value);
  }
  return value;
}

async function loadJson<T>(filename: string): Promise<T[]> {
  const p = path.join(SEED_DIR, filename);
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw, dateReviver) as T[];
}

async function seed() {
  console.log("🌱 Seeding database from", SEED_DIR);
  console.log("");

  // ---- 1. WIPE (reverse dependency order) ----
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

  // ---- 2. INSERT (dependency order — persons FIRST because hall FK→persons) ----

  const persons = await loadJson<typeof schema.persons.$inferInsert>("persons.json");
  await db.insert(schema.persons).values(persons);
  console.log(`  ✓ persons: ${persons.length}`);

  const hall = await loadJson<typeof schema.ancestralHallInfo.$inferInsert>("ancestral_hall_info.json");
  if (hall.length > 0) {
    await db.insert(schema.ancestralHallInfo).values(hall);
    console.log(`  ✓ ancestral_hall_info: ${hall.length}`);
  }

  const relationships = await loadJson<typeof schema.relationships.$inferInsert>("relationships.json");
  await db.insert(schema.relationships).values(relationships);
  console.log(`  ✓ relationships: ${relationships.length}`);

  const anniversaries = await loadJson<typeof schema.deathAnniversaries.$inferInsert>("death_anniversaries.json");
  await db.insert(schema.deathAnniversaries).values(anniversaries);
  console.log(`  ✓ death_anniversaries: ${anniversaries.length}`);

  const rituals = await loadJson<typeof schema.rituals.$inferInsert>("rituals.json");
  await db.insert(schema.rituals).values(rituals);
  console.log(`  ✓ rituals: ${rituals.length}`);

  const occurrences = await loadJson<typeof schema.ritualOccurrences.$inferInsert>("ritual_occurrences.json");
  await db.insert(schema.ritualOccurrences).values(occurrences);
  console.log(`  ✓ ritual_occurrences: ${occurrences.length}`);

  const reports = await loadJson<typeof schema.annualReports.$inferInsert>("annual_reports.json");
  await db.insert(schema.annualReports).values(reports);
  console.log(`  ✓ annual_reports: ${reports.length}`);

  const contributions = await loadJson<typeof schema.contributions.$inferInsert>("contributions.json");
  await db.insert(schema.contributions).values(contributions);
  console.log(`  ✓ contributions: ${contributions.length}`);

  const heritage = await loadJson<typeof schema.heritageItems.$inferInsert>("heritage_items.json");
  await db.insert(schema.heritageItems).values(heritage);
  console.log(`  ✓ heritage_items: ${heritage.length}`);

  const graves = await loadJson<typeof schema.graves.$inferInsert>("graves.json");
  await db.insert(schema.graves).values(graves);
  console.log(`  ✓ graves: ${graves.length}`);

  const visits = await loadJson<typeof schema.graveVisits.$inferInsert>("grave_visits.json");
  await db.insert(schema.graveVisits).values(visits);
  console.log(`  ✓ grave_visits: ${visits.length}`);

  console.log("");
  console.log("✅ Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

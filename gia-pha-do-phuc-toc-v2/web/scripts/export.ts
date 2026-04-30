/**
 * Export script — dump entire DB into a GiaPhaBundle v1 folder.
 *
 * Usage:
 *   npm run export                       (default to ./data/backups/<timestamp>)
 *   npm run export ./path/to/output/     (custom path)
 *
 * Output structure:
 *   <output>/
 *     manifest.json
 *     persons.json
 *     relationships.json
 *     ... (one JSON per table)
 *     media/                  (copied from STORAGE_LOCAL_PATH if exists — S2+)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, schema } from "../lib/db/client";

const BUNDLE_VERSION = "1.0.0";

const TABLES: Array<[string, keyof typeof schema]> = [
  ["ancestral_hall_info", "ancestralHallInfo"],
  ["persons", "persons"],
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

async function run() {
  const arg = process.argv[2];
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.resolve(process.cwd(), arg || `data/backups/${stamp}`);

  console.log("📦 Exporting to:", outDir);
  await mkdir(outDir, { recursive: true });

  const counts: Record<string, number> = {};

  for (const [filename, tableKey] of TABLES) {
    const table = schema[tableKey] as Parameters<typeof db.select>[0] extends never ? never : Parameters<typeof db.select.prototype.from>[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.select().from(schema[tableKey] as any);
    const filePath = path.join(outDir, `${filename}.json`);
    await writeFile(filePath, JSON.stringify(rows, null, 2), "utf-8");
    counts[filename] = rows.length;
    console.log(`  ✓ ${filename}: ${rows.length}`);
    void table;
  }

  const manifest = {
    bundleFormat: "GiaPhaBundle",
    bundleVersion: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    siteName: process.env.SITE_NAME ?? "Đỗ Phúc Tộc",
    counts,
  };
  await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  console.log("");
  console.log("✅ Export complete.");
  console.log("📁", outDir);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Export failed:", err);
  process.exit(1);
});

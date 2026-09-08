/**
 * Give every existing document a baseline version.
 *
 *   DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/backfill-versions.ts [--dry]
 *
 * Turning on `versions` starts recording from the next save, which leaves a
 * hole exactly where it matters: the first change to a document that already
 * existed has nothing behind it to go back to. Someone edits a rate, wants it
 * put back, and the only version on file is the edit itself.
 *
 * A no-op save fills that in: it writes the document as it already stands, so
 * the first entry in the history is the state before anyone touched it. Safe
 * to re-run, and it skips anything that already has history.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLLECTIONS = ["sites", "addons", "blocked-dates"] as const;

(async () => {
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });
  let made = 0;
  let had = 0;

  for (const collection of COLLECTIONS) {
    const res = await payload.find({ collection, pagination: false, depth: 0 });
    for (const doc of res.docs as any[]) {
      const existing = await payload.countVersions({ collection, where: { parent: { equals: doc.id } } });
      if (existing.totalDocs > 0) { had++; continue; }
      const label = doc.name ?? doc.title ?? doc.slug ?? doc.siteSlug ?? doc.id;
      console.log(`  ${collection}/${doc.id} ${label}`);
      // Write the document back exactly as it is. Payload snapshots the result,
      // so the baseline records today's state, not a change to it.
      if (!dry) await payload.update({ collection, id: doc.id, data: doc });
      made++;
    }
  }

  const g: any = await payload.findGlobal({ slug: "settings" });
  const gv = await payload.countGlobalVersions({ global: "settings" });
  if (gv.totalDocs > 0) had++;
  else {
    console.log("  global/settings");
    if (!dry) await payload.updateGlobal({ slug: "settings", data: g });
    made++;
  }

  console.log(`\n${made} baseline${made === 1 ? "" : "s"} ${dry ? "would be written" : "written"}, ${had} already had history`);
  process.exit(0);
})();

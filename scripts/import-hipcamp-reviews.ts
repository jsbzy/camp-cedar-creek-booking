/**
 * Replace the invented reviews with the ones guests actually wrote.
 *
 *   NEXT_PUBLIC_APP_URL=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/import-hipcamp-reviews.ts [--dry]
 *
 * The eighteen reviews on the site were written to have something to look at
 * while it was being built. Every one of them was made up, including the names,
 * and CLAUDE.md has said since day one that they had to go before launch.
 *
 * These are real: scraped from the owners' two Hipcamp listings, with the
 * guest's own words, their name as Hipcamp shows it, the month they stayed and
 * which site they stayed on.
 *
 * Hipcamp records a recommendation rather than stars, and every one of these
 * recommends, so they land as five. That is the honest translation: there is no
 * four-star review here being rounded up.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";
import reviews from "../src/lib/data/hipcamp-reviews.json";

/* eslint-disable @typescript-eslint/no-explicit-any */

(async () => {
  guardProductionEnv();
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });

  const existing = await payload.find({ collection: "reviews", pagination: false, depth: 0 });
  console.log(`  ${existing.docs.length} reviews on file now`);

  const real = (reviews as any[]).filter((r) => r.author && r.text && r.date);
  console.log(`  ${real.length} real ones to import`);
  const bySite = real.reduce((a: any, r) => ((a[r.siteSlug ?? "unknown"] = (a[r.siteSlug ?? "unknown"] ?? 0) + 1), a), {});
  console.log(`  covering ${Object.keys(bySite).length} sites`);

  if (dry) {
    console.log("\ndry run, nothing saved");
    process.exit(0);
  }

  // Out with the invented ones. They are demo content, not a record of
  // anything, so there is nothing here worth keeping.
  for (const doc of existing.docs as any[]) {
    await payload.delete({ collection: "reviews", id: doc.id });
  }

  let n = 0;
  for (const r of real) {
    await payload.create({
      collection: "reviews",
      data: {
        author: r.author,
        date: r.date,
        rating: 5,
        text: r.text,
        siteSlug: r.siteSlug ?? undefined,
        recommends: true,
        published: true,
        source: "hipcamp",
      } as any,
    });
    n++;
  }
  console.log(`\n  imported ${n}, replacing ${existing.docs.length} invented ones`);
  process.exit(0);
})();

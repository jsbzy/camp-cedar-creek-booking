/**
 * Move the governed marketing content into Payload: the homepage becomes a
 * published `pages` document, the Brand Guide becomes the brand-guide global.
 *
 *   MARKETING_BLOB_TOKEN=… DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/seed-content.ts
 *
 * Idempotent, and it will not overwrite a homepage that already carries edits
 * unless --force is passed: after go-live the Payload copy is the truth.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const BLOB_API = "https://blob.vercel-storage.com";

async function readMarketingBlob(prefix: string, exact = false): Promise<string | null> {
  const token = process.env.MARKETING_BLOB_TOKEN;
  if (!token) throw new Error("MARKETING_BLOB_TOKEN is not set");
  const r = await fetch(`${BLOB_API}/?prefix=${encodeURIComponent(prefix)}&limit=1000`, {
    headers: { authorization: `Bearer ${token}`, "x-api-version": "7" },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`blob list failed: ${r.status}`);
  const blobs: { pathname: string; url: string; size: number }[] = (await r.json()).blobs ?? [];
  const matches = blobs.filter((b) => b.size > 0 && (exact ? b.pathname === prefix : b.pathname.startsWith(prefix)));
  matches.sort((a, b) => (a.pathname < b.pathname ? -1 : 1));
  const newest = matches[matches.length - 1];
  if (!newest) return null;
  const res = await fetch(newest.url, { cache: "no-store" });
  return res.ok ? res.text() : null;
}

(async () => {
  const force = process.argv.includes("--force");
  const payload = await getPayload({ config });

  // --- Brand Guide ---
  // The guide lives in this repo now (src/content/brand-guide.md) so the test
  // suite and the seed read the same file and nothing depends on the old
  // marketing project.
  const { readFileSync } = await import("node:fs");
  const guide = readFileSync(new URL("../src/content/brand-guide.md", import.meta.url), "utf8");
  if (!/```json[\s\S]*?```/.test(guide)) throw new Error("brand guide has no LAW block; refusing to seed");
  await payload.updateGlobal({ slug: "brand-guide", data: { markdown: guide } });
  console.log(`brand-guide: ${guide.length} bytes`);

  // --- Homepage ---
  const html = await readMarketingBlob("site/current/index.html/");
  if (!html) throw new Error("homepage not found in the marketing blob store");
  const existing = await payload.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: true });
  const doc = existing.docs[0];
  if (doc && !force) {
    console.log(`home: already exists (id ${doc.id}); pass --force to overwrite`);
  } else if (doc) {
    await payload.update({
      collection: "pages",
      id: doc.id,
      data: { title: "Homepage", slug: "home", html, notes: "Re-seeded from the marketing copy", _status: "published" },
    });
    console.log(`home: overwritten (${html.length} bytes)`);
  } else {
    await payload.create({
      collection: "pages",
      data: { title: "Homepage", slug: "home", html, notes: "Imported from the marketing copy", _status: "published" },
    });
    console.log(`home: created (${html.length} bytes)`);
  }

  process.exit(0);
})();

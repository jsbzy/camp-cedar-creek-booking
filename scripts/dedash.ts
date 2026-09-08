/**
 * Take the prose em dashes out of stored content, the way the homepage tidy
 * did for the marketing page. The rule is enforced on the owners' edits by the
 * Brand Guide validator, so the seeded content should not be breaking it.
 *
 *   DATABASE_URI=… PAYLOAD_SECRET=… npx tsx scripts/dedash.ts [--dry]
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

/* eslint-disable @typescript-eslint/no-explicit-any */

// " — " is a clause break, so a comma carries it. A dash with no space around
// it is rarer and left for a human, because it is usually a range.
const fix = (v: unknown) => (typeof v === "string" && v.includes(" — ") ? v.replace(/ — /g, ", ") : null);

/** Walks an object, rewriting every string field that holds a prose em dash. */
function scrub(doc: any, path = ""): [any, string[]] {
  const changed: string[] = [];
  const walk = (node: any, p: string): any => {
    if (typeof node === "string") {
      const next = fix(node);
      if (next !== null) { changed.push(p); return next; }
      return node;
    }
    if (Array.isArray(node)) return node.map((v, i) => walk(v, `${p}[${i}]`));
    if (node && typeof node === "object") {
      const out: any = {};
      for (const [k, v] of Object.entries(node)) {
        if (["id", "createdAt", "updatedAt", "slug", "filename", "url"].includes(k)) { out[k] = v; continue; }
        out[k] = walk(v, p ? `${p}.${k}` : k);
      }
      return out;
    }
    return node;
  };
  return [walk(doc, path), changed];
}

(async () => {
  const dry = process.argv.includes("--dry");
  const payload = await getPayload({ config });
  let total = 0;

  for (const collection of ["sites", "reviews", "addons", "pages"] as const) {
    const res = await payload.find({ collection, pagination: false, depth: 0 });
    for (const doc of res.docs as any[]) {
      const [next, changed] = scrub(doc);
      if (!changed.length) continue;
      total += changed.length;
      console.log(`  ${collection}/${doc.id} ${doc.name ?? doc.title ?? doc.slug ?? ""}: ${changed.join(", ")}`);
      if (!dry) await payload.update({ collection, id: doc.id, data: next });
    }
  }

  for (const slug of ["settings"] as const) {
    const g: any = await payload.findGlobal({ slug });
    const [next, changed] = scrub(g);
    if (changed.length) {
      total += changed.length;
      console.log(`  global/${slug}: ${changed.join(", ")}`);
      if (!dry) await payload.updateGlobal({ slug, data: next });
    }
  }

  console.log(`\n${total} field${total === 1 ? "" : "s"} ${dry ? "would change" : "changed"}`);
  process.exit(0);
})();

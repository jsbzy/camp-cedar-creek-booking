/**
 * Bring the site photography in house.
 *
 * Every site photo was pointing at Hipcamp's image server (and the trailer's at
 * Airbnb's). That is fine while the listings are up and worthless the day they
 * come down, which is the whole point of building this. This downloads each one,
 * stores it as a Media document, and rewrites the site to use our copy.
 *
 * Safe to run twice: anything already on our own storage is left alone, and the
 * same source URL is only fetched once even when several sites share it.
 *
 *   npx tsx scripts/rehost-photos.ts                 # report, change nothing
 *   NEXT_PUBLIC_APP_URL=https://ccc.bzy.design \
 *   DATABASE_URI="$DATABASE_URL" npx tsx scripts/rehost-photos.ts --apply
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { guardProductionEnv } from "./_guard";

const APPLY = process.argv.includes("--apply");

/** Hosts we are borrowing from. Anything else is assumed to be ours already. */
const FOREIGN = /(hipcamp-res\.cloudinary\.com|muscache\.com)/i;

/** Cloudinary serves whatever width you ask for. Ask for a good one. */
function bestSource(url: string): string {
  return url.replace(/\bw_\d+\b/, "w_2400");
}

function extensionFor(mime: string, url: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  const guess = (url.split("?")[0].split(".").pop() || "").toLowerCase();
  return /^(jpe?g|png|webp|avif)$/.test(guess) ? guess.replace("jpeg", "jpg") : "jpg";
}

async function download(url: string): Promise<{ buf: Buffer; mime: string }> {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (camp-cedar-creek)" } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  const mime = r.headers.get("content-type") || "image/jpeg";
  if (!mime.startsWith("image/")) throw new Error(`not an image (${mime})`);
  return { buf: Buffer.from(await r.arrayBuffer()), mime };
}

async function main() {
  guardProductionEnv();
  const db = await getPayload({ config });

  const res = await db.find({ collection: "sites", pagination: false, depth: 0, limit: 200 });
  const sites = res.docs as any[];

  const foreign = sites.flatMap((s) =>
    ((s.photos as any[]) || []).filter((p) => FOREIGN.test(String(p?.url || "")))
  );
  const unique = new Set(foreign.map((p) => bestSource(String(p.url))));

  console.log(
    `${sites.length} sites, ${foreign.length} borrowed photos, ${unique.size} distinct images.`
  );
  if (!APPLY) {
    console.log("\nDry run. Pass --apply to download and rewrite.");
    for (const s of sites) {
      const n = ((s.photos as any[]) || []).filter((p) => FOREIGN.test(String(p?.url || ""))).length;
      if (n) console.log(`  ${s.slug}: ${n}`);
    }
    return;
  }

  /** source URL -> our URL, so a shared photo is fetched and stored once. */
  const done = new Map<string, string>();
  let uploaded = 0;
  let bytes = 0;
  const failures: string[] = [];

  for (const site of sites) {
    const photos = ((site.photos as any[]) || []).map((p) => ({ ...p }));
    let changed = false;

    for (let i = 0; i < photos.length; i++) {
      const original = String(photos[i]?.url || "");
      if (!FOREIGN.test(original)) continue;

      const source = bestSource(original);
      let ours = done.get(source);

      if (!ours) {
        try {
          let got;
          try {
            got = await download(source);
          } catch {
            // The wider variant may not exist. The one already on the page does.
            got = await download(original);
          }
          const ext = extensionFor(got.mime, source);
          const name = `${site.slug}-${String(i + 1).padStart(2, "0")}.${ext}`;
          const doc: any = await db.create({
            collection: "media",
            data: { alt: photos[i].alt || site.name },
            file: { data: got.buf, name, mimetype: got.mime, size: got.buf.length },
          });
          ours = doc.url;
          done.set(source, ours!);
          uploaded++;
          bytes += got.buf.length;
          console.log(`  + ${name} ${Math.round(got.buf.length / 1024)} KB`);
        } catch (e: any) {
          failures.push(`${site.slug} #${i + 1}: ${e?.message || e}`);
          console.log(`  ! ${site.slug} #${i + 1}: ${e?.message || e}`);
          continue;
        }
      }

      photos[i].url = ours;
      changed = true;
    }

    if (changed) {
      await db.update({ collection: "sites", id: site.id, data: { photos } });
      console.log(`  = ${site.slug} rewritten`);
    }
  }

  console.log(
    `\n${uploaded} images stored, ${(bytes / 1024 / 1024).toFixed(1)} MB.` +
      (failures.length ? `\n${failures.length} failed:\n  ${failures.join("\n  ")}` : "")
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

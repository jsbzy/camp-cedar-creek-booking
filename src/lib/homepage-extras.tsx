import { getDb } from "@/lib/data/db";
import { todayPacific } from "@/lib/cancellation";

/* eslint-disable @typescript-eslint/no-explicit-any */

// The two live pieces the homepage gains from sitting inside the booking app:
// a grid of real sites with real rates, and an honest availability line. Both
// are rendered server-side and injected at markers, so they can never go
// stale and the owners cannot break them from the editor.

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Design tweaks layered over the Webflow stylesheet, kept in one place. */
export const HOMEPAGE_CSS = `
<style id="ccc-tweaks">
  /* Content headings were retagged for a sane outline; these pin the look
     they had. (The one-word divider sections these used to sit between are
     gone as of the refresh, so their rules went with them.) */
  .section_category h3:not([class]), h3.heading-17, h3.is-centered,
  .section_category-events h3.text-align-center, .section_testiomonials h3.text-align-center {
    font-size: 48px; font-weight: 700; line-height: 1.2;
  }
  @media (max-width: 767px) {
    .section_category h3:not([class]), h3.heading-17, h3.is-centered,
    .section_category-events h3.text-align-center, .section_testiomonials h3.text-align-center { font-size: 36px; }
  }

  /* Find your spot */
  .ccc-sites { padding: 84px 5% 92px; background: #fffefe; }
  .ccc-sites-in { max-width: 1240px; margin: 0 auto; }
  .ccc-sites-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin: 0 0 34px; }
  .ccc-sites-head h2 { font-family: Poppins, sans-serif; font-weight: 700; font-size: 48px; line-height: 1.15; margin: 0; color: #1f1f1d; }
  .ccc-sites-head p { font-family: Roboto, sans-serif; font-weight: 300; color: #333; margin: 8px 0 0; font-size: 17px; }
  .ccc-sites-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .ccc-site { display: block; text-decoration: none; color: inherit; }
  .ccc-site-img { position: relative; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 4px; background: #eceae6; }
  .ccc-site-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
  .ccc-site:hover .ccc-site-img img { transform: scale(1.04); }
  .ccc-site-type { position: absolute; left: 12px; top: 12px; background: rgba(255,255,255,.94); color: #1f1f1d;
    font-family: Roboto, sans-serif; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; padding: 5px 10px; border-radius: 3px; }
  .ccc-site-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 14px 0 0; }
  .ccc-site-row h3 { font-family: Poppins, sans-serif; font-weight: 600; font-size: 21px; margin: 0; color: #1f1f1d; }
  .ccc-site-row span { font-family: Roboto, sans-serif; font-size: 15px; color: #1f1f1d; white-space: nowrap; }
  .ccc-site p { font-family: Roboto, sans-serif; font-weight: 300; font-size: 14.5px; line-height: 1.55; color: #555; margin: 6px 0 0; }
  .ccc-sites-all { margin: 40px 0 0; text-align: center; }
  .ccc-sites-all a { font-family: Roboto, sans-serif; font-size: 15px; color: #000; border: 1px solid #000; padding: 13px 30px; border-radius: 4px; text-decoration: none; display: inline-block; }
  .ccc-sites-all a:hover { background: #000; color: #fff; }
  @media (max-width: 991px) { .ccc-sites-grid { grid-template-columns: repeat(2, 1fr); } .ccc-sites-head h2 { font-size: 36px; } }
  @media (max-width: 600px) { .ccc-sites-grid { grid-template-columns: 1fr; } .ccc-sites { padding: 56px 5% 64px; } }

  /* The hero used to sit under a flat 40% black wash so white text could
     read over it. That dimmed the best photograph on the site. A radial fall-off
     behind the words and a soft band under the nav do the same job and leave
     the creek its colour. */
  .section_hero .image-overlay-layer {
    background: radial-gradient(ellipse 64% 58% at 50% 56%, rgba(0,0,0,.72), rgba(0,0,0,.34) 62%, rgba(0,0,0,0) 100%),
                linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,0) 20%) !important;
    opacity: 1 !important;
  }
  .ccc-kicker { font-family: Roboto, sans-serif; font-weight: 500; font-size: 14px; letter-spacing: .16em;
    text-transform: uppercase; color: #fff; text-align: center; margin: 0 0 16px; text-shadow: 0 1px 8px rgba(0,0,0,.6); }
  .section_hero .hero-header { text-shadow: 0 2px 24px rgba(0,0,0,.35); }
  .section_hero p.hero { max-width: 46ch; margin-left: auto; margin-right: auto; font-weight: 400 !important;
    font-size: 20px !important; color: #fff !important; text-shadow: 0 1px 10px rgba(0,0,0,.6); }
  .section_hero .button.is-white { padding: 16px 32px !important; font-size: 16px !important; font-weight: 500 !important; }
  /* The nav button is black on a dark photograph, which is the same as no button. */
  .navbar2_component .button.is-secondary, .navbar2_button-wrapper .button {
    background: rgba(255,255,255,.14) !important; border: 1px solid rgba(255,255,255,.55) !important; color: #fff !important; backdrop-filter: blur(6px); }

  /* Phones: the headline was breaking to two lines and the subline to four.
     One step down on each keeps the whole hero above the fold on a 390px screen. */
  @media (max-width: 600px) {
    .ccc-kicker { font-size: 12px; letter-spacing: .12em; margin-bottom: 12px;
      text-wrap: balance; max-width: 22ch; margin-left: auto; margin-right: auto; }
    .section_hero .hero-header { font-size: 44px !important; line-height: 1.04 !important; }
    .section_hero p.hero { font-size: 17px !important; line-height: 1.45 !important; max-width: 34ch; }
    .section_hero .button.is-white { padding: 14px 26px !important; }
  }

  /* Credential bar: the four things a visitor wants to know before scrolling,
     one line, real numbers, in place of the "Welcome to Camp Cedar Creek!"
     heading and the three dimmed pillar cards it used to sit above. */
  .ccc-cred { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px 34px; padding: 20px 5%;
    border-bottom: 1px solid #e8e6e2; background: #fffefe; font-family: Roboto, sans-serif; font-weight: 300;
    font-size: 14.5px; color: #555; }
  .ccc-cred b { font-weight: 500; color: #1f1f1d; }
  @media (max-width: 600px) { .ccc-cred { gap: 8px 22px; font-size: 13.5px; padding: 16px 5%; } }

  /* Availability line under the hero button */
  .ccc-avail { font-family: Roboto, sans-serif; font-weight: 300; font-size: 15px; color: #fff;
    text-align: center; margin: 18px 0 0; text-shadow: 0 1px 3px rgba(0,0,0,.45); }
  .ccc-avail b { font-weight: 400; }
</style>`;

const TYPE_LABEL: Record<string, string> = {
  tent: "Creekside",
  van_solar: "Van · solar",
  van_power: "Van · power",
  glamping: "Glamping",
  cottage: "Cottage",
};

/** Six sites worth leading with, then a link to the rest. */
export async function sitesGridHtml(): Promise<string> {
  const db = await getDb();
  const res = await db.find({
    collection: "sites",
    where: { status: { equals: "active" } },
    pagination: false,
    depth: 0,
    sort: "sortOrder",
  });
  const all = res.docs as any[];
  if (!all.length) return "";

  // A spread rather than the first six: creekside sites are what people come
  // for, but the barn and the trailer are the things they do not know about.
  const byType = (t: string) => all.filter((s) => s.type === t);
  const picked = [
    ...byType("tent").slice(0, 4),
    ...byType("van_solar").slice(0, 1),
    ...(byType("glamping")[0] ? [byType("glamping")[0]] : byType("van_power").slice(0, 1)),
  ].slice(0, 6);
  const sites = picked.length >= 3 ? picked : all.slice(0, 6);

  const cards = sites
    .map((s) => {
      const photo = (s.photos ?? [])[0]?.url;
      const from = Math.min(s.basePrice ?? 0, s.weekendPrice ?? s.basePrice ?? 0) || s.basePrice;
      return `<a class="ccc-site" href="/sites/${esc(s.type)}/${esc(s.slug)}">
  <div class="ccc-site-img">
    ${photo ? `<img src="${esc(photo)}" alt="${esc(s.name)}" loading="lazy">` : ""}
    <span class="ccc-site-type">${esc(TYPE_LABEL[s.type] ?? s.type)}</span>
  </div>
  <div class="ccc-site-row"><h3>${esc(s.name)}</h3><span>from $${esc(from)}/night</span></div>
  <p>${esc((s.shortDescription ?? "").slice(0, 110))}</p>
</a>`;
    })
    .join("\n");

  return `<section class="ccc-sites"><div class="ccc-sites-in">
  <div class="ccc-sites-head">
    <div>
      <h2>Find your spot</h2>
      <p>Ten creekside campsites, nine van sites at the Blue Barn, and a glamping trailer.</p>
    </div>
  </div>
  <div class="ccc-sites-grid">
${cards}
  </div>
  <div class="ccc-sites-all"><a href="/sites">See all ${all.length} sites</a></div>
</div></section>`;
}

/** How many active sites have nothing on Friday and Saturday night. */
async function weekendOpen(): Promise<{ open: number; total: number } | null> {
  try {
    const db = await getDb();
    const today = todayPacific();
    const [y, m, d] = today.split("-").map(Number);
    const now = new Date(Date.UTC(y, m - 1, d));
    // The Friday and Saturday nights of the coming weekend.
    const dow = now.getUTCDay();
    const toFri = (5 - dow + 7) % 7;
    const fri = new Date(now.getTime() + toFri * 86400000).toISOString().slice(0, 10);
    const sun = new Date(now.getTime() + (toFri + 2) * 86400000).toISOString().slice(0, 10);

    const [sitesRes, bookingsRes, blocksRes] = await Promise.all([
      db.find({ collection: "sites", where: { status: { equals: "active" } }, pagination: false, depth: 0 }),
      db.find({
        collection: "bookings",
        pagination: false,
        depth: 0,
        where: { and: [{ status: { not_in: ["cancelled", "refunded"] } }, { isTest: { not_equals: true } }, { checkIn: { less_than: sun } }, { checkOut: { greater_than: fri } }] },
      }),
      db.find({
        collection: "blocked-dates",
        pagination: false,
        depth: 0,
        where: { and: [{ startDate: { less_than: sun } }, { endDate: { greater_than: fri } }] },
      }),
    ]);
    const taken = new Set<string>([
      ...(bookingsRes.docs as any[]).map((b) => b.siteSlug),
      ...(blocksRes.docs as any[]).map((b) => b.siteSlug),
    ]);
    const total = sitesRes.docs.length;
    const open = (sitesRes.docs as any[]).filter((s) => !taken.has(s.slug)).length;
    return { open, total };
  } catch (err) {
    console.error("[home] availability unavailable:", err);
    return null;
  }
}

/** "8 of 21 sites open this weekend." Only shown when it is true and useful. */
export async function availabilityLineHtml(): Promise<string> {
  const a = await weekendOpen();
  // Nothing to say when none are taken: "21 of 21 open" advertises an empty
  // campground. Nothing to say when none are left either.
  if (!a || !a.total || a.open === 0 || a.open === a.total) return "";
  return `<p class="ccc-avail"><b>${a.open} of ${a.total} sites</b> open this weekend</p>`;
}

/**
 * The line under the hero: what is open, the award, the rating, no fees.
 * Rendered here rather than stored, so the numbers are always live and the
 * owners cannot break it from the editor.
 */
export async function credentialsHtml(): Promise<string> {
  const db = await getDb();
  const [a, settings] = await Promise.all([weekendOpen(), db.findGlobal({ slug: "settings" }).catch(() => null) as Promise<any>]);
  const bits: string[] = [];
  if (a && a.total && a.open > 0 && a.open < a.total) bits.push(`<span><b>${a.open} of ${a.total} sites</b> open this weekend</span>`);
  bits.push(`<span>Hipcamp <b>Best of Oregon</b> finalist, 2023 &amp; 2024</span>`);
  const r = settings?.rating;
  if (r?.average && r?.count) bits.push(`<span><b>${esc(r.average)}</b> from ${esc(r.count)} reviews</span>`);
  bits.push(`<span><b>No booking fees</b></span>`);
  return `<div class="ccc-cred">${bits.join("")}</div>`;
}

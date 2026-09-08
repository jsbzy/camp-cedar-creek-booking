import { getDb } from "@/lib/data/db";
import { getAvailability, checkDateRange } from "@/lib/data/availability";
import { getSiteBySlug } from "@/lib/data/sites";
import { slugProblem, wrapInShell } from "@/lib/page-shell";
import { linksAsText } from "@/lib/links";
import { syncSiteFeeds, describeSync } from "@/lib/data/ical-import";
import { threadForBooking, addMessage, unreadForOwners, markThreadRead } from "@/lib/data/messages";
import { sendHostMessageNotice } from "@/lib/email";
import {
  lawFrom,
  locateText,
  sectionsOf,
  labelOf,
  validatePage,
  validateText,
  type Law,
} from "./validate";

/* eslint-disable @typescript-eslint/no-explicit-any */


export interface ToolResult {
  text: string;
  isError?: boolean;
}
const ok = (text: string): ToolResult => ({ text });
const err = (text: string): ToolResult => ({ text, isError: true });

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || "https://camp-cedar-creek-booking.bzy.design").replace(/\/$/, "");
const money = (n: unknown) => (typeof n === "number" ? `$${n}` : "—");

async function law(): Promise<Law | null> {
  const db = await getDb();
  const g: any = await db.findGlobal({ slug: "brand-guide" });
  return lawFrom(g?.markdown);
}

/**
 * The raw Payload document for a site, whatever its status.
 *
 * Two reasons the connector uses this rather than getSiteBySlug. That one maps
 * ids to strings for the front end, and relationships and updates need the real
 * one. It also filters to active sites, which is right for the website and
 * wrong here: a site is created hidden, so the tools that configure it have to
 * be able to see it. canBook still uses the public lookup, because a hidden
 * site must never be bookable.
 */
async function rawSite(slug: string): Promise<any | null> {
  const db = await getDb();
  const res = await db.find({ collection: "sites", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
  return res.docs[0] ?? null;
}

async function homepage(draft = true): Promise<any | null> {
  const db = await getDb();
  const res = await db.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft });
  return res.docs[0] ?? null;
}

/**
 * Homepage edits take effect. Nothing about this site is public yet, so an
 * approval step in front of the wording was ceremony: it gated the one thing
 * with a full version history while rates and policies went straight through.
 * Every save is still a version, so any of this can be put back.
 */
async function savePage(id: string | number, html: string, notes: string): Promise<void> {
  const db = await getDb();
  await db.update({ collection: "pages", id, data: { html, notes, _status: "published" } });
}

/**
 * Where to go and look at what just changed.
 *
 * An edit that reports "done" and nothing else asks the owner to take it on
 * trust, then go hunting for the page. Every write hands back the public
 * address and the admin one, so checking the work is a click.
 */
function whereToLook(opts: { public?: string; admin?: string }): string {
  const rows = [
    opts.public ? `  See it:  ${appUrl()}${opts.public}` : null,
    opts.admin ? `  Edit it: ${appUrl()}${opts.admin}` : null,
  ].filter(Boolean);
  return rows.length ? `\n\n${rows.join("\n")}` : "";
}

const siteLinks = (site: any) =>
  whereToLook({ public: `/sites/${site.type}/${site.slug}`, admin: `/admin/collections/sites/${site.id}` });

const savedNote = (notes: string) =>
  `Live now at ${appUrl()}/\nNote saved: ${notes}\nEvery version is kept: homepage_history lists them, restore_homepage_version puts one back.`;

/* ------------------------------------------------------------------ */
/* the tools                                                           */
/* ------------------------------------------------------------------ */

export async function callTool(name: string, args: any): Promise<ToolResult> {
  const db = await getDb();

  switch (name) {
    /* ---------------- reading ---------------- */
    case "read_brand_guide": {
      const g: any = await db.findGlobal({ slug: "brand-guide" });
      return g?.markdown ? ok(g.markdown) : err("The Brand Guide is empty.");
    }

    case "links": {
      // Same list the portal renders, so the two cannot drift apart.
      return ok(linksAsText());
    }

    case "list_homepage_sections": {
      const page = await homepage();
      if (!page) return err("No homepage found.");
      const secs = sectionsOf(page.html);
      return ok(
        `${secs.length} sections on the homepage${page._status === "draft" ? " (you are reading a staged draft)" : ""}:\n` +
          secs.map(labelOf).join("\n") +
          "\n\nRead one with read_homepage_section. The header, hero, and footer sit outside these sections; reach them with edit_homepage_text."
      );
    }

    case "read_homepage_section": {
      const page = await homepage();
      if (!page) return err("No homepage found.");
      const s = sectionsOf(page.html)[args.section];
      return s ? ok(s.source) : err(`No section ${args.section}. Use list_homepage_sections.`);
    }

    case "read_homepage": {
      const page = await homepage();
      return page ? ok(page.html) : err("No homepage found.");
    }

    case "list_sites": {
      const res = await db.find({ collection: "sites", pagination: false, depth: 0, sort: "sortOrder" });
      return ok(
        (res.docs as any[])
          .map(
            (s) =>
              `${s.slug.padEnd(22)} ${String(s.name).padEnd(22)} ${s.type.padEnd(11)} ${money(s.basePrice)}/${money(s.weekendPrice)} wknd  max ${s.maxGuests}  ${s.status}`
          )
          .join("\n") + "\n\n(slug · name · type · weekday/weekend rate · max guests · status)"
      );
    }

    case "read_site": {
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}". Use list_sites.`);
      return ok(JSON.stringify(site, null, 2));
    }

    case "check_availability": {
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}".`);
      const days = await getAvailability(site, args.start, args.end);
      return ok(days.map((d: any) => `${d.date}  ${d.available ? "open" : "BOOKED/BLOCKED"}  ${money(d.price)}`).join("\n"));
    }

    case "list_bookings": {
      const where: any = { and: [] };
      if (args.from) where.and.push({ checkOut: { greater_than: args.from } });
      if (args.to) where.and.push({ checkIn: { less_than: args.to } });
      if (args.slug) where.and.push({ siteSlug: { equals: args.slug } });
      if (!args.include_cancelled) where.and.push({ status: { not_in: ["cancelled", "refunded"] } });
      const res = await db.find({
        collection: "bookings",
        pagination: false,
        depth: 0,
        sort: "checkIn",
        where: where.and.length ? where : undefined,
      });
      const rows = (res.docs as any[]).map(
        (b) =>
          `${b.checkIn} → ${b.checkOut}  ${String(b.siteName).padEnd(20)} ${`${b.guest?.firstName ?? ""} ${b.guest?.lastName ?? ""}`.trim().padEnd(22)} ${String(b.status).padEnd(10)} ${money(b.total)}  ${b.confirmationCode}`
      );
      return ok(rows.length ? rows.join("\n") : "No bookings match.");
    }

    case "read_booking": {
      const res = await db.find({
        collection: "bookings",
        where: { confirmationCode: { equals: args.code } },
        limit: 1,
        depth: 0,
      });
      const b: any = res.docs[0];
      return b ? ok(JSON.stringify(b, null, 2)) : err(`No booking ${args.code}.`);
    }

    case "list_addons": {
      const res = await db.find({ collection: "addons", pagination: false, depth: 0, sort: "sortOrder" });
      return ok(
        (res.docs as any[])
          .map(
            (a) =>
              `${String(a.id).padEnd(3)} ${String(a.name).padEnd(20)} ${money(a.price)}${a.perNight ? "/night" : " per stay"}  max ${a.maxQuantity}  ${a.active ? "on" : "OFF"}  ${(a.applicableSiteTypes || []).join(",")}`
          )
          .join("\n")
      );
    }

    case "read_settings": {
      const s: any = await db.findGlobal({ slug: "settings" });
      return ok(JSON.stringify(s, null, 2));
    }

    case "list_requests": {
      const res = await db.find({ collection: "requests", pagination: false, depth: 0, sort: "-createdAt", limit: 50 });
      const rows = (res.docs as any[]).map(
        (r) => `${String(r.id).padEnd(4)} ${String(r.status).padEnd(9)} ${String(r.size).padEnd(8)} ${r.title}`
      );
      return ok(rows.length ? rows.join("\n") : "No requests yet.");
    }

    case "homepage_history": {
      const page = await homepage();
      if (!page) return err("No homepage found.");
      const res = await db.findVersions({
        collection: "pages",
        where: { parent: { equals: page.id } },
        limit: 25,
        sort: "-updatedAt",
        depth: 0,
      });
      const rows = (res.docs as any[]).map(
        (v) => `${String(v.id).padEnd(38)} ${String(v.updatedAt).slice(0, 16).replace("T", " ")}  ${v.version?._status ?? ""}  ${v.version?.notes ?? ""}`
      );
      return ok(
        (rows.length ? rows.join("\n") : "No versions yet.") +
          `\n\nCurrent: ${page._status}. Restore one with restore_homepage_version.`
      );
    }

    /* ---------------- homepage edits ---------------- */
    case "edit_homepage_text":
    case "update_homepage_section": {
      const L = await law();
      if (!L) return err("The Brand Guide is missing or its LAW block is unreadable; refusing all writes.");
      const page = await homepage();
      if (!page) return err("No homepage found.");
      const old: string = page.html;
      let next: string;
      let fuzzy = "";

      if (name === "update_homepage_section") {
        const s = sectionsOf(old)[args.section];
        if (!s) return err(`No section ${args.section}. Use list_homepage_sections.`);
        const sec = String(args.html).trim();
        if (!/^<section[\s>]/i.test(sec) || !/<\/section>\s*$/i.test(sec))
          return err("The replacement must be one complete <section ...>...</section> element.");
        next = old.slice(0, s.start) + sec + old.slice(s.end);
      } else {
        if (!args.find) return err("edit_homepage_text needs a non-empty find.");
        const m = locateText(old, args.find);
        if (m.count === 0)
          return err(
            "That text is not on the page.\nRead the section first and copy the string from it. This page is Webflow output: it is full of non-breaking spaces, &amp; and &#x27; entities, and typographic quotes, none of which survive being retyped by hand."
          );
        if (m.count > 1)
          return err(`That text appears ${m.count} times. Give a longer, unique string so the edit cannot change more than you mean.`);
        next = old.slice(0, m.start) + args.replace + old.slice(m.end);
        if (m.loose) fuzzy = "\n(Matched text differing only in whitespace; the replacement went in at the exact span.)";
      }

      const problems = validatePage(L, next, old);
      if (problems.length)
        return err(`REJECTED (${problems.length}):\n- ${problems.join("\n- ")}\nRead the Brand Guide for the rules, fix the edit, and resubmit.`);
      if (next === old) return ok("No change: the page already reads exactly that.");

      const notes = args.note || "Edit via connector";
      await savePage(page.id, next, notes);
      return ok(`Done.${fuzzy}\n${savedNote(notes)}` + whereToLook({ public: "/", admin: `/admin/collections/pages/${page.id}` }));
    }

    case "publish_homepage": {
      const draft = await homepage(true);
      if (!draft) return err("No homepage found.");
      if (draft._status === "published") return ok("Nothing staged: the homepage is already published as it stands.");
      const L = await law();
      const live = await homepage(false);
      if (L && live) {
        const problems = validatePage(L, draft.html, live.html);
        if (problems.length)
          return err(
            `REFUSING TO PUBLISH (${problems.length}):\n- ${problems.join("\n- ")}\nThe staged copy no longer passes the Brand Guide, most likely because the guide changed after the edit was staged.`
          );
      }
      await db.update({ collection: "pages", id: draft.id, data: { _status: "published" } });
      return ok(`Published. ${appUrl()}/ now serves it. Every previous version is kept.`);
    }

    case "discard_homepage_draft": {
      const live = await homepage(false);
      if (!live) return err("No published homepage to fall back to.");
      await db.update({ collection: "pages", id: live.id, data: { html: live.html, notes: "Draft discarded" } });
      return ok("Staged edits discarded. The live homepage was never touched.");
    }

    case "restore_homepage_version": {
      const page = await homepage();
      if (!page) return err("No homepage found.");
      await db.restoreVersion({ collection: "pages", id: args.version });
      const back = await homepage(true);
      if (back) await db.update({ collection: "pages", id: back.id, data: { _status: "published" } });
      return ok(`Restored version ${args.version}. ${appUrl()}/ serves it now. The version you replaced is still in the history.`);
    }

    /* ---------------- adding things ---------------- */
    case "list_pages": {
      const res = await db.find({ collection: "pages", pagination: false, depth: 0, sort: "slug" });
      const rows = (res.docs as any[]).map(
        (p) => `${String(p.slug).padEnd(20)} ${String(p._status ?? "").padEnd(10)} ${p.slug === "home" ? appUrl() + "/" : appUrl() + "/" + p.slug}`
      );
      return ok(rows.join("\n") + "\n\nThe homepage has its own tools. Others: read_page, edit_page_text, create_page.");
    }

    case "read_page": {
      const res = await db.find({ collection: "pages", where: { slug: { equals: args.slug } }, limit: 1, depth: 0 });
      const p: any = res.docs[0];
      if (!p) return err(`No page "${args.slug}". Use list_pages.`);
      return ok(p.html);
    }

    case "create_page": {
      const L = await law();
      if (!L) return err("The Brand Guide is missing or its LAW block is unreadable; refusing all writes.");
      const slug = String(args.slug || "").trim().toLowerCase();
      const bad = slugProblem(slug);
      if (bad) return err(bad);
      const clash = await db.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
      if (clash.docs.length) return err(`There is already a page at /${slug}. Edit it with edit_page_text.`);
      if (!args.title) return err("A page needs a title: it goes in the browser tab and the search result.");
      if (!args.html) return err("A page needs its content, as HTML for the body: headings, paragraphs, images.");

      // Body content only, so it can sit inside the homepage's nav and footer.
      if (/<(html|head|body|script|iframe)\b/i.test(args.html))
        return err("Give the body content only: headings, paragraphs, images, links. The page is placed inside the site's own header and footer, so it must not carry its own.");
      const problems = validateText(L, args.html);
      if (problems.length) return err(`REFUSED (${problems.length}):\n- ${problems.join("\n- ")}`);

      const home = await homepage(false);
      if (!home?.html || !wrapInShell(home.html, args.html, args.title))
        return err("The homepage is not readable, so there is no header and footer to put this page inside. Nothing was created.");

      const doc: any = await db.create({
        collection: "pages",
        data: { title: args.title, slug, html: args.html, notes: args.note || "Created through the connector", _status: "published" },
      });
      return ok(
        `Created "${doc.title}", live now, inside the site's own header and footer.\n\n` +
          "Nothing links to it yet. Say where it should appear in the navigation and that can be added to the homepage." +
          whereToLook({ public: `/${slug}`, admin: `/admin/collections/pages/${doc.id}` })
      );
    }

    case "edit_page_text": {
      const L = await law();
      if (!L) return err("The Brand Guide is missing or its LAW block is unreadable; refusing all writes.");
      const res = await db.find({ collection: "pages", where: { slug: { equals: args.slug } }, limit: 1, depth: 0 });
      const p: any = res.docs[0];
      if (!p) return err(`No page "${args.slug}". Use list_pages.`);
      if (p.slug === "home") return err("The homepage has its own tools: edit_homepage_text.");
      const hit = locateText(p.html, args.find);
      if (hit.count === 0) return err(`"${args.find}" is not on that page. Read it with read_page and copy the wording exactly.`);
      if (hit.count > 1) return err(`"${args.find}" appears ${hit.count} times. Include enough of the sentence to be unique.`);
      const next = p.html.slice(0, hit.start!) + args.replace + p.html.slice(hit.end!);
      const problems = validateText(L, next);
      if (problems.length) return err(`REFUSED (${problems.length}):\n- ${problems.join("\n- ")}`);
      await db.update({ collection: "pages", id: p.id, data: { html: next, notes: args.note || "Edited through the connector", _status: "published" } });
      return ok(`Done. Every version is kept.` + whereToLook({ public: `/${p.slug}`, admin: `/admin/collections/pages/${p.id}` }));
    }

    case "create_site": {
      const L = await law();
      if (!L) return err("The Brand Guide is missing or its LAW block is unreadable; refusing all writes.");
      const slug = String(args.slug || "").trim().toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return err("A slug is lower case letters, numbers and hyphens, like beaver-pond.");
      const types = ["tent", "van_solar", "van_power", "glamping"];
      if (!types.includes(args.type)) return err(`type must be one of: ${types.join(", ")}.`);
      if (await rawSite(slug)) return err(`There is already a site "${slug}". Change it with update_site.`);
      if (!args.name) return err("A site needs a name.");
      const rate = Number(args.weekday);
      if (!Number.isFinite(rate) || rate < 0 || rate > 2000) return err("weekday must be a nightly rate in whole dollars, 0 to 2000.");
      const weekend = args.weekend === undefined ? rate : Number(args.weekend);
      if (!Number.isFinite(weekend) || weekend < 0 || weekend > 2000) return err("weekend must be a nightly rate in whole dollars, 0 to 2000.");
      const guests = Number(args.maxGuests ?? 4);
      if (!Number.isFinite(guests) || guests < 1 || guests > 50) return err("maxGuests must be between 1 and 50.");
      for (const [f, v] of [["shortDescription", args.shortDescription], ["description", args.description]] as const) {
        if (!v) continue;
        const problems = validateText(L, String(v));
        if (problems.length) return err(`REFUSED, ${f} (${problems.length}):\n- ${problems.join("\n- ")}`);
      }

      // Created hidden on purpose. A new site has no photos and no wording
      // yet, and a half-finished one on the booking page is worse than none.
      const doc: any = await db.create({
        collection: "sites",
        data: {
          slug,
          name: args.name,
          type: args.type,
          status: "inactive",
          shortDescription: args.shortDescription || "",
          description: args.description || "",
          basePrice: rate,
          weekendPrice: weekend,
          maxGuests: guests,
          sortOrder: args.sortOrder ?? 99,
        },
      });
      return ok(
        `Created "${doc.name}" (${slug}) at ${money(rate)} weekday, ${money(weekend)} weekend, up to ${guests} guests.\n\n` +
          "It is HIDDEN, so it is not bookable and not on the website yet. Add photos and wording with update_site and upload_image, " +
          "then list it by setting its status to active." +
          whereToLook({ admin: `/admin/collections/sites/${doc.id}` })
      );
    }

    /* ---------------- guest messages ---------------- */
    case "list_messages": {
      const docs = await unreadForOwners(30);
      if (!docs.length) return ok("Nothing waiting. Every guest message has been read.");
      const rows = docs.map((m: any) => {
        const b = m.booking ?? {};
        const who = [b.guest?.firstName, b.guest?.lastName].filter(Boolean).join(" ") || "A guest";
        const body = String(m.body ?? "").replace(/\s+/g, " ");
        return `${who} about ${b.siteName ?? "a stay"} (${b.id ?? "?"}), ${String(m.createdAt).slice(0, 16).replace("T", " ")}\n    ${body.slice(0, 160)}${body.length > 160 ? "…" : ""}`;
      });
      return ok(
        `${docs.length} message${docs.length === 1 ? "" : "s"} waiting:\n\n` +
          rows.join("\n\n") +
          `\n\nRead the whole conversation with read_thread, answer with reply_to_guest.`
      );
    }

    case "read_thread": {
      const res = await db.find({ collection: "bookings", where: { confirmationCode: { equals: args.code } }, limit: 1, depth: 0 });
      const b: any = res.docs[0];
      if (!b) return err(`No booking ${args.code}. Use list_bookings.`);
      const thread = await threadForBooking(b.id);
      if (!thread.length) return ok(`No messages on ${args.code} yet.`);
      const who = [b.guest?.firstName, b.guest?.lastName].filter(Boolean).join(" ") || "Guest";
      return ok(
        `${who}, ${b.siteName}, ${b.checkIn}:\n\n` +
          thread
            .map((m) => `  ${m.from === "guest" ? who : "Us"} (${String(m.createdAt).slice(0, 16).replace("T", " ")}):\n    ${m.body}`)
            .join("\n\n")
      );
    }

    case "reply_to_guest": {
      const body = String(args.body ?? "").trim();
      if (!body) return err("Nothing to send. What should the guest be told?");
      const res = await db.find({ collection: "bookings", where: { confirmationCode: { equals: args.code } }, limit: 1, depth: 0 });
      const b: any = res.docs[0];
      if (!b) return err(`No booking ${args.code}. Use list_bookings.`);

      await addMessage({
        bookingId: b.id,
        guestId: b.guestProfile ?? null,
        from: "host",
        body,
        authorName: args.from || "Camp Cedar Creek",
        isTest: !!b.isTest,
      });
      // Reading a thread you have just answered is the point at which it stops
      // being unread, so clear it here rather than making anyone tick a box.
      await markThreadRead(b.id);

      const manageUrl = `${appUrl()}/booking/${b.magicLinkToken}`;
      let delivered = "";
      if (!b.isTest) {
        const id = await sendHostMessageNotice({ ...b, id: b.confirmationCode } as any, body, manageUrl);
        delivered = id ? " They have been emailed." : " The email did not go out, so they will only see it if they open the page.";
      }
      return ok(`Sent to ${b.guest?.firstName || "the guest"}.${delivered}` + whereToLook({ public: `/booking/${b.magicLinkToken}` }));
    }

    /* ---------------- outside calendars ---------------- */
    case "read_ical_feeds": {
      const site = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}". Use list_sites.`);
      const feeds = (site.icalImportUrls ?? []) as any[];
      const out = feeds.length
        ? feeds.map((f, i) => `  ${i + 1}. ${f.platform ?? "other"}  ${f.url}`).join("\n")
        : "  (none)";
      return ok(
        `Calendars being imported into ${site.name}:\n${out}\n\n` +
          `Last read: ${site.icalLastSynced ?? "never"}\n` +
          `Last result: ${site.icalLastError || "nothing reported"}\n\n` +
          `Our own feed, for pasting into Hipcamp or Airbnb:\n  ${appUrl()}/api/ical/${site.slug}.ics`
      );
    }

    case "set_ical_feeds": {
      const site = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}". Use list_sites.`);
      const raw = Array.isArray(args.feeds) ? args.feeds : [];
      const feeds: { platform: "hipcamp" | "airbnb" | "other"; url: string }[] = [];
      for (const f of raw) {
        const url = String(f?.url ?? "").trim();
        if (!url) continue;
        // webcal:// is what Apple and Google hand out; the importer normalises it.
        if (!/^(https?|webcal):\/\/\S+$/i.test(url)) return err(`"${url}" is not a calendar address. It should start with https:// or webcal:// and usually ends in .ics.`);
        const platform = (["hipcamp", "airbnb", "other"].includes(f?.platform) ? f.platform : "other") as "hipcamp" | "airbnb" | "other";
        feeds.push({ platform, url });
      }

      // Replacing with nothing is how you disconnect, so it is allowed, but it
      // should be a decision rather than an empty argument slipping through.
      if (!feeds.length && args.disconnect !== true)
        return err("No calendar addresses given. To disconnect the ones already there, pass disconnect: true.");

      await db.update({ collection: "sites", id: site.id, data: { icalImportUrls: feeds } });
      if (!feeds.length) return ok(`Disconnected every outside calendar from ${site.name}. Nothing from Hipcamp or Airbnb will block its dates now.` + siteLinks(site));

      // Saving triggers the same import the cron runs, but that happens after
      // the response. Run it here too so the answer says what actually landed.
      let report = "";
      try {
        const sync = await syncSiteFeeds({ slug: site.slug, icalImportUrls: feeds });
        report = describeSync(sync) || "no dates to block yet";
      } catch (e: any) {
        report = `could not read it just now: ${e?.message ?? e}`;
      }
      return ok(
        `${site.name} is now importing ${feeds.length} calendar${feeds.length === 1 ? "" : "s"}.\n` +
          `First read: ${report}\n\n` +
          `It refreshes every 15 minutes from now on. Only dates from today forward are imported, and they arrive as blocked dates: ` +
          `nights nobody can book here. Guest names, emails and amounts do not travel over a calendar feed, so past stays are not backfilled.`
      );
    }

    /* ---------------- history and undo ---------------- */
    // Everything anyone changes is recorded. These two turn that record into
    // something usable in a sentence: "what changed this week", "put it back".
    case "recent_changes": {
      const days = Math.min(Math.max(Number(args.days) || 7, 1), 90);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const rows: string[] = [];
      for (const collection of ["pages", "sites", "addons", "blocked-dates"] as const) {
        const res = await db.findVersions({
          collection,
          where: { updatedAt: { greater_than: since } },
          limit: 40,
          sort: "-updatedAt",
          depth: 0,
        });
        for (const v of res.docs as any[]) {
          const d = v.version ?? {};
          const label = d.name ?? d.title ?? d.slug ?? d.siteSlug ?? String(v.parent);
          rows.push(
            `${String(v.updatedAt).slice(0, 16).replace("T", " ")}  ${collection.padEnd(13)} ${String(label).slice(0, 26).padEnd(28)} ${String(v.id)}`
          );
        }
      }
      rows.sort().reverse();
      if (!rows.length) return ok(`Nothing changed in the last ${days} days.`);
      return ok(
        `Changes in the last ${days} days, newest first.\nDate              What          Which                        Version id\n` +
          rows.slice(0, 60).join("\n") +
          `\n\nPut one back with restore_version, passing the collection and the version id.`
      );
    }

    case "restore_version": {
      const collection = String(args.collection || "");
      const allowed = ["pages", "sites", "addons", "blocked-dates"];
      if (!allowed.includes(collection))
        return err(`restore_version works on ${allowed.join(", ")}. Bookings are never rewritten; change their status instead.`);
      if (!args.version) return err("Which version? Use recent_changes to find its id.");
      try {
        await db.restoreVersion({ collection: collection as any, id: args.version });
      } catch (e: any) {
        return err(`Could not restore that version: ${e?.message ?? e}. Check the id against recent_changes.`);
      }
      if (collection === "pages") {
        const back = await homepage(true);
        if (back) await db.update({ collection: "pages", id: back.id, data: { _status: "published" } });
      }
      return ok(`Restored. The state you just replaced is still in the history, so this is itself undoable.`);
    }

    /* ---------------- site + operations (instant) ---------------- */
    case "update_site": {
      const L = await law();
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}". Use list_sites.`);
      const data: any = {};
      for (const f of ["name", "shortDescription", "description"]) if (args[f] !== undefined) data[f] = args[f];
      if (args.maxGuests !== undefined) data.maxGuests = args.maxGuests;
      if (args.status !== undefined) data.status = args.status;
      if (args.amenities !== undefined) data.amenities = (args.amenities as string[]).map((a) => ({ amenity: a }));
      if (args.photos !== undefined) data.photos = (args.photos as string[]).map((url) => ({ url }));
      if (!Object.keys(data).length) return err("Nothing to change. Pass a field such as description or photos.");
      const raw = await rawSite(args.slug);
      if (!raw) return err(`No site "${args.slug}".`);
      if (L) {
        const problems = [
          ...validateText(L, String(data.description ?? ""), site.description ?? ""),
          ...validateText(L, String(data.shortDescription ?? ""), site.shortDescription ?? ""),
        ];
        if (problems.length) return err(`REJECTED (${problems.length}):\n- ${problems.join("\n- ")}`);
      }
      await db.update({ collection: "sites", id: raw.id, data });
      return ok(`${site.name} updated: ${Object.keys(data).join(", ")}. Live now.` + siteLinks(site));
    }

    case "set_rates": {
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}".`);
      const data: any = {};
      if (args.weekday !== undefined) data.basePrice = args.weekday;
      if (args.weekend !== undefined) data.weekendPrice = args.weekend;
      if (!Object.keys(data).length) return err("Pass weekday and/or weekend.");
      for (const [k, v] of Object.entries(data))
        if (typeof v !== "number" || v < 0 || v > 2000) return err(`${k} of ${v} looks wrong. Rates are whole dollars, 0 to 2000.`);
      const rawRate = await rawSite(args.slug);
      if (!rawRate) return err(`No site "${args.slug}".`);
      await db.update({ collection: "sites", id: rawRate.id, data });
      const after: any = await rawSite(args.slug);
      return ok(
        `${site.name}: weekday ${money(after.basePrice)}, weekend ${money(after.weekendPrice)}. Live now. Existing bookings keep the price they were made at.` +
          siteLinks(after)
      );
    }

    case "block_dates": {
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}".`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(args.start) || !/^\d{4}-\d{2}-\d{2}$/.test(args.end))
        return err("Dates are YYYY-MM-DD. End is the morning the block lifts, like a checkout date.");
      if (args.end <= args.start) return err("End must be after start.");
      const rawBlock = await rawSite(args.slug);
      await db.create({
        collection: "blocked-dates",
        data: {
          site: rawBlock?.id,
          siteSlug: site.slug,
          startDate: args.start,
          endDate: args.end,
          reason: args.reason || "owner_block",
          source: "manual",
          note: args.note,
        },
      });
      return ok(`${site.name} is blocked ${args.start} to ${args.end} (checkout morning). Off the public calendar now.` + siteLinks(site));
    }

    case "unblock_dates": {
      const site: any = await rawSite(args.slug);
      if (!site) return err(`No site "${args.slug}".`);
      const res = await db.find({
        collection: "blocked-dates",
        pagination: false,
        depth: 0,
        where: {
          and: [
            { siteSlug: { equals: site.slug } },
            { source: { equals: "manual" } },
            { startDate: { less_than: args.end } },
            { endDate: { greater_than: args.start } },
          ],
        },
      });
      if (!res.docs.length) return err("No manual block overlaps those dates. Blocks imported from Hipcamp are removed on Hipcamp.");
      for (const d of res.docs as any[]) await db.delete({ collection: "blocked-dates", id: d.id });
      return ok(`Removed ${res.docs.length} block${res.docs.length === 1 ? "" : "s"} on ${site.name}. Those dates are bookable again.` + siteLinks(site));
    }

    case "update_addon": {
      const res = await db.find({ collection: "addons", where: { name: { like: args.name } }, limit: 2, depth: 0 });
      if (!res.docs.length) return err(`No add-on matching "${args.name}". Use list_addons.`);
      if (res.docs.length > 1) return err(`"${args.name}" matches more than one add-on. Be more specific.`);
      const a: any = res.docs[0];
      const data: any = {};
      for (const f of ["price", "maxQuantity"]) if (args[f] !== undefined) data[f] = args[f];
      if (args.description !== undefined) data.description = args.description;
      if (args.active !== undefined) data.active = args.active;
      if (args.perNight !== undefined) data.perNight = args.perNight;
      if (!Object.keys(data).length) return err("Nothing to change.");
      if (data.price !== undefined && (typeof data.price !== "number" || data.price < 0 || data.price > 500))
        return err("Add-on prices are whole dollars, 0 to 500.");
      await db.update({ collection: "addons", id: a.id, data });
      return ok(`${a.name} updated: ${Object.keys(data).join(", ")}. Live now.`);
    }

    case "update_settings": {
      const L = await law();
      const data: any = {};
      for (const f of ["checkInTime", "checkOutTime", "quietHours", "cancellationPolicy"])
        if (args[f] !== undefined) data[f] = args[f];
      if (args.houseRules !== undefined) data.houseRules = (args.houseRules as string[]).map((rule) => ({ rule }));
      if (!Object.keys(data).length) return err("Nothing to change.");
      if (L && data.cancellationPolicy) {
        const problems = validateText(L, data.cancellationPolicy);
        if (problems.length) return err(`REJECTED:\n- ${problems.join("\n- ")}`);
      }
      await db.updateGlobal({ slug: "settings", data });
      return ok(`Settings updated: ${Object.keys(data).join(", ")}. Live now.` + whereToLook({ admin: "/admin/globals/settings" }));
    }

    case "upload_image": {
      if (!args.filename) return err("upload_image needs a filename.");
      let buf: Buffer;
      if (args.data) {
        buf = Buffer.from(String(args.data).replace(/^data:[^,]+,/, ""), "base64");
      } else if (args.url) {
        const r = await fetch(args.url);
        if (!r.ok) return err(`Could not fetch ${args.url}: ${r.status}`);
        buf = Buffer.from(await r.arrayBuffer());
      } else {
        return err("Pass the image as data (base64) or url.");
      }
      if (buf.length > 12 * 1024 * 1024) return err("That image is over 12 MB. Resize it first.");
      const ext = (args.filename.split(".").pop() || "jpg").toLowerCase();
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      const doc: any = await db.create({
        collection: "media",
        data: { alt: args.alt || args.filename },
        file: { data: buf, name: args.filename, mimetype: mime, size: buf.length },
      });
      return ok(
        `Uploaded ${args.filename} (${Math.round(buf.length / 1024)} KB).\nURL: ${doc.url}\nAdd it to a site with update_site(slug, photos: [...existing, "${doc.url}"]).`
      );
    }

    case "add_request": {
      if (!args.title) return err("add_request needs a title.");
      const doc: any = await db.create({
        collection: "requests",
        data: {
          title: args.title,
          detail: args.detail,
          requestedBy: args.requested_by || "connector",
          size: args.size || "unknown",
          status: "new",
        },
      });
      return ok(
        `Written down as request #${doc.id}: "${args.title}".\nJeff sees it in the admin under Requests. Nothing was built or changed.`
      );
    }

    /* ---------------- admin only ---------------- */
    case "update_brand_guide": {
      if (!lawFrom(args.markdown))
        return err("REJECTED: the new Brand Guide has no parseable ```json LAW block; the validator would go blind.");
      await db.updateGlobal({ slug: "brand-guide", data: { markdown: args.markdown } });
      return ok("Brand Guide updated. The new rules are enforced on the next edit.");
    }

    case "set_booking_status": {
      const res = await db.find({ collection: "bookings", where: { confirmationCode: { equals: args.code } }, limit: 1, depth: 0 });
      const b: any = res.docs[0];
      if (!b) return err(`No booking ${args.code}.`);
      const allowed = ["pending", "confirmed", "cancelled", "completed", "refunded"];
      if (!allowed.includes(args.status)) return err(`Status must be one of: ${allowed.join(", ")}.`);
      await db.update({
        collection: "bookings",
        id: b.id,
        data: { status: args.status, cancellationReason: args.reason ?? b.cancellationReason },
      });
      return ok(`${args.code} is now ${args.status}. The booking itself is kept; nothing is deleted.` + whereToLook({ admin: `/admin/collections/bookings/${b.id}` }));
    }

    case "update_request": {
      const data: any = {};
      for (const f of ["status", "size", "response"]) if (args[f] !== undefined) data[f] = args[f];
      if (!Object.keys(data).length) return err("Nothing to change.");
      await db.update({ collection: "requests", id: args.id, data });
      return ok(`Request #${args.id} updated: ${Object.keys(data).join(", ")}.`);
    }

    case "create_addon": {
      const doc: any = await db.create({
        collection: "addons",
        data: {
          name: args.name,
          description: args.description,
          price: args.price,
          perNight: !!args.perNight,
          maxQuantity: args.maxQuantity ?? 1,
          applicableSiteTypes: args.siteTypes ?? ["tent", "van_solar", "van_power", "glamping"],
          active: true,
          sortOrder: args.sortOrder ?? 99,
        },
      });
      return ok(`Created add-on "${doc.name}" at ${money(doc.price)}${doc.perNight ? "/night" : " per stay"}. Live now.` + whereToLook({ admin: `/admin/collections/addons/${doc.id}` }));
    }

    default:
      return err(`Unknown tool: ${name}`);
  }
}

/** Availability is read-only but worth exposing for "can they book this?". */
export async function canBook(slug: string, start: string, end: string): Promise<boolean> {
  const site: any = await getSiteBySlug(slug);
  if (!site) return false;
  return checkDateRange(site, start, end);
}

import { getDb } from "@/lib/data/db";
import { getAvailability, checkDateRange } from "@/lib/data/availability";
import { getSiteBySlug } from "@/lib/data/sites";
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

export type Tier = "admin" | "editor";

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
 * The raw Payload document for a site. getSiteBySlug maps ids to strings for
 * the front end; relationships and updates need the real one, and passing the
 * string fails with "The following field is invalid: Site".
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

/** Save the page as a draft. Publishing is a separate, admin-only act. */
async function saveDraft(id: string | number, html: string, notes: string): Promise<void> {
  const db = await getDb();
  await db.update({ collection: "pages", id, data: { html, notes }, draft: true });
}

const stagedNote = (notes: string) =>
  `Staged, not live.\nPreview: ${appUrl()}/preview\nNote saved: ${notes}\nAn admin publishes it with publish_homepage.`;

/* ------------------------------------------------------------------ */
/* the tools                                                           */
/* ------------------------------------------------------------------ */

export async function callTool(name: string, args: any, tier: Tier): Promise<ToolResult> {
  const db = await getDb();
  const adminOnly = () => err(`${name} needs the admin connector. Ask Jeff, or file it with add_request.`);

  switch (name) {
    /* ---------------- reading ---------------- */
    case "read_brand_guide": {
      const g: any = await db.findGlobal({ slug: "brand-guide" });
      return g?.markdown ? ok(g.markdown) : err("The Brand Guide is empty.");
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
      const site: any = await getSiteBySlug(args.slug);
      if (!site) return err(`No site "${args.slug}". Use list_sites.`);
      return ok(JSON.stringify(site, null, 2));
    }

    case "check_availability": {
      const site: any = await getSiteBySlug(args.slug);
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

    /* ---------------- homepage edits (stage) ---------------- */
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
      await saveDraft(page.id, next, notes);
      return ok(`Accepted.${fuzzy}\n${stagedNote(notes)}`);
    }

    case "publish_homepage": {
      if (tier !== "admin") return adminOnly();
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
      if (tier !== "admin") return adminOnly();
      const live = await homepage(false);
      if (!live) return err("No published homepage to fall back to.");
      await db.update({ collection: "pages", id: live.id, data: { html: live.html, notes: "Draft discarded" } });
      return ok("Staged edits discarded. The live homepage was never touched.");
    }

    case "restore_homepage_version": {
      if (tier !== "admin") return adminOnly();
      const page = await homepage();
      if (!page) return err("No homepage found.");
      await db.restoreVersion({ collection: "pages", id: args.version });
      return ok(`Restored version ${args.version} as a draft. Review it, then publish_homepage.`);
    }

    /* ---------------- site + operations (instant) ---------------- */
    case "update_site": {
      const L = await law();
      const site: any = await getSiteBySlug(args.slug);
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
      return ok(`${site.name} updated: ${Object.keys(data).join(", ")}. Live now at ${appUrl()}/sites/${site.type}/${site.slug}`);
    }

    case "set_rates": {
      const site: any = await getSiteBySlug(args.slug);
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
      const after: any = await getSiteBySlug(args.slug);
      return ok(
        `${site.name}: weekday ${money(after.basePrice)}, weekend ${money(after.weekendPrice)}. Live now. Existing bookings keep the price they were made at.`
      );
    }

    case "block_dates": {
      const site: any = await getSiteBySlug(args.slug);
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
      return ok(`${site.name} is blocked ${args.start} to ${args.end} (checkout morning). Off the public calendar now.`);
    }

    case "unblock_dates": {
      const site: any = await getSiteBySlug(args.slug);
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
      return ok(`Removed ${res.docs.length} block${res.docs.length === 1 ? "" : "s"} on ${site.name}. Those dates are bookable again.`);
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
      return ok(`Settings updated: ${Object.keys(data).join(", ")}. Live now.`);
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
          requestedBy: args.requested_by || tier,
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
      if (tier !== "admin") return adminOnly();
      if (!lawFrom(args.markdown))
        return err("REJECTED: the new Brand Guide has no parseable ```json LAW block; the validator would go blind.");
      await db.updateGlobal({ slug: "brand-guide", data: { markdown: args.markdown } });
      return ok("Brand Guide updated. The new rules are enforced on the next edit.");
    }

    case "set_booking_status": {
      if (tier !== "admin") return adminOnly();
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
      return ok(`${args.code} is now ${args.status}. The booking itself is kept; nothing is deleted.`);
    }

    case "update_request": {
      if (tier !== "admin") return adminOnly();
      const data: any = {};
      for (const f of ["status", "size", "response"]) if (args[f] !== undefined) data[f] = args[f];
      if (!Object.keys(data).length) return err("Nothing to change.");
      await db.update({ collection: "requests", id: args.id, data });
      return ok(`Request #${args.id} updated: ${Object.keys(data).join(", ")}.`);
    }

    case "create_addon": {
      if (tier !== "admin") return adminOnly();
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
      return ok(`Created add-on "${doc.name}" at ${money(doc.price)}${doc.perNight ? "/night" : " per stay"}. Live now.`);
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

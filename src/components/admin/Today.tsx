import React from "react";
import type { AdminViewServerProps } from "payload";
import { Gutter } from "@payloadcms/ui";
import { todayPacific } from "@/lib/cancellation";

// Note: a `dashboard` override is rendered inside the admin shell already, so
// it must NOT wrap itself in DefaultTemplate the way a custom route view does.
// Doing that draws the header, sidebar, and avatar twice.

/* eslint-disable @typescript-eslint/no-explicit-any */

// What the owners open in the morning. One sentence that says whether anything
// is happening, then only the things that actually are: who needs an answer,
// who is on the property, who is coming this week. An empty day is one line,
// not three boxes and seven rows saying nothing.

const plus = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
const pretty = (date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", opts);
};
const guestName = (b: any) => `${b.guest?.firstName ?? ""} ${b.guest?.lastName ?? ""}`.trim() || "Guest";
const n = (count: number, one: string, many = one + "s") => `${count} ${count === 1 ? one : many}`;

export async function Today(props: AdminViewServerProps) {
  const payload = props.initPageResult.req.payload;
  const today = todayPacific();
  const weekEnd = plus(today, 8);

  const live = { status: { not_in: ["cancelled", "refunded"] } };
  const notTest = { isTest: { not_equals: true } };

  const [arriving, departing, staying, week, inquiries, review, pending, unread, sites] = await Promise.all([
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { equals: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkOut: { equals: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { less_than_equal: today } }, { checkOut: { greater_than: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { greater_than: today } }, { checkIn: { less_than: weekEnd } }] }, pagination: false, depth: 0, sort: "checkIn" }),
    payload.find({ collection: "event-inquiries", where: { status: { equals: "pending" } }, limit: 5, depth: 0, sort: "-createdAt" }),
    payload.find({ collection: "guests", where: { needsReview: { equals: true } }, limit: 5, depth: 0 }),
    payload.find({ collection: "bookings", where: { and: [{ status: { equals: "pending" } }, notTest] }, limit: 5, depth: 0 }),
    payload.find({
      collection: "messages",
      where: { and: [{ from: { equals: "guest" } }, { readByOwner: { equals: false } }, notTest] },
      limit: 5,
      depth: 0,
    }),
    payload.find({ collection: "sites", pagination: false, depth: 0, limit: 100 }),
  ]);
  // A site's cover photo beside its name, wherever a site is named.
  const cover = new Map<string, string | undefined>((sites.docs as any[]).map((s) => [s.slug, s.photos?.[0]?.url]));
  const Cover = ({ slug }: { slug: string }) =>
    cover.get(slug) ? <img className="cv" src={cover.get(slug)} alt="" /> : <span className="cv ph" />;

  const arr = arriving.docs as any[];
  const dep = departing.docs as any[];
  const stay = staying.docs as any[];
  const weekDocs = week.docs as any[];

  // The sentence at the top. It is the whole page on a quiet day.
  const parts: string[] = [];
  if (arr.length) parts.push(`${n(arr.length, "arrival")}`);
  if (dep.length) parts.push(`${n(dep.length, "departure")}`);
  const summary = parts.length
    ? `${parts.join(", ")} today. ${stay.length ? `${n(stay.length, "site")} occupied tonight.` : "Nobody staying tonight."}`
    : stay.length
      ? `Quiet day. ${n(stay.length, "site")} occupied tonight.`
      : "Quiet day. Nobody arriving, nobody leaving, nobody staying tonight.";

  const attention = [
    unread.totalDocs > 0 && { text: `${n(unread.totalDocs, "guest message")} waiting for an answer`, href: "/admin/collections/messages?where[readByOwner][equals]=false" },
    inquiries.totalDocs > 0 && { text: `${n(inquiries.totalDocs, "event inquiry", "event inquiries")} waiting for a reply`, href: "/admin/collections/event-inquiries?where[status][equals]=pending" },
    pending.totalDocs > 0 && { text: `${n(pending.totalDocs, "booking")} awaiting payment`, href: "/admin/collections/bookings?where[status][equals]=pending" },
    review.totalDocs > 0 && { text: `${n(review.totalDocs, "guest profile")} matched by name, worth confirming`, href: "/admin/collections/guests?where[needsReview][equals]=true" },
  ].filter(Boolean) as { text: string; href: string }[];


  const css = `
    .t{max-width:760px}
    .t h1{font-size:28px;font-weight:600;margin:6px 0 2px;letter-spacing:-.01em}
    .t .date{color:#8a8781;font-size:14px;margin:0 0 18px}
    .t .sum{font-size:17px;line-height:1.5;color:#1f1f1d;margin:0 0 30px;max-width:56ch}
    .t h2{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#8a8781;margin:0 0 8px;font-weight:600}
    .t .t-card{display:block;border:1px solid #e3e1dc;border-radius:8px;background:#fff;margin:0 0 28px;overflow:hidden}
    .t .t-row{display:flex;width:100%;box-sizing:border-box;align-items:baseline;gap:12px;padding:11px 16px;border-bottom:1px solid #f1efeb;font-size:14.5px;color:#1f1f1d;text-decoration:none}
    .t .t-row:last-child{border-bottom:none}
    a.t-row:hover{background:#faf9f7}
    .t .t-row .k{flex:0 0 96px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a8781;padding-top:2px}
    .t .t-row .who{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .t .t-row .where{color:#6f6c67;font-size:13.5px;white-space:nowrap}
    .t .t-row .dot{width:7px;height:7px;border-radius:50%;background:#1f1f1d;flex:none;align-self:center}
    .t .t-row .go{margin-left:auto;color:#8a8781;font-size:13px}
    .t .cv{width:40px;height:30px;object-fit:cover;border-radius:5px;flex:none;align-self:center;background:#efece6;display:inline-block}
    .t .none{color:#a3a09a;font-size:14px;margin:0 0 28px}
  `;

  const stayRow = (b: any, label: string) => (
    <a key={`${label}-${b.id}`} className="t-row" href={`/admin/collections/bookings/${b.id}`}>
      <span className="k">{label}</span>
      <Cover slug={b.siteSlug} />
      <span className="who">{guestName(b)}</span>
      <span className="where">
        {b.siteName}
        {b.nights ? ` · ${b.nights} night${b.nights === 1 ? "" : "s"}` : ""}
      </span>
    </a>
  );

  return (
    <Gutter>
      <div className="t">
        <style dangerouslySetInnerHTML={{ __html: css }} />

        <h1>Today</h1>
        <p className="date">{pretty(today, { weekday: "long", month: "long", day: "numeric" })}</p>
        <p className="sum">{summary}</p>

        {attention.length > 0 && (
          <>
            <h2>Needs you</h2>
            <div className="t-card">
              {attention.map((a) => (
                <a key={a.href} className="t-row" href={a.href}>
                  <span className="dot" />
                  <span className="who">{a.text}</span>
                  <span className="go">Open</span>
                </a>
              ))}
            </div>
          </>
        )}

        {(arr.length > 0 || dep.length > 0 || stay.length > 0) && (
          <>
            <h2>On the property</h2>
            <div className="t-card">
              {arr.map((b) => stayRow(b, "Arriving"))}
              {dep.map((b) => stayRow(b, "Leaving"))}
              {stay.filter((b) => b.checkIn !== today).map((b) => stayRow(b, "Staying"))}
            </div>
          </>
        )}

        <h2>Coming up</h2>
        {weekDocs.length ? (
          <div className="t-card">
            {weekDocs.map((b) => (
              <a key={b.id} className="t-row" href={`/admin/collections/bookings/${b.id}`}>
                <span className="k">{pretty(b.checkIn, { weekday: "short", day: "numeric" })}</span>
                <Cover slug={b.siteSlug} />
                <span className="who">{guestName(b)}</span>
                <span className="where">
                  {b.siteName}
                  {b.nights ? ` · ${b.nights} night${b.nights === 1 ? "" : "s"}` : ""}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="none">No arrivals in the next week.</p>
        )}
      </div>
    </Gutter>
  );
}

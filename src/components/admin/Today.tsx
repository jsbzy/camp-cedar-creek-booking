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

  const [arriving, departing, staying, week, inquiries, review, pending, unread] = await Promise.all([
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
  ]);

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

  const days = Array.from({ length: 7 }, (_, i) => plus(today, i + 1)).filter((d) => weekDocs.some((b) => b.checkIn === d));

  const css = `
    .t{max-width:760px}
    .t h1{font-size:28px;font-weight:600;margin:6px 0 2px;letter-spacing:-.01em}
    .t .date{color:#8a8781;font-size:14px;margin:0 0 18px}
    .t .sum{font-size:17px;line-height:1.5;color:#1f1f1d;margin:0 0 30px;max-width:56ch}
    .t h2{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#8a8781;margin:0 0 8px;font-weight:600}
    .t .card{border:1px solid #e3e1dc;border-radius:8px;background:#fff;margin:0 0 28px;overflow:hidden}
    .t .row{display:flex;align-items:baseline;gap:12px;padding:11px 16px;border-bottom:1px solid #f1efeb;font-size:14.5px;color:#1f1f1d;text-decoration:none}
    .t .row:last-child{border-bottom:none}
    a.row:hover{background:#faf9f7}
    .t .row .k{flex:0 0 96px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a8781;padding-top:2px}
    .t .row .who{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .t .row .where{color:#6f6c67;font-size:13.5px;white-space:nowrap}
    .t .row .dot{width:7px;height:7px;border-radius:50%;background:#1f1f1d;flex:none;align-self:center}
    .t .row .go{margin-left:auto;color:#8a8781;font-size:13px}
    .t .day{display:flex;gap:14px;padding:11px 16px;border-bottom:1px solid #f1efeb;align-items:baseline}
    .t .day:last-child{border-bottom:none}
    .t .day .d{flex:0 0 96px;font-size:13px;color:#8a8781}
    .t .day .d b{color:#1f1f1d;display:block;font-size:14px;font-weight:500}
    .t .day .list{flex:1;display:flex;flex-wrap:wrap;gap:6px}
    .t .chip{background:#f2f1ee;border-radius:5px;padding:4px 10px;font-size:13.5px;text-decoration:none;color:#1f1f1d}
    .t .chip:hover{background:#e7e5e1}
    .t .none{color:#a3a09a;font-size:14px;margin:0 0 28px}
  `;

  const stayRow = (b: any, label: string) => (
    <a key={`${label}-${b.id}`} className="row" href={`/admin/collections/bookings/${b.id}`}>
      <span className="k">{label}</span>
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
            <div className="card">
              {attention.map((a) => (
                <a key={a.href} className="row" href={a.href}>
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
            <div className="card">
              {arr.map((b) => stayRow(b, "Arriving"))}
              {dep.map((b) => stayRow(b, "Leaving"))}
              {stay.filter((b) => b.checkIn !== today).map((b) => stayRow(b, "Staying"))}
            </div>
          </>
        )}

        <h2>Coming up</h2>
        {days.length ? (
          <div className="card">
            {days.map((d) => (
              <div key={d} className="day">
                <span className="d">
                  <b>{pretty(d, { weekday: "long" })}</b>
                  {pretty(d, { month: "short", day: "numeric" })}
                </span>
                <span className="list">
                  {weekDocs
                    .filter((b) => b.checkIn === d)
                    .map((b) => (
                      <a key={b.id} className="chip" href={`/admin/collections/bookings/${b.id}`}>
                        {guestName(b)} · {b.siteName}
                      </a>
                    ))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="none">No arrivals in the next week.</p>
        )}
      </div>
    </Gutter>
  );
}

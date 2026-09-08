import React from "react";
import type { AdminViewServerProps } from "payload";
import { Gutter } from "@payloadcms/ui";
import { todayPacific } from "@/lib/cancellation";

// Note: a `dashboard` override is rendered inside the admin shell already, so
// it must NOT wrap itself in DefaultTemplate the way a custom route view does.
// Doing that draws the header, sidebar, and avatar twice.

/* eslint-disable @typescript-eslint/no-explicit-any */

// What the owners open in the morning. Who is arriving, who is leaving, who is
// here tonight, what is coming this week, and anything waiting on them. The
// collection list that used to be here is a filing cabinet, not a day's work.

const plus = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
const pretty = (date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", opts);
};
const money = (n: unknown) => (typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "");
const guestName = (b: any) => `${b.guest?.firstName ?? ""} ${b.guest?.lastName ?? ""}`.trim() || "Guest";

export async function Today(props: AdminViewServerProps) {
  const payload = props.initPageResult.req.payload;
  const today = todayPacific();
  const weekEnd = plus(today, 8);

  const live = { status: { not_in: ["cancelled", "refunded"] } };
  const notTest = { isTest: { not_equals: true } };

  const [arriving, departing, staying, week, inquiries, review, pending] = await Promise.all([
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { equals: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkOut: { equals: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { less_than_equal: today } }, { checkOut: { greater_than: today } }] }, pagination: false, depth: 0, sort: "siteName" }),
    payload.find({ collection: "bookings", where: { and: [live, notTest, { checkIn: { greater_than: today } }, { checkIn: { less_than: weekEnd } }] }, pagination: false, depth: 0, sort: "checkIn" }),
    payload.find({ collection: "event-inquiries", where: { status: { equals: "pending" } }, limit: 5, depth: 0, sort: "-createdAt" }),
    payload.find({ collection: "guests", where: { needsReview: { equals: true } }, limit: 5, depth: 0 }),
    payload.find({ collection: "bookings", where: { and: [{ status: { equals: "pending" } }, notTest] }, limit: 5, depth: 0 }),
  ]);

  const css = `
    .t-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:6px 0 4px}
    .t-head h1{font-size:28px;font-weight:600;margin:0}
    .t-date{color:#8a8781;font-size:14px}
    .t-actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 26px}
    .t-actions a{border:1px solid #cfcdc8;border-radius:6px;padding:7px 13px;text-decoration:none;color:#1f1f1d;font-size:13.5px;background:#fff}
    .t-actions a:hover{border-color:#1f1f1d}
    .t-actions a.primary{background:#1f1f1d;color:#fff;border-color:#1f1f1d}
    .t-alerts{display:flex;flex-direction:column;gap:8px;margin:0 0 26px}
    .t-alert{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid #e8dcc0;background:#fdf8ec;border-radius:8px;padding:11px 16px;font-size:14px;color:#6b5a2e}
    .t-alert a{color:#6b5a2e;font-weight:600}
    .t-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px;margin:0 0 30px}
    .t-col{border:1px solid #e3e1dc;border-radius:8px;background:#fff;overflow:hidden}
    .t-col h2{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#8a8781;margin:0;padding:13px 16px 11px;border-bottom:1px solid #eeece8;display:flex;justify-content:space-between}
    .t-col h2 b{color:#1f1f1d;font-size:13px}
    .t-row{display:flex;align-items:baseline;gap:10px;padding:10px 16px;border-bottom:1px solid #f4f2ef;font-size:14px;text-decoration:none;color:#1f1f1d}
    .t-row:last-child{border-bottom:none}
    .t-row:hover{background:#faf9f7}
    .t-row .who{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .t-row .where{color:#6f6c67;font-size:13px;white-space:nowrap}
    .t-empty{padding:16px;color:#a3a09a;font-size:13.5px}
    .t-week{border:1px solid #e3e1dc;border-radius:8px;background:#fff;overflow:hidden}
    .t-day{display:flex;gap:14px;padding:11px 16px;border-bottom:1px solid #f4f2ef}
    .t-day:last-child{border-bottom:none}
    .t-day.none{color:#a3a09a}
    .t-day .d{flex:0 0 128px;font-size:13.5px;color:#6f6c67}
    .t-day .d b{color:#1f1f1d;display:block;font-size:14px}
    .t-day .list{flex:1;display:flex;flex-wrap:wrap;gap:6px}
    .t-chip{background:#f2f1ee;border-radius:5px;padding:3px 9px;font-size:13px;text-decoration:none;color:#1f1f1d}
    .t-chip:hover{background:#e7e5e1}
    h3.t-sec{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#8a8781;margin:0 0 10px}
  `;

  const list = (docs: any[], empty: string) =>
    docs.length ? (
      docs.map((b) => (
        <a key={b.id} className="t-row" href={`/admin/collections/bookings/${b.id}`}>
          <span className="who">{guestName(b)}</span>
          <span className="where">
            {b.siteName} · {b.guests}p{b.nights ? ` · ${b.nights}n` : ""}
          </span>
        </a>
      ))
    ) : (
      <div className="t-empty">{empty}</div>
    );

  const days = Array.from({ length: 7 }, (_, i) => plus(today, i + 1));
  const weekDocs = week.docs as any[];

  return (
    <Gutter>
        <style dangerouslySetInnerHTML={{ __html: css }} />

        <div className="t-head">
          <h1>Today</h1>
          <span className="t-date">{pretty(today, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
        </div>

        <div className="t-actions">
          <a className="primary" href="/admin/calendar">Calendar</a>
          <a href="/admin/collections/bookings">All bookings</a>
          <a href="/admin/collections/guests">Guests</a>
          <a href="/admin/collections/blocked-dates/create">Block dates</a>
          <a href="/admin/collections/sites">Sites and rates</a>
        </div>

        {(inquiries.totalDocs > 0 || review.totalDocs > 0 || pending.totalDocs > 0) && (
          <div className="t-alerts">
            {inquiries.totalDocs > 0 && (
              <div className="t-alert">
                <span>
                  {inquiries.totalDocs} event {inquiries.totalDocs === 1 ? "inquiry" : "inquiries"} waiting for a reply
                </span>
                <a href="/admin/collections/event-inquiries?where[status][equals]=pending">Open</a>
              </div>
            )}
            {pending.totalDocs > 0 && (
              <div className="t-alert">
                <span>
                  {pending.totalDocs} booking{pending.totalDocs === 1 ? "" : "s"} awaiting payment
                </span>
                <a href="/admin/collections/bookings?where[status][equals]=pending">Open</a>
              </div>
            )}
            {review.totalDocs > 0 && (
              <div className="t-alert">
                <span>
                  {review.totalDocs} guest {review.totalDocs === 1 ? "profile" : "profiles"} matched by name, worth confirming
                </span>
                <a href="/admin/collections/guests?where[needsReview][equals]=true">Open</a>
              </div>
            )}
          </div>
        )}

        <div className="t-cols">
          <div className="t-col">
            <h2>Arriving <b>{arriving.docs.length}</b></h2>
            {list(arriving.docs as any[], "Nobody arriving today.")}
          </div>
          <div className="t-col">
            <h2>Departing <b>{departing.docs.length}</b></h2>
            {list(departing.docs as any[], "Nobody leaving today.")}
          </div>
          <div className="t-col">
            <h2>Here tonight <b>{staying.docs.length}</b></h2>
            {list(staying.docs as any[], "The property is empty tonight.")}
          </div>
        </div>

        <h3 className="t-sec">The week ahead</h3>
        <div className="t-week">
          {days.map((d) => {
            const on = weekDocs.filter((b) => b.checkIn === d);
            return (
              <div key={d} className={`t-day${on.length ? "" : " none"}`}>
                <span className="d">
                  <b>{pretty(d, { weekday: "long" })}</b>
                  {pretty(d, { month: "short", day: "numeric" })}
                </span>
                <span className="list">
                  {on.length ? (
                    on.map((b) => (
                      <a key={b.id} className="t-chip" href={`/admin/collections/bookings/${b.id}`}>
                        {guestName(b)} · {b.siteName} {money(b.total)}
                      </a>
                    ))
                  ) : (
                    <span style={{ fontSize: 13.5 }}>No arrivals</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
    </Gutter>
  );
}

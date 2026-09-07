import React from "react";
import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */

// One month, every site: a row per site, a column per night, bookings and
// blocks drawn as bars. This is the view the owners actually run the
// campground from — "who is where this weekend" — and it is read-only;
// clicking a bar opens the booking.

const STATUS_COLOR: Record<string, string> = {
  confirmed: "#1f1f1d",
  pending: "#b58a1f",
  completed: "#6b6b6b",
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthParam(sp: Record<string, unknown> | undefined): { y: number; m: number } {
  const raw = typeof sp?.month === "string" ? sp.month : "";
  const mm = raw.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  if (mm) return { y: Number(mm[1]), m: Number(mm[2]) - 1 };
  return { y: now.getFullYear(), m: now.getMonth() };
}

export async function CalendarView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props;
  const payload = initPageResult.req.payload;
  const { y, m } = monthParam(searchParams as any);
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const start = ymd(first);
  const endExclusive = ymd(new Date(y, m + 1, 1));
  const prev = `${new Date(y, m - 1, 1).getFullYear()}-${String(new Date(y, m - 1, 1).getMonth() + 1).padStart(2, "0")}`;
  const next = `${new Date(y, m + 1, 1).getFullYear()}-${String(new Date(y, m + 1, 1).getMonth() + 1).padStart(2, "0")}`;
  const today = ymd(new Date());
  const monthName = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [sitesRes, bookingsRes, blocksRes] = await Promise.all([
    payload.find({ collection: "sites", pagination: false, depth: 0, sort: "sortOrder" }),
    payload.find({
      collection: "bookings",
      pagination: false,
      depth: 0,
      where: {
        and: [
          { status: { not_in: ["cancelled", "refunded"] } },
          { checkIn: { less_than: endExclusive } },
          { checkOut: { greater_than: start } },
        ],
      },
    }),
    payload.find({
      collection: "blocked-dates",
      pagination: false,
      depth: 0,
      where: { and: [{ startDate: { less_than: endExclusive } }, { endDate: { greater_than: start } }] },
    }),
  ]);

  const sites = sitesRes.docs as any[];
  const bookings = bookingsRes.docs as any[];
  const blocks = blocksRes.docs as any[];

  // Column index (0-based) for a YYYY-MM-DD, clamped to this month.
  const col = (date: string) => {
    if (date < start) return 0;
    if (date >= endExclusive) return daysInMonth;
    return Number(date.slice(8, 10)) - 1;
  };

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { n: i + 1, dow: d.toLocaleDateString("en-US", { weekday: "narrow" }), weekend: d.getDay() === 5 || d.getDay() === 6, isToday: ymd(d) === today };
  });

  const css = `
    .cal-wrap{overflow-x:auto;padding-bottom:24px}
    .cal-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:8px 0 18px}
    .cal-head h1{font-size:26px;font-weight:600;margin:0}
    .cal-nav{display:flex;gap:8px;align-items:center}
    .cal-nav a{border:1px solid #cfcdc8;border-radius:6px;padding:6px 12px;text-decoration:none;color:#1f1f1d;font-size:14px;background:#fff}
    .cal-nav a:hover{border-color:#1f1f1d}
    .cal-legend{display:flex;gap:16px;font-size:12.5px;color:#666;margin:0 0 14px}
    .cal-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:6px}
    .cal{display:grid;grid-template-columns:200px repeat(${daysInMonth}, minmax(30px,1fr));border:1px solid #e3e1dc;border-radius:8px;overflow:hidden;background:#fff;min-width:${200 + daysInMonth * 30}px}
    .cal .hd{font-size:11px;color:#777;text-align:center;padding:8px 0 6px;border-bottom:1px solid #e3e1dc;background:#faf9f7;line-height:1.2}
    .cal .hd b{display:block;font-size:13px;color:#1f1f1d;font-weight:600}
    .cal .hd.we{background:#f1efeb}
    .cal .hd.today b{color:#fff;background:#1f1f1d;border-radius:999px;width:22px;height:22px;line-height:22px;margin:0 auto}
    .cal .site{padding:10px 12px;border-bottom:1px solid #eeece8;border-right:1px solid #e3e1dc;font-size:13.5px;font-weight:500;color:#1f1f1d;background:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:sticky;left:0;z-index:2}
    .cal .site small{display:block;color:#888;font-weight:400;font-size:11.5px}
    .cal .row{position:relative;display:grid;grid-template-columns:repeat(${daysInMonth},minmax(30px,1fr));border-bottom:1px solid #eeece8;min-height:44px}
    .cal .cell{border-right:1px solid #f1efeb}
    .cal .cell.we{background:#faf9f7}
    .cal .bar{position:absolute;top:9px;height:26px;border-radius:5px;color:#fff;font-size:12px;line-height:26px;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none;z-index:1}
    .cal .bar:hover{filter:brightness(1.15)}
    .cal .bar.block{background:repeating-linear-gradient(135deg,#d9d6d0 0 6px,#e8e6e1 6px 12px);color:#444}
    .cal .empty{padding:40px;text-align:center;color:#888}
  `;

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="cal-head">
          <h1>Calendar · {monthName}</h1>
          <div className="cal-nav">
            <a href={`?month=${prev}`}>‹ Previous</a>
            <a href="?">Today</a>
            <a href={`?month=${next}`}>Next ›</a>
          </div>
        </div>
        <div className="cal-legend">
          <span><i style={{ background: STATUS_COLOR.confirmed }} />Confirmed</span>
          <span><i style={{ background: STATUS_COLOR.pending }} />Pending payment</span>
          <span><i style={{ background: STATUS_COLOR.completed }} />Completed</span>
          <span><i style={{ background: "repeating-linear-gradient(135deg,#d9d6d0 0 3px,#e8e6e1 3px 6px)" }} />Blocked / other platform</span>
        </div>
        <div className="cal-wrap">
          <div className="cal">
            <div className="hd" style={{ textAlign: "left", padding: "8px 12px" }}>Site</div>
            {dayHeaders.map((d) => (
              <div key={d.n} className={`hd${d.weekend ? " we" : ""}${d.isToday ? " today" : ""}`}>
                {d.dow}
                <b>{d.n}</b>
              </div>
            ))}
            {sites.map((site) => {
              const rowBookings = bookings.filter((b) => b.siteSlug === site.slug);
              const rowBlocks = blocks.filter((b) => b.siteSlug === site.slug);
              return (
                <React.Fragment key={site.id}>
                  <div className="site">
                    {site.name}
                    <small>{site.type}</small>
                  </div>
                  <div className="row" style={{ gridColumn: `span ${daysInMonth}` }}>
                    {dayHeaders.map((d) => (
                      <div key={d.n} className={`cell${d.weekend ? " we" : ""}`} />
                    ))}
                    {rowBlocks.map((bl) => {
                      const c0 = col(bl.startDate);
                      const c1 = col(bl.endDate);
                      if (c1 <= c0) return null;
                      return (
                        <a
                          key={`bl-${bl.id}`}
                          href={`/admin/collections/blocked-dates/${bl.id}`}
                          className="bar block"
                          title={`${bl.reason ?? "blocked"} · ${bl.startDate} → ${bl.endDate}${bl.note ? " · " + bl.note : ""}`}
                          style={{ left: `calc(${(c0 / daysInMonth) * 100}% + 2px)`, width: `calc(${((c1 - c0) / daysInMonth) * 100}% - 4px)` }}
                        >
                          {bl.source && bl.source !== "manual" ? bl.source : bl.reason === "ota_booking" ? "other platform" : (bl.reason ?? "blocked").replace(/_/g, " ")}
                        </a>
                      );
                    })}
                    {rowBookings.map((b) => {
                      const c0 = col(b.checkIn);
                      const c1 = col(b.checkOut);
                      if (c1 <= c0) return null;
                      const guest = [b.guest?.firstName, b.guest?.lastName].filter(Boolean).join(" ");
                      return (
                        <a
                          key={b.id}
                          href={`/admin/collections/bookings/${b.id}`}
                          className="bar"
                          title={`${guest} · ${b.confirmationCode} · ${b.checkIn} → ${b.checkOut} · $${b.total}`}
                          style={{
                            left: `calc(${(c0 / daysInMonth) * 100}% + 2px)`,
                            width: `calc(${((c1 - c0) / daysInMonth) * 100}% - 4px)`,
                            background: STATUS_COLOR[b.status] ?? "#1f1f1d",
                          }}
                        >
                          {guest || b.confirmationCode}
                        </a>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
            {!sites.length && <div className="empty">No sites yet.</div>}
          </div>
        </div>
        <p style={{ color: "#777", fontSize: 13, marginTop: 14 }}>
          Bars run from check-in to check-out; the checkout day is open for the next guest. Click a bar to open it. Cancelled and refunded bookings are not shown.
        </p>
      </Gutter>
    </DefaultTemplate>
  );
}

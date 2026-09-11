import React from "react";
import type { UIFieldServerProps } from "payload";

/* eslint-disable @typescript-eslint/no-explicit-any */

// The guest, the way an owner reads them: how often they have come, what they
// spent, and every stay listed. Server-rendered so it can query the bookings.

const money = (n: unknown) =>
  typeof n === "number" ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";

function longDate(s: unknown): string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS: Record<string, { bg: string; fg: string }> = {
  confirmed: { bg: "var(--status-confirmed-bg, #1f1f1d)", fg: "var(--status-confirmed-fg, #fff)" },
  pending: { bg: "var(--status-pending-bg, #f3e9c9)", fg: "var(--status-pending-fg, #6b5300)" },
  completed: { bg: "var(--status-completed-bg, #eceae5)", fg: "var(--status-completed-fg, #4a4741)" },
  cancelled: { bg: "var(--status-cancelled-bg, #f1e4e2)", fg: "var(--status-cancelled-fg, #7a2e2e)" },
  refunded: { bg: "var(--status-cancelled-bg, #f1e4e2)", fg: "var(--status-cancelled-fg, #7a2e2e)" },
};

export async function GuestSummary({ data, payload }: UIFieldServerProps) {
  const guestId = (data as any)?.id;
  if (!guestId) {
    return (
      <div style={{ padding: "14px 0", color: "#777", fontSize: 14 }}>
        Guests are created automatically when a booking is made. Save this one and their stays will appear here.
      </div>
    );
  }

  const res = await payload.find({
    collection: "bookings",
    where: { guestProfile: { equals: guestId } },
    sort: "-checkIn",
    limit: 50,
    depth: 0,
  });
  const bookings = res.docs as any[];
  const counted = bookings.filter((b) => !["cancelled", "refunded"].includes(b.status) && !b.isTest);
  const nights = counted.reduce((a, b) => a + (b.nights ?? 0), 0);
  const spend = counted.reduce((a, b) => a + (b.total ?? 0), 0);
  const d = data as any;

  const s: Record<string, React.CSSProperties> = {
    card: { border: "1px solid #e3e1dc", borderRadius: 8, background: "#fff", padding: "20px 22px", marginBottom: 26 },
    top: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" },
    name: { fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.2 },
    contact: { fontSize: 13.5, color: "#666", marginTop: 4 },
    stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 14, marginTop: 18, paddingTop: 16, borderTop: "1px solid #eee" },
    k: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#888", marginBottom: 2 },
    v: { fontSize: 20, fontWeight: 600, color: "#1f1f1d", fontVariantNumeric: "tabular-nums" },
    sub: { fontSize: 12.5, color: "#777" },
    h: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#888", margin: "20px 0 6px", paddingTop: 16, borderTop: "1px solid #eee" },
    row: { display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f2f1ee", fontSize: 14, textDecoration: "none", color: "#1f1f1d" },
    stay: { display: "block", padding: "12px 14px", margin: "0 0 8px", border: "1px solid #eeece8", borderRadius: 7, textDecoration: "none", color: "#1f1f1d", background: "#fdfcfb" },
    stayTop: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    stayMeta: { fontSize: 13, color: "#6f6c67", marginTop: 4 },
    stayAddOns: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 },
    addOn: { fontSize: 12.5, background: "#f1efec", borderRadius: 5, padding: "3px 8px", color: "#4a4741" },
    pill: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" },
    flag: { marginTop: 14, padding: "10px 14px", borderRadius: 6, background: "#fff4d6", color: "#7a5a00", fontSize: 13.5 },
  };

  return (
    <div style={s.card}>
      <div style={s.top}>
        <div>
          <p style={s.name}>{d.displayName || "Guest"}</p>
          <div style={s.contact}>
            {d.primaryEmail ? <a href={`mailto:${d.primaryEmail}`} style={{ color: "inherit" }}>{d.primaryEmail}</a> : "no email on file"}
            {d.primaryPhone ? ` · ${d.primaryPhone}` : ""}
          </div>
        </div>
        {counted.length > 1 ? (
          <span style={{ ...s.pill, background: "#1f1f1d", color: "#fff" }}>Repeat guest</span>
        ) : null}
      </div>

      <div style={s.stats}>
        <div><div style={s.k}>Stays</div><div style={s.v}>{counted.length}</div></div>
        <div><div style={s.k}>Nights</div><div style={s.v}>{nights}</div></div>
        <div><div style={s.k}>Spent</div><div style={s.v}>{money(spend)}</div></div>
        <div><div style={s.k}>First</div><div style={s.v} /><div style={s.sub}>{longDate(d.firstStay)}</div></div>
        <div><div style={s.k}>Last</div><div style={s.v} /><div style={s.sub}>{longDate(d.lastStay)}</div></div>
      </div>

      {d.needsReview ? (
        <div style={s.flag}>
          <b>Check this is the same person.</b> {d.reviewNote || "Matched by name alone."} If it is someone else, clear the
          matching keys and untick “Needs review”.
        </div>
      ) : null}

      <div style={s.h}>Stays</div>
      {bookings.length ? (
        bookings.map((b) => {
          const st = STATUS[b.status] ?? STATUS.completed;
          const addOns: any[] = Array.isArray(b.addOns) ? b.addOns : [];
          return (
            <a key={b.id} href={`/admin/collections/bookings/${b.id}`} style={s.stay}>
              <div style={s.stayTop}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{b.siteName}</span>
                <span style={{ ...s.pill, background: st.bg, color: st.fg }}>{b.status}</span>
                {b.source && b.source !== "direct" ? (
                  <span style={{ ...s.pill, background: "#eef1f6", color: "#3c4a63" }}>{b.source}</span>
                ) : null}
                {b.isTest ? <span style={{ ...s.pill, background: "#eee", color: "#777" }}>test</span> : null}
                <span style={{ marginLeft: "auto", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{money(b.total)}</span>
              </div>
              <div style={s.stayMeta}>
                {longDate(b.checkIn)} to {longDate(b.checkOut)} · {b.nights} night{b.nights === 1 ? "" : "s"} ·{" "}
                {b.guests} guest{b.guests === 1 ? "" : "s"} · {b.confirmationCode}
              </div>
              {addOns.length ? (
                <div style={s.stayAddOns}>
                  {addOns.map((a, i) => (
                    <span key={i} style={s.addOn}>
                      {a.name} ×{a.quantity}
                      {a.perNight ? "/night" : ""}
                      {typeof a.unitPrice === "number" ? ` ${money(a.unitPrice * a.quantity * (a.perNight ? b.nights || 1 : 1))}` : ""}
                    </span>
                  ))}
                </div>
              ) : null}
              {b.guest?.specialRequests ? (
                <div style={{ ...s.stayMeta, fontStyle: "italic" }}>“{b.guest.specialRequests}”</div>
              ) : null}
              {b.cancellationReason ? (
                <div style={{ ...s.stayMeta, color: "#8a2b2b" }}>Cancelled: {b.cancellationReason}</div>
              ) : null}
            </a>
          );
        })
      ) : (
        <div style={{ color: "#999", fontSize: 14, padding: "8px 0" }}>No stays recorded yet.</div>
      )}
    </div>
  );
}

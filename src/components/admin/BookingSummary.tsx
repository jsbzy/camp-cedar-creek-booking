"use client";

import React from "react";
import { useAllFormFields } from "@payloadcms/ui";

/* eslint-disable @typescript-eslint/no-explicit-any */

// The booking, the way an owner reads it: who, where, when, what they paid.
// Rendered at the top of the booking edit screen from the live form state,
// so it stays right while the status is being changed. The raw fields it
// summarizes (add-ons array, nightly breakdown, signature, tokens) are
// hidden on the form.

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  pending: { label: "Pending payment", bg: "#fff4d6", fg: "#7a5a00" },
  confirmed: { label: "Confirmed", bg: "#e3f4e8", fg: "#1d6b3a" },
  cancelled: { label: "Cancelled", bg: "#f3e3e3", fg: "#8a2b2b" },
  completed: { label: "Completed", bg: "#e9e9e9", fg: "#333" },
  refunded: { label: "Refunded", bg: "#e6ecf7", fg: "#2b4a8a" },
};

const money = (n: unknown) =>
  typeof n === "number" ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }) : "—";

function longDate(s: unknown): string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function when(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function BookingSummary() {
  const [fields] = useAllFormFields();
  const v = (path: string) => fields?.[path]?.value;

  // Array fields live in the form as addOns.<i>.<field>; walk them back into rows.
  const addOns: { name: string; quantity: number; unitPrice: number; perNight: boolean }[] = [];
  for (let i = 0; i < 50; i++) {
    const name = v(`addOns.${i}.name`);
    if (name === undefined) break;
    addOns.push({
      name: String(name ?? ""),
      quantity: Number(v(`addOns.${i}.quantity`) ?? 0),
      unitPrice: Number(v(`addOns.${i}.unitPrice`) ?? 0),
      perNight: Boolean(v(`addOns.${i}.perNight`)),
    });
  }

  const status = String(v("status") ?? "pending");
  const st = STATUS[status] ?? STATUS.pending;
  const nights = Number(v("nights") ?? 0);
  const first = String(v("guest.firstName") ?? "");
  const last = String(v("guest.lastName") ?? "");
  const email = String(v("guest.email") ?? "");
  const phone = String(v("guest.phone") ?? "");
  const requests = String(v("guest.specialRequests") ?? "");
  const cancelReason = String(v("cancellationReason") ?? "");
  const refund = v("refundAmount");
  const notes = [
    ["Confirmation email", v("notifications.confirmationSentAt")],
    ["Pre-arrival email", v("notifications.preArrivalSentAt")],
    ["Day-before email", v("notifications.dayBeforeSentAt")],
    ["Post-stay email", v("notifications.postStaySentAt")],
  ].filter(([, t]) => t);

  const s: Record<string, React.CSSProperties> = {
    card: { border: "1px solid #e3e1dc", borderRadius: 8, background: "#fff", padding: "20px 22px", marginBottom: 28, fontFamily: "inherit" },
    top: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" },
    code: { fontSize: 13, letterSpacing: ".06em", color: "#777", fontFamily: "ui-monospace, Menlo, monospace" },
    h: { fontSize: 22, fontWeight: 600, margin: "4px 0 0", lineHeight: 1.2 },
    badge: { display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: st.bg, color: st.fg, letterSpacing: ".02em" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px 24px", marginTop: 18, paddingTop: 16, borderTop: "1px solid #eee" },
    k: { fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#888", marginBottom: 3 },
    val: { fontSize: 15, color: "#1f1f1d" },
    sub: { fontSize: 13, color: "#666" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 14 },
    td: { padding: "7px 0", borderBottom: "1px solid #f0efec", color: "#333" },
    tdr: { padding: "7px 0", borderBottom: "1px solid #f0efec", textAlign: "right", fontVariantNumeric: "tabular-nums" },
    total: { display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontSize: 17, fontWeight: 600 },
    warn: { marginTop: 16, padding: "10px 14px", borderRadius: 6, background: st.bg, color: st.fg, fontSize: 14 },
    foot: { marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 12.5, color: "#777", display: "flex", gap: 18, flexWrap: "wrap" },
  };

  return (
    <div style={s.card}>
      <div style={s.top}>
        <div>
          <div style={s.code}>{String(v("confirmationCode") ?? "new booking")}</div>
          <div style={s.h}>
            {first || last ? `${first} ${last}`.trim() : "Guest"} · {String(v("siteName") ?? "")}
          </div>
        </div>
        <span style={s.badge}>{st.label}</span>
      </div>

      <div style={s.grid}>
        <div>
          <div style={s.k}>Check-in</div>
          <div style={s.val}>{longDate(v("checkIn"))}</div>
        </div>
        <div>
          <div style={s.k}>Check-out</div>
          <div style={s.val}>{longDate(v("checkOut"))}</div>
          <div style={s.sub}>{nights ? `${nights} night${nights === 1 ? "" : "s"}` : ""}</div>
        </div>
        <div>
          <div style={s.k}>Guests</div>
          <div style={s.val}>{String(v("guests") ?? "—")}</div>
        </div>
        <div>
          <div style={s.k}>Contact</div>
          <div style={s.val}>{email ? <a href={`mailto:${email}`} style={{ color: "inherit" }}>{email}</a> : "—"}</div>
          <div style={s.sub}>{phone}</div>
        </div>
        <div>
          <div style={s.k}>Booked via</div>
          <div style={s.val}>{String(v("source") ?? "direct")}{v("waiverSigned") ? " · waiver signed" : " · waiver not signed"}</div>
        </div>
      </div>

      {requests && (
        <div style={{ marginTop: 14 }}>
          <div style={s.k}>Special requests</div>
          <div style={s.val}>{requests}</div>
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #eee" }}>
        <div style={s.k}>Charges</div>
        <table style={s.table}>
          <tbody>
            <tr>
              <td style={s.td}>{nights || "—"} night{nights === 1 ? "" : "s"} at {String(v("siteName") ?? "")}</td>
              <td style={s.tdr}>{money(v("subtotal"))}</td>
            </tr>
            {addOns.map((a, i) => (
              <tr key={i}>
                <td style={s.td}>
                  {a.name} × {a.quantity}
                  {a.perNight ? ` × ${nights} night${nights === 1 ? "" : "s"}` : ""}
                  <span style={{ color: "#888" }}> @ {money(a.unitPrice)}</span>
                </td>
                <td style={s.tdr}>{money(a.unitPrice * a.quantity * (a.perNight ? nights || 1 : 1))}</td>
              </tr>
            ))}
            {!addOns.length && (
              <tr>
                <td style={{ ...s.td, color: "#999" }}>No add-ons</td>
                <td style={s.tdr}></td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={s.total}>
          <span>Total</span>
          <span>{money(v("total"))}</span>
        </div>
      </div>

      {(status === "cancelled" || status === "refunded") && (
        <div style={s.warn}>
          <b>{status === "refunded" ? "Refunded" : "Cancelled"}</b>
          {when(v("cancelledAt")) ? ` on ${when(v("cancelledAt"))}` : ""}
          {typeof refund === "number" ? ` · refund owed ${money(refund)}` : ""}
          {cancelReason ? ` · “${cancelReason}”` : ""}
        </div>
      )}

      {notes.length > 0 && (
        <div style={s.foot}>
          {notes.map(([label, t]) => (
            <span key={String(label)}>{String(label)}: {when(t)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

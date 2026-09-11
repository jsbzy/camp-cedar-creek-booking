import React from "react";
import type { UIFieldServerProps } from "payload";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The conversation, read the way a conversation is read.
 *
 * A message on its own is not useful: the owners want the exchange, in order,
 * on the booking or the person it belongs to. Server-rendered so it can query
 * the messages, and read-only, because what someone actually said is a record.
 */

function when(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
}

const s: Record<string, React.CSSProperties> = {
  wrap: { margin: "0 0 26px" },
  head: {
    fontSize: 11,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "#888",
    margin: "0 0 10px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#c0392b", display: "inline-block" },
  empty: { fontSize: 14, color: "#777", border: "1px dashed #e0ded9", borderRadius: 8, padding: "16px 18px", background: "#fdfcfb" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: { display: "flex" },
  bubble: { maxWidth: "78%", borderRadius: 10, padding: "10px 14px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" },
  guest: { background: "#f2f1ee", color: "#1f1f1d", borderTopLeftRadius: 3 },
  host: { background: "#1f1f1d", color: "#fff", borderTopRightRadius: 3 },
  meta: { fontSize: 11, marginTop: 5, opacity: 0.65 },
  foot: { fontSize: 12.5, color: "#777", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0efec" },
  code: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 },
};

export async function Thread({ data, payload, collectionSlug }: UIFieldServerProps) {
  const id = (data as any)?.id;
  if (!id) {
    return <div style={s.empty}>Messages appear here once this is saved.</div>;
  }

  // The same panel serves a booking and a guest profile. On a booking it is
  // one stay's thread; on a guest it is everything they have ever written.
  const onGuest = collectionSlug === "guests";
  const res = await payload.find({
    collection: "messages",
    where: onGuest ? { guest: { equals: id } } : { booking: { equals: id } },
    sort: "createdAt",
    pagination: false,
    depth: onGuest ? 1 : 0,
  });
  const msgs = (res.docs as any[]).filter((m) => !m.isTest);
  const guestName = onGuest
    ? [(data as any).firstName, (data as any).lastName].filter(Boolean).join(" ")
    : [(data as any)?.guest?.firstName, (data as any)?.guest?.lastName].filter(Boolean).join(" ");
  const who = guestName || "Guest";
  const code = (data as any)?.confirmationCode;
  const unread = msgs.filter((m) => m.from === "guest" && !m.readByOwner).length;

  if (!msgs.length) {
    return (
      <div style={s.wrap}>
        <p style={s.head}>Conversation</p>
        <div style={s.empty}>
          Nothing yet. {who} can write from the message box on their booking page, and you will get an email when
          they do.
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <p style={s.head}>
        Conversation
        <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 12.5, color: "#999" }}>
          {msgs.length} message{msgs.length === 1 ? "" : "s"}
        </span>
        {unread > 0 && (
          <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 12.5, color: "#c0392b", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={s.dot} />
            {unread} unread
          </span>
        )}
      </p>

      <div style={s.list}>
        {msgs.map((m) => {
          const mine = m.from === "host";
          const label = mine ? m.authorName || "Camp Cedar Creek" : who;
          const bookingCode = onGuest ? m.booking?.confirmationCode : null;
          return (
            <div key={m.id} style={{ ...s.row, justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ ...s.bubble, ...(mine ? s.host : s.guest) }}>
                <div>{m.body}</div>
                <div style={s.meta}>
                  {label} · {when(m.createdAt)}
                  {bookingCode ? ` · ${bookingCode}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={s.foot}>
        To answer, ask Cici: <span style={s.code}>reply to {who}{code ? ` about ${code}` : ""}</span>. Replying to the
        email notification reaches them directly but does not appear here.
      </p>
    </div>
  );
}

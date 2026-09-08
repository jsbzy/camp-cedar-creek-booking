import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Message {
  id: string;
  from: "guest" | "host";
  body: string;
  authorName?: string | null;
  readByOwner: boolean;
  createdAt: string;
}

const map = (d: any): Message => ({
  id: String(d.id),
  from: d.from === "host" ? "host" : "guest",
  body: String(d.body ?? ""),
  authorName: d.authorName ?? null,
  readByOwner: !!d.readByOwner,
  createdAt: d.createdAt,
});

/** The whole conversation on one booking, oldest first, the way a thread reads. */
export async function threadForBooking(bookingId: string | number): Promise<Message[]> {
  const db = await getDb();
  const res = await db.find({
    collection: "messages",
    where: { booking: { equals: bookingId } },
    sort: "createdAt",
    pagination: false,
    depth: 0,
  });
  return (res.docs as any[]).map(map);
}

/**
 * Add a message to a booking's thread.
 *
 * A guest writing clears the read flag, because it is unread by definition.
 * The camp writing sets it, because we obviously saw our own message.
 */
export async function addMessage(input: {
  bookingId: string | number;
  guestId?: string | number | null;
  from: "guest" | "host";
  body: string;
  authorName?: string;
  isTest?: boolean;
}): Promise<Message> {
  const db = await getDb();
  const doc = await db.create({
    collection: "messages",
    data: {
      booking: input.bookingId,
      guest: input.guestId ?? undefined,
      from: input.from,
      body: input.body.trim().slice(0, 4000),
      authorName: input.authorName,
      readByOwner: input.from === "host",
      isTest: !!input.isTest,
    } as any,
  });
  return map(doc);
}

/** Everything a guest has sent that nobody has looked at yet. */
export async function unreadForOwners(limit = 50): Promise<any[]> {
  const db = await getDb();
  const res = await db.find({
    collection: "messages",
    where: { and: [{ from: { equals: "guest" } }, { readByOwner: { equals: false } }, { isTest: { not_equals: true } }] },
    sort: "-createdAt",
    limit,
    depth: 1,
  });
  return res.docs as any[];
}

export async function markThreadRead(bookingId: string | number): Promise<number> {
  const db = await getDb();
  const res = await db.update({
    collection: "messages",
    where: { and: [{ booking: { equals: bookingId } }, { from: { equals: "guest" } }, { readByOwner: { equals: false } }] },
    data: { readByOwner: true } as any,
  });
  return (res as any).docs?.length ?? 0;
}

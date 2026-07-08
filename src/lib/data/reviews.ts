import { cache } from "react";
import type { Review } from "@/types";
import { getDb } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapReview(doc: any): Review {
  return {
    id: String(doc.id),
    author: doc.author,
    date: doc.date,
    rating: doc.rating,
    text: doc.text,
    siteSlug: doc.siteSlug ?? "",
    recommends: Boolean(doc.recommends),
  };
}

export const getReviews = cache(async (): Promise<Review[]> => {
  const db = await getDb();
  const res = await db.find({
    collection: "reviews",
    where: { published: { equals: true } },
    sort: "-date",
    pagination: false,
    depth: 0,
  });
  return res.docs.map(mapReview);
});

export async function getReviewsForSite(siteSlug: string): Promise<Review[]> {
  return (await getReviews()).filter((r) => r.siteSlug === siteSlug);
}

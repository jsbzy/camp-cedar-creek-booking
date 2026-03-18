import { reviews, propertyRating } from "./seed";
import type { Review, PropertyRating } from "@/types";

export function getReviews(): Review[] {
  return reviews;
}

export function getReviewsForSite(siteSlug: string): Review[] {
  return reviews.filter((r) => r.siteSlug === siteSlug);
}

export function getPropertyRating(): PropertyRating {
  return propertyRating;
}

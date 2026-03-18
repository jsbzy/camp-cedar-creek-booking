"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review, PropertyRating } from "@/types";

interface ReviewsSectionProps {
  reviews: Review[];
  rating: PropertyRating;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? "fill-cedar text-cedar" : "text-border"}`}
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-muted-foreground">{star}</span>
      <Star className="size-3 fill-cedar text-cedar" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-cedar transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > 200;

  return (
    <div className="border-b pb-5 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {review.author[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{review.author}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.date).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {expanded || !isLong ? review.text : `${review.text.slice(0, 200)}...`}
        {isLong && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-1 font-medium text-foreground underline-offset-2 hover:underline"
          >
            Read more
          </button>
        )}
      </p>
      {review.recommends && (
        <div className="mt-2 flex items-center gap-1 text-xs text-forest">
          <ThumbsUp className="size-3" />
          <span>Recommends this site</span>
        </div>
      )}
    </div>
  );
}

export function ReviewsSection({ reviews, rating }: ReviewsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Reviews</h2>

      {/* Summary */}
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        <div className="shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{rating.average}</span>
            <span className="text-muted-foreground">out of 5</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating rating={Math.round(rating.average)} />
            <span className="text-sm text-muted-foreground">
              {rating.count} review{rating.count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              star={star}
              count={rating.breakdown[star] ?? 0}
              total={rating.count}
            />
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="mt-8 space-y-5">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {visibleCount < reviews.length && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setVisibleCount((c) => c + 5)}
        >
          Show more reviews
        </Button>
      )}
    </div>
  );
}

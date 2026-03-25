"use client";

import { Star } from "lucide-react";
import { getReviewsByService, getAverageRating, getReviewCount } from "@/lib/reviews-data";

interface ServiceReviewsProps {
  serviceSlug: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-700 text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function ServiceReviews({ serviceSlug }: ServiceReviewsProps) {
  const reviews = getReviewsByService(serviceSlug);
  const averageRating = getAverageRating(serviceSlug);
  const reviewCount = getReviewCount(serviceSlug);

  if (reviews.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl">
        {/* Header with rating summary */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold">What our clients say</h2>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-700 text-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-white">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
            >
              {/* Header: avatar, name, role */}
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-2xl border border-white/[0.06]">
                  {review.avatar || "👤"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">{review.author}</h3>
                  {review.role && (
                    <p className="text-xs text-gray-500 truncate">{review.role}</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                <StarRating rating={review.rating} />
              </div>

              {/* Review text */}
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                {review.text}
              </p>

              {/* Date */}
              <p className="text-xs text-gray-600">
                {new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

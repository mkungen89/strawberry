"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  published: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  order: { service: { name: string } };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "hidden">("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function togglePublished(id: string, published: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, published } : r));
      toast.success(published ? "Review published" : "Review hidden");
    } catch {
      toast.error("Update failed");
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : filter === "published" ? r.published : !r.published
  );

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">Moderate customer reviews. Published reviews appear on the site.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total reviews", value: reviews.length, color: "purple" },
            { label: "Published", value: reviews.filter((r) => r.published).length, color: "green" },
            { label: "Avg rating", value: avg, color: "amber" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["all", "published", "hidden"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "border-purple-500 bg-purple-600 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] p-12 text-center text-sm text-gray-600">
            No reviews yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Stars */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`}
                          />
                        ))}
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/20 text-xs">
                        {review.order.service.name}
                      </Badge>
                      {!review.published && (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/20 text-xs">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed mb-3">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-medium text-white">{review.user.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{review.user.email}</p>
                      <p className="text-xs text-gray-600 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublished(review.id, !review.published)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                      title={review.published ? "Hide" : "Publish"}
                    >
                      {review.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

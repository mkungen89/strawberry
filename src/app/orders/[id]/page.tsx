"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, CheckCircle, Clock, Star } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  senderId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  details: Record<string, string>;
  techStack?: Record<string, string>;
  service: { name: string; slug: string };
  messages: Message[];
  review?: Review | null;
}

const STATUS_STEPS = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "COMPLETED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (!res.ok) throw new Error();
      const newMsg = await res.json();
      setOrder((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
      setMessage("");
    } catch {
      toast.error("Could not send message.");
    } finally {
      setSending(false);
    }
  }

  async function submitReview() {
    if (!reviewRating || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/orders/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      const review = await res.json();
      setOrder((prev) => prev ? { ...prev, review } : prev);
      toast.success("Review submitted. Thank you!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Order not found.
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{order.service.name}</h1>
          <p className="mt-1 text-gray-400">
            Order #{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8 border-white/10 bg-white/5 text-white">
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold">Order status</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2 whitespace-nowrap">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i < currentStep
                        ? "bg-green-600 text-white"
                        : i === currentStep
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      i <= currentStep ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step.replace("_", " ")}
                  </span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-px w-8 ${i < currentStep ? "bg-green-600" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order details */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold">Order details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Package</p>
                  <p className="text-sm">{order.details.packageName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-300">{order.details.description}</p>
                </div>
                {order.techStack && (
                  <div>
                    <p className="text-xs text-gray-500">Tech stack</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(order.techStack).map(([k, v]) => (
                        <Badge key={k} className="bg-purple-600/20 text-purple-300 text-xs">
                          {k}: {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-400">Total paid</span>
                  <span className="text-xl font-bold text-purple-400">{order.totalPrice} kr</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold">Chat with our team</h2>
              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {order.messages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet. Ask us anything!</p>
                ) : (
                  order.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 text-sm ${
                        msg.isAdmin
                          ? "bg-purple-600/20 text-purple-100"
                          : "bg-white/10 text-gray-200"
                      }`}
                    >
                      <p className="mb-1 text-xs text-gray-400">
                        {msg.isAdmin ? "Vexcraft Team" : "You"} ·{" "}
                        {new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {msg.content}
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-12 resize-none border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || !message.trim()}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review section — only shown when order is COMPLETED */}
        {order.status === "COMPLETED" && (
          <div className="mt-6">
            {order.review ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <h2 className="font-semibold">Your Review</h2>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= order.review!.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-400">{order.review.rating}/5</span>
                  </div>
                  <p className="text-sm text-gray-300">{order.review.comment}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-purple-500/30 bg-white/5 text-white">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <h2 className="font-semibold">Leave a Review</h2>
                  </div>
                  <p className="mb-4 text-sm text-gray-400">
                    Your order is complete! Share your experience to help others.
                  </p>

                  {/* Star rating */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-gray-500">Rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= (reviewHover || reviewRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm text-gray-400">{reviewRating}/5</span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-gray-500">Comment</p>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="resize-none border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={submitReview}
                    disabled={submittingReview || !reviewRating || !reviewComment.trim()}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {submittingReview ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="mr-2 h-4 w-4" />
                    )}
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

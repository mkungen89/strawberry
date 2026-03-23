"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Send, CheckCircle, Clock, Star, Zap,
  FileText, CreditCard, ArrowLeft, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  percentage: number;
  status: string;
  completedAt: string | null;
  paidAt: string | null;
  sortOrder: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  currency: string;
  paymentType: string;
  createdAt: string;
  details: Record<string, string>;
  techStack?: Record<string, string>;
  service: { name: string; slug: string };
  messages: Message[];
  review?: Review | null;
}

const STATUS_STEPS = [
  { key: "PENDING", label: "Pending" },
  { key: "PAID", label: "Paid" },
  { key: "IN_PROGRESS", label: "Building" },
  { key: "REVIEW", label: "Review" },
  { key: "COMPLETED", label: "Done" },
];

const MILESTONE_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-gray-400" },
  IN_PROGRESS: { label: "In progress", color: "text-purple-400" },
  COMPLETED: { label: "Completed", color: "text-green-400" },
  PAID: { label: "Paid", color: "text-blue-400" },
};

const INVOICE_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-500/20 text-gray-300" },
  SENT: { label: "Sent", color: "bg-blue-500/20 text-blue-300" },
  PAID: { label: "Paid", color: "bg-green-500/20 text-green-300" },
  OVERDUE: { label: "Overdue", color: "bg-red-500/20 text-red-300" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "milestones" | "invoices">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${id}`).then((r) => r.json()),
      fetch(`/api/orders/${id}/milestones`).then((r) => r.json()).catch(() => []),
      fetch(`/api/orders/${id}/invoices`).then((r) => r.json()).catch(() => []),
    ]).then(([orderData, msData, invData]) => {
      setOrder(orderData.error ? null : orderData);
      setMilestones(Array.isArray(msData) ? msData : []);
      setInvoices(Array.isArray(invData) ? invData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.messages]);

  // Poll for new messages
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length !== order.messages.length) {
            setOrder(data);
          }
        }
      } catch { /* silent */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [id, order?.messages?.length, order]);

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
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-gray-400">Order not found.</p>
        <Link href="/dashboard">
          <Button variant="ghost" className="border border-white/20 bg-transparent text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const completedMilestones = milestones.filter((m) => m.status === "COMPLETED" || m.status === "PAID").length;
  const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-400 transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{order.service.name}</h1>
            <p className="mt-1 text-gray-400">
              Order #{order.id.slice(-8).toUpperCase()} · {order.details?.packageName} · {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">${order.totalPrice.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{order.paymentType === "MILESTONE" ? "Milestone payments" : "Paid in full"}</p>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="mb-5 font-semibold text-sm text-gray-400 uppercase tracking-wider">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const isComplete = i < currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      isComplete
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                        : isCurrent
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-4 ring-purple-600/20"
                        : "bg-white/[0.05] text-gray-600 border border-white/[0.08]"
                    }`}>
                      {isComplete ? <CheckCircle className="h-5 w-5" /> : isCurrent ? <Zap className="h-5 w-5" /> : i + 1}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isComplete ? "text-green-400" : isCurrent ? "text-purple-400" : "text-gray-600"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 rounded-full ${
                      i < currentStepIdx ? "bg-green-500" : "bg-white/[0.06]"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Queue message */}
          {order.status === "PAID" && (
            <div className="mt-5 rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
              <p className="text-sm text-blue-300">
                <Clock className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Your order is in our queue. We&apos;ll start working on it shortly and notify you when work begins!
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {order.details?.description && (
          <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="mb-3 font-semibold">Project brief</h2>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{order.details.description}</p>
            {order.techStack && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(order.techStack).map(([k, v]) => (
                  <Badge key={k} className="bg-purple-600/10 text-purple-300 border border-purple-500/20 text-xs">
                    {k}: {v}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs: Chat / Milestones / Invoices */}
        <div className="mb-6 flex gap-2">
          {[
            { key: "chat" as const, label: "Chat", icon: <MessageCircle className="h-4 w-4" />, count: order.messages.length },
            { key: "milestones" as const, label: "Milestones", icon: <Zap className="h-4 w-4" />, count: milestones.length },
            { key: "invoices" as const, label: "Invoices", icon: <FileText className="h-4 w-4" />, count: invoices.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                  : "bg-white/[0.02] text-gray-500 border border-white/[0.06] hover:text-white hover:border-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? "bg-purple-500/30" : "bg-white/[0.05]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat tab */}
        {activeTab === "chat" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold">Chat with our team</h2>
              <p className="text-xs text-gray-500 mt-1">Ask questions, request features, or share feedback. We typically reply within a few hours.</p>
            </div>

            <div className="h-96 overflow-y-auto p-5 space-y-4">
              {order.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-10 w-10 text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-600 text-xs mt-1">Ask us anything about your project!</p>
                </div>
              ) : (
                order.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.isAdmin
                        ? "bg-white/[0.05] text-gray-200 border border-white/[0.08] rounded-bl-md"
                        : "bg-purple-600 text-white rounded-br-md"
                    }`}>
                      {msg.isAdmin && (
                        <p className="text-xs font-medium text-purple-400 mb-1">Vexcraft Team</p>
                      )}
                      {msg.content}
                      <p className={`text-[10px] mt-1.5 ${msg.isAdmin ? "text-gray-600" : "text-purple-200"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message... (Enter to send)"
                  className="min-h-12 max-h-32 resize-none border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 text-sm"
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
                  className="bg-purple-600 text-white hover:bg-purple-700 px-4 shrink-0"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Milestones tab */}
        {activeTab === "milestones" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            {milestones.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="mx-auto h-10 w-10 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">No milestones set up for this order</p>
                <p className="text-gray-600 text-xs mt-1">Milestones are used for larger projects to track progress step by step.</p>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Overall progress</p>
                    <p className="text-sm text-purple-400 font-bold">{milestoneProgress}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>
                </div>

                {/* Milestone list */}
                <div className="space-y-0">
                  {milestones.map((ms, i) => {
                    const msStatus = MILESTONE_STATUS[ms.status] || MILESTONE_STATUS.PENDING;
                    const isComplete = ms.status === "COMPLETED" || ms.status === "PAID";
                    return (
                      <div key={ms.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isComplete
                              ? "bg-green-500 text-white"
                              : ms.status === "IN_PROGRESS"
                              ? "bg-purple-600 text-white ring-4 ring-purple-600/20"
                              : "bg-white/[0.05] text-gray-600 border border-white/[0.08]"
                          }`}>
                            {isComplete ? <CheckCircle className="h-4 w-4" /> : i + 1}
                          </div>
                          {i < milestones.length - 1 && (
                            <div className={`w-px flex-1 my-1 ${isComplete ? "bg-green-500/50" : "bg-white/[0.06]"}`} />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{ms.title}</h3>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-medium ${msStatus.color}`}>{msStatus.label}</span>
                              <span className="text-sm font-bold text-purple-400">${ms.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          {ms.description && (
                            <p className="text-sm text-gray-400 mt-1">{ms.description}</p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">{ms.percentage}% of total</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Invoices tab */}
        {activeTab === "invoices" && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-10 w-10 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">No invoices yet</p>
                <p className="text-gray-600 text-xs mt-1">Invoices will appear here once generated.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => {
                  const invStatus = INVOICE_STATUS[inv.status] || INVOICE_STATUS.DRAFT;
                  return (
                    <div key={inv.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                          <CreditCard className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{inv.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            {inv.dueDate ? `Due: ${new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "No due date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`text-xs ${invStatus.color}`}>{invStatus.label}</Badge>
                        <span className="font-bold text-purple-400">${inv.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Review section */}
        {order.status === "COMPLETED" && (
          <div className="mt-8">
            {order.review ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h2 className="font-semibold mb-3">Your review</h2>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-5 w-5 ${star <= order.review!.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-300">{order.review.comment}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-600/5 p-6">
                <h2 className="font-semibold mb-2">Leave a review</h2>
                <p className="text-sm text-gray-400 mb-4">Your order is complete! Share your experience.</p>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-7 w-7 ${star <= (reviewHover || reviewRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                    </button>
                  ))}
                  {reviewRating > 0 && <span className="ml-2 text-sm text-gray-400">{reviewRating}/5</span>}
                </div>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="resize-none border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 mb-4"
                  rows={3}
                />
                <Button
                  onClick={submitReview}
                  disabled={submittingReview || !reviewRating || !reviewComment.trim()}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  {submittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
                  Submit review
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

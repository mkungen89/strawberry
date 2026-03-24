"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Loader2, BarChart2, Calendar, MessageCircle, Star, FileText,
  TrendingUp, Users, Eye, Heart, ChevronRight, Plus, AlertCircle,
  CheckCircle2, Clock, Download, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CMMetric {
  id: string;
  platform: string;
  followers: number;
  engagementRate: number;
  postsCount: number;
  reach: number;
  impressions: number;
  recordedAt: string;
}

interface CMContent {
  id: string;
  platform: string;
  title: string;
  body?: string;
  status: string;
  scheduledAt: string;
  postedAt?: string;
  createdBy: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
}

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

interface DashboardData {
  customer: { id: string; name: string; email: string };
  activeSubscription: {
    id: string;
    service: string;
    package: string;
    status: string;
    startedAt: string;
  } | null;
  allOrders: Array<{
    id: string;
    service: string;
    package?: string;
    status: string;
    totalPrice: number;
    currency: string;
    createdAt: string;
  }>;
  metrics: CMMetric[];
  contentCalendar: CMContent[];
  feedbackHistory: Array<{ id: string; rating: number; comment?: string; createdAt: string }>;
  invoices: Invoice[];
  recentMessages: Message[];
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮",
  twitter: "🐦",
  instagram: "📸",
  reddit: "🤖",
  tiktok: "🎵",
  twitch: "🟣",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  POSTED: "bg-green-500/20 text-green-300 border-green-500/20",
  DRAFT: "bg-gray-500/20 text-gray-300 border-gray-500/20",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/20",
};

function MetricCard({ label, value, icon, trend }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-gray-600">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend.positive ? "text-green-400" : "text-red-400"}`}>
          {trend.positive ? "+" : ""}{trend.value} this month
        </p>
      )}
    </div>
  );
}

function FeedbackForm({ customerId, onSubmitted }: { customerId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setLoading(true);
    const res = await fetch(`/api/customer/${customerId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment, category }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Thank you for your feedback! ⭐");
      setRating(0);
      setComment("");
      onSubmitted();
    } else {
      toast.error("Failed to submit feedback");
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-400" />
        Rate our Community Management
      </h3>

      {/* Star rating */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setRating(s)}
            className={`text-2xl transition-all ${s <= rating ? "text-yellow-400" : "text-gray-700 hover:text-yellow-600"}`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Category */}
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full mb-3 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/40"
      >
        <option value="GENERAL">General</option>
        <option value="CONTENT">Content Quality</option>
        <option value="RESPONSE_TIME">Response Time</option>
        <option value="RESULTS">Results / Growth</option>
        <option value="MANAGER">Account Manager</option>
      </select>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Any additional comments? (optional)"
        className="w-full mb-3 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40 min-h-20 resize-none"
      />

      <Button
        onClick={submit}
        disabled={loading || rating === 0}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
      </Button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CustomerCMDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "metrics" | "messages" | "billing">("overview");

  const fetchDashboard = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/customer/${session.user.id}/dashboard`);
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setData(d);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login?redirect=/customer/dashboard");
    if (session) fetchDashboard();
  }, [session, isPending, router, fetchDashboard]);

  // Poll every 60s
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 60_000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!session || !data) return null;

  const hasCMSub = !!data.activeSubscription;

  // Compute summary metrics from recent records
  const latestMetrics = data.metrics.length > 0 ? data.metrics[data.metrics.length - 1] : null;
  const firstMetrics = data.metrics.length > 0 ? data.metrics[0] : null;
  const followerGrowth = latestMetrics && firstMetrics
    ? (latestMetrics.followers ?? 0) - (firstMetrics.followers ?? 0)
    : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart2 className="h-4 w-4" /> },
    { id: "calendar", label: "Content Calendar", icon: <Calendar className="h-4 w-4" /> },
    { id: "metrics", label: "Metrics", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "messages", label: "Messages", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <FileText className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">👥</span>
              Community Management
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {data.customer.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Active Subscription Badge */}
        {hasCMSub ? (
          <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-600/[0.05] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {data.activeSubscription!.package} Plan — Active
                </p>
                <p className="text-xs text-gray-500">
                  Started {new Date(data.activeSubscription!.startedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.03] p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">No active Community Management subscription</p>
              <p className="text-xs text-gray-500">
                <Link href="/services/community-management" className="text-purple-400 hover:underline">
                  View our plans →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Follower Growth"
                value={followerGrowth >= 0 ? `+${followerGrowth}` : followerGrowth}
                icon={<Users className="h-4 w-4" />}
                trend={followerGrowth !== 0 ? { value: followerGrowth, positive: followerGrowth >= 0 } : undefined}
              />
              <MetricCard
                label="Avg Engagement"
                value={latestMetrics
                  ? `${(data.metrics.reduce((s, m) => s + m.engagementRate, 0) / data.metrics.length).toFixed(1)}%`
                  : "—"}
                icon={<Heart className="h-4 w-4" />}
              />
              <MetricCard
                label="Posts This Month"
                value={data.metrics.reduce((s, m) => s + m.postsCount, 0)}
                icon={<BarChart2 className="h-4 w-4" />}
              />
              <MetricCard
                label="Total Reach"
                value={data.metrics.reduce((s, m) => s + m.reach, 0).toLocaleString()}
                icon={<Eye className="h-4 w-4" />}
              />
            </div>

            {/* Upcoming posts */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Upcoming Content
              </h3>
              {data.contentCalendar.filter(c => c.status === "SCHEDULED").length === 0 ? (
                <p className="text-sm text-gray-600 py-4 text-center">No scheduled content yet — your manager is working on it!</p>
              ) : (
                <div className="space-y-2">
                  {data.contentCalendar
                    .filter(c => c.status === "SCHEDULED")
                    .slice(0, 5)
                    .map(post => (
                      <div key={post.id} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                        <span className="text-lg">{PLATFORM_ICONS[post.platform] ?? "📢"}</span>
                        <div className="flex-1">
                          <p className="text-sm text-white">{post.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.scheduledAt).toLocaleString("en-GB", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                            {" · by "}{post.createdBy}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS[post.status] ?? ""}>{post.status}</Badge>
                      </div>
                    ))}
                  {data.contentCalendar.filter(c => c.status === "SCHEDULED").length > 5 && (
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className="w-full text-xs text-purple-400 hover:text-purple-300 py-2 text-center"
                    >
                      View all scheduled posts →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Feedback form */}
            <FeedbackForm customerId={data.customer.id} onSubmitted={fetchDashboard} />
          </div>
        )}

        {/* ── Content Calendar Tab ── */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Content Calendar</h2>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
                onClick={() => {
                  toast.info("Send a message to your manager to request new content");
                  setActiveTab("messages");
                }}
              >
                <Plus className="h-4 w-4" />
                Request Post
              </Button>
            </div>

            {data.contentCalendar.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-gray-700" />
                <p className="text-gray-500">No content scheduled yet.</p>
                <p className="text-xs text-gray-700 mt-1">Your manager will populate the calendar soon.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.contentCalendar.map(post => (
                  <div key={post.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{PLATFORM_ICONS[post.platform] ?? "📢"}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-white">{post.title}</p>
                          <Badge className={STATUS_COLORS[post.status] ?? ""}>{post.status}</Badge>
                        </div>
                        {post.body && <p className="text-sm text-gray-400 mt-1">{post.body}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.scheduledAt).toLocaleString("en-GB", {
                              weekday: "short", day: "numeric", month: "short",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                          <span>by {post.createdBy}</span>
                          {post.postedAt && (
                            <span className="text-green-500 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Posted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Metrics Tab ── */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Performance Metrics</h2>

            {data.metrics.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                <BarChart2 className="mx-auto mb-3 h-8 w-8 text-gray-700" />
                <p className="text-gray-500">No metrics recorded yet.</p>
                <p className="text-xs text-gray-700 mt-1">Metrics are updated monthly by your account manager.</p>
              </div>
            ) : (
              <>
                {/* Summary by platform */}
                {Array.from(new Set(data.metrics.map(m => m.platform))).map(platform => {
                  const platformMetrics = data.metrics.filter(m => m.platform === platform);
                  const latest = platformMetrics[platformMetrics.length - 1];
                  const first = platformMetrics[0];
                  return (
                    <div key={platform} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <span>{PLATFORM_ICONS[platform] ?? "📢"}</span>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Followers</p>
                          <p className="text-xl font-bold text-white">{latest.followers.toLocaleString()}</p>
                          {first !== latest && (
                            <p className="text-xs text-green-400">+{(latest.followers - first.followers).toLocaleString()}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Engagement</p>
                          <p className="text-xl font-bold text-white">{latest.engagementRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reach</p>
                          <p className="text-xl font-bold text-white">{latest.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Impressions</p>
                          <p className="text-xl font-bold text-white">{latest.impressions.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Messages Tab ── */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Chat with Your Manager</h2>
            {data.activeSubscription ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {data.recentMessages.length === 0 ? (
                    <p className="text-sm text-gray-600 py-8 text-center">No messages yet. Send a message to get started!</p>
                  ) : (
                    data.recentMessages.slice().reverse().map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}>
                        <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                          msg.isAdmin
                            ? "bg-white/[0.06] text-white"
                            : "bg-purple-600/30 text-white"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] text-gray-500 mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleString("en-GB", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/orders/${data.activeSubscription.id}`}
                    className="flex items-center gap-2 w-full rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors text-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open Full Chat
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-gray-700" />
                <p className="text-gray-500">No active subscription</p>
                <p className="text-xs text-gray-700 mt-1">Subscribe to Community Management to chat with your manager.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Billing Tab ── */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Billing History</h2>

            {data.invoices.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-gray-700" />
                <p className="text-gray-500">No invoices yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.invoices.map(invoice => (
                  <div key={invoice.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">#{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        {invoice.dueDate
                          ? `Due: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`
                          : invoice.paidAt
                          ? `Paid: ${new Date(invoice.paidAt).toLocaleDateString("en-GB")}`
                          : "—"}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {invoice.currency === "USD" ? "$" : invoice.currency === "GBP" ? "£" : "€"}
                      {invoice.amount.toFixed(2)}
                    </p>
                    <Badge className={
                      invoice.status === "PAID"
                        ? "bg-green-500/20 text-green-300 border-green-500/20"
                        : invoice.status === "OVERDUE"
                        ? "bg-red-500/20 text-red-300 border-red-500/20"
                        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/20"
                    }>
                      {invoice.status}
                    </Badge>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Package,
  Link as LinkIcon,
  LayoutGrid,
  Activity,
  RotateCcw,
  StickyNote,
  Plus,
  Pin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:     { label: "Pending",      color: "bg-yellow-500/20 text-yellow-300", icon: <Clock className="h-3 w-3" /> },
  PAID:        { label: "Paid",         color: "bg-blue-500/20 text-blue-300",     icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress",  color: "bg-purple-500/20 text-purple-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  REVIEW:      { label: "Under Review", color: "bg-orange-500/20 text-orange-300", icon: <Clock className="h-3 w-3" /> },
  REVISION:    { label: "Revision",     color: "bg-pink-500/20 text-pink-300",     icon: <Clock className="h-3 w-3" /> },
  COMPLETED:   { label: "Completed",    color: "bg-green-500/20 text-green-300",   icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED:   { label: "Cancelled",    color: "bg-red-500/20 text-red-300",       icon: <XCircle className="h-3 w-3" /> },
};

const STATUSES = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "REVISION", "COMPLETED", "CANCELLED"];

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  senderId: string;
}

interface OrderNote {
  id: string;
  authorName: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  invoiceUrl: string | null;
  details: Record<string, string>;
  techStack?: Record<string, string>;
  service: { name: string; slug: string };
  user: { id: string; name: string | null; email: string };
  messages: Message[];
}

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  actorName: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

type Tab = "overview" | "activity";

// ─── Activity Timeline ────────────────────────────────────────────────────────

function ActivityTimeline({ orderId }: { orderId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}/activity`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: ActivityItem[]) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="mb-3 h-10 w-10 text-gray-700" />
        <p className="text-gray-400">No activity yet.</p>
        <p className="mt-1 text-xs text-gray-600">
          Events like status changes and messages will appear here.
        </p>
      </div>
    );
  }

  const isAdminAction = (actorName: string) =>
    actorName !== "System" && actorName.toLowerCase() !== "system";

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-px bg-white/[0.06]" />

      <div className="space-y-0">
        {items.map((item, idx) => (
          <div key={item.id} className="relative flex gap-4 pb-6">
            {/* Dot */}
            <div className="relative z-10 mt-1 shrink-0">
              <div
                className={`h-[14px] w-[14px] rounded-full border-2 ${
                  isAdminAction(item.actorName)
                    ? "border-purple-500 bg-purple-500/30"
                    : "border-gray-600 bg-gray-800"
                } ${idx === 0 ? "border-purple-400 bg-purple-500/50" : ""}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                <span
                  className={`text-sm font-medium ${
                    isAdminAction(item.actorName) ? "text-purple-300" : "text-gray-400"
                  }`}
                >
                  {item.actorName}
                </span>
                <span className="text-xs text-gray-600">
                  {item.action.replace(/_/g, " ").toLowerCase()}
                </span>
                <span className="ml-auto text-xs text-gray-700 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [requestingRevision, setRequestingRevision] = useState(false);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // AI concept generation
  const [generatingConcepts, setGeneratingConcepts] = useState(false);
  const [aiConcepts, setAiConcepts] = useState<Array<{
    title: string;
    description: string;
    midjourneyPrompt: string | null;
  }> | null>(null);
  const [publishingConcepts, setPublishingConcepts] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && (session.user as { role?: string }).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const loadOrder = useCallback(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}`).then((r) => r.json()),
      fetch(`/api/admin/orders/${id}/enterprise`).then((r) => r.ok ? r.json() : { notes: [] }),
    ])
      .then(([data, enterprise]) => {
        setOrder(data);
        setSelectedStatus(data.status);
        setInvoiceUrl(data.invoiceUrl ?? "");
        setNotes(enterprise.notes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (session && (session.user as { role?: string }).role === "ADMIN") {
      loadOrder();
    }
  }, [session, loadOrder]);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => (prev ? { ...prev, status } : prev));
      setSelectedStatus(status);
      toast.success("Status updated.");
    } catch {
      toast.error("Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function saveInvoice() {
    setSavingInvoice(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceUrl }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => (prev ? { ...prev, invoiceUrl } : prev));
      toast.success("Invoice URL saved.");
    } catch {
      toast.error("Could not save invoice URL.");
    } finally {
      setSavingInvoice(false);
    }
  }

  async function markDelivered() {
    setDelivering(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      setSelectedStatus("COMPLETED");
      toast.success("Order marked as delivered.");
    } catch {
      toast.error("Could not update order.");
    } finally {
      setDelivering(false);
    }
  }

  async function requestRevision() {
    setRequestingRevision(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVISION" }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => (prev ? { ...prev, status: "REVISION" } : prev));
      setSelectedStatus("REVISION");
      toast.success("Order sent back for revision.");
    } catch {
      toast.error("Could not request revision.");
    } finally {
      setRequestingRevision(false);
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/enterprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "note", content: newNote.trim(), pinned: false }),
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
      toast.success("Note added.");
    } catch {
      toast.error("Could not add note.");
    } finally {
      setAddingNote(false);
    }
  }

  async function generateConcepts() {
    setGeneratingConcepts(true);
    setAiConcepts(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/generate-concepts`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setAiConcepts(data.concepts);
      setExpandedConcept(0);
      toast.success(`Generated ${data.concepts.length} concepts from brief`);
    } catch {
      toast.error("AI generation failed. Check ANTHROPIC_API_KEY.");
    } finally {
      setGeneratingConcepts(false);
    }
  }

  async function publishConcepts() {
    if (!aiConcepts) return;
    setPublishingConcepts(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: aiConcepts }),
      });
      if (!res.ok) throw new Error();
      setAiConcepts(null);
      toast.success("Concepts published to customer for review");
      loadOrder();
    } catch {
      toast.error("Failed to publish concepts");
    } finally {
      setPublishingConcepts(false);
    }
  }

  async function copyMidjourneyPrompt(prompt: string, idx: number) {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  }

  async function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (!res.ok) throw new Error();
      const newMsg = await res.json();
      setOrder((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
      );
      setMessage("");
    } catch {
      toast.error("Could not send message.");
    } finally {
      setSending(false);
    }
  }

  if (isPending || loading) {
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

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview",  label: "Overview",  icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "activity",  label: "Activity",  icon: <Activity className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{order.service.name}</h1>
              <Badge className={`flex items-center gap-1 ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-gray-400">
              Order #{order.id.slice(-8).toUpperCase()} ·{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={requestRevision}
              disabled={requestingRevision || order.status === "REVISION" || order.status === "COMPLETED" || order.status === "CANCELLED"}
              variant="outline"
              className="border-pink-500/40 text-pink-300 hover:bg-pink-500/10 disabled:opacity-40"
            >
              {requestingRevision ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Request Revision
            </Button>
            <Button
              onClick={markDelivered}
              disabled={delivering || order.status === "COMPLETED"}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {delivering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark Delivered
            </Button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mb-6 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/20"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer info */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <h2 className="font-semibold">Customer</h2>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm">{order.user.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-300">{order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-xs font-mono text-gray-500">{order.user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order details */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-400" />
                  <h2 className="font-semibold">Order Details</h2>
                </div>
                <div className="space-y-3">
                  {order.details.packageName && (
                    <div>
                      <p className="text-xs text-gray-500">Package</p>
                      <p className="text-sm">{order.details.packageName}</p>
                    </div>
                  )}
                  {order.details.description && (
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {order.details.description}
                      </p>
                    </div>
                  )}
                  {order.techStack && Object.keys(order.techStack).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Tech Stack</p>
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
                    <span className="text-gray-400">Total price</span>
                    <span className="text-xl font-bold text-purple-400">
                      ${order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status management */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <h2 className="mb-4 font-semibold">Manage Order</h2>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm text-gray-400">Update Status</p>
                    <div className="flex gap-2">
                      <Select
                        value={selectedStatus}
                        onValueChange={(v) => v && setSelectedStatus(v)}
                      >
                        <SelectTrigger className="border-white/20 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => updateStatus(selectedStatus)}
                        disabled={updatingStatus || selectedStatus === order.status}
                        className="bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                      >
                        {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-gray-400">Invoice URL</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          value={invoiceUrl}
                          onChange={(e) => setInvoiceUrl(e.target.value)}
                          placeholder="https://invoice.example.com/..."
                          className="pl-9 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                        />
                      </div>
                      <Button
                        onClick={saveInvoice}
                        disabled={savingInvoice}
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 shrink-0"
                      >
                        {savingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                    {order.invoiceUrl && (
                      <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-purple-400 hover:underline"
                      >
                        View current invoice
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages / Chat */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <h2 className="mb-4 font-semibold">Chat with Customer</h2>
                <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                  {order.messages.length === 0 ? (
                    <p className="text-sm text-gray-500">No messages yet.</p>
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
                          {msg.isAdmin ? "You (Admin)" : order.user.name ?? "Customer"} ·{" "}
                          {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                    placeholder="Reply to customer..."
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

            {/* AI Concepts — auto-generated when IN_PROGRESS */}
            <Card className="border-white/10 bg-white/5 text-white lg:col-span-2">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h2 className="font-semibold">AI Concepts</h2>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    Auto-generated
                  </span>
                  <span className="ml-auto text-xs text-gray-600">Sent to customer for review</span>
                </div>

                {/* Customer brief preview */}
                {(order.details as { description?: string })?.description && (
                  <div className="mb-4 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    <p className="text-xs text-gray-500 mb-1">Customer brief</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                      {(order.details as { description?: string }).description}
                    </p>
                  </div>
                )}

                {/* Status indicator when IN_PROGRESS */}
                {order.status === "IN_PROGRESS" && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/[0.06] border border-purple-500/20 mb-4">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <p className="text-sm text-purple-300">
                      Generating concepts from brief... Customer will be notified automatically.
                    </p>
                  </div>
                )}

                {/* If not yet started */}
                {(order.status === "PAID" || order.status === "PENDING") && (
                  <p className="text-sm text-gray-500 mb-4">
                    Concepts will be generated automatically when you set the order to <strong className="text-white">In Progress</strong>.
                  </p>
                )}

                {/* Manual regenerate panel */}
                {!aiConcepts ? (
                  <Button
                    variant="outline"
                    onClick={generateConcepts}
                    disabled={generatingConcepts || !(order.details as { description?: string })?.description}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    {generatingConcepts ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Regenerate Concepts</>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {aiConcepts.map((concept, idx) => (
                      <div key={idx} className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04]">
                        <button
                          onClick={() => setExpandedConcept(expandedConcept === idx ? null : idx)}
                          className="w-full flex items-center gap-3 p-4 text-left"
                        >
                          <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-white flex-1">{concept.title}</span>
                          {expandedConcept === idx ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                        </button>
                        {expandedConcept === idx && (
                          <div className="px-4 pb-4 space-y-3">
                            <p className="text-sm text-gray-300 leading-relaxed">{concept.description}</p>
                            {concept.midjourneyPrompt && (
                              <div className="rounded-lg bg-black/30 border border-white/[0.06] p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500 font-medium">Midjourney Prompt</span>
                                  <button
                                    onClick={() => copyMidjourneyPrompt(concept.midjourneyPrompt!, idx)}
                                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                                  >
                                    {copiedPrompt === idx ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                                  </button>
                                </div>
                                <p className="text-xs text-gray-400 font-mono leading-relaxed">{concept.midjourneyPrompt}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" onClick={() => setAiConcepts(null)} className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        Back
                      </Button>
                      <Button onClick={publishConcepts} disabled={publishingConcepts} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                        {publishingConcepts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Publish to Customer
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card className="border-white/10 bg-white/5 text-white lg:col-span-2">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-purple-400" />
                  <h2 className="font-semibold">Internal Notes</h2>
                  <span className="ml-auto text-xs text-gray-600">Not visible to customer</span>
                </div>
                <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-sm text-gray-500">No notes yet.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {note.pinned && <Pin className="h-3 w-3 text-yellow-400" />}
                          <span className="text-xs text-gray-500">{note.authorName}</span>
                          <span className="ml-auto text-xs text-gray-700">
                            {new Date(note.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="min-h-10 resize-none border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                    }}
                  />
                  <Button
                    onClick={addNote}
                    disabled={addingNote || !newNote.trim()}
                    className="bg-purple-600 text-white hover:bg-purple-700 shrink-0"
                  >
                    {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === "activity" && (
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold">Activity Timeline</h2>
              </div>
              <ActivityTimeline orderId={id} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

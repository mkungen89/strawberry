"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle, Clock, XCircle, User, Package, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300", icon: <Clock className="h-3 w-3" /> },
  PAID: { label: "Paid", color: "bg-blue-500/20 text-blue-300", icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-500/20 text-purple-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  REVIEW: { label: "Under Review", color: "bg-orange-500/20 text-orange-300", icon: <Clock className="h-3 w-3" /> },
  REVISION: { label: "Revision", color: "bg-pink-500/20 text-pink-300", icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-300", icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300", icon: <XCircle className="h-3 w-3" /> },
};

const STATUSES = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "REVISION", "COMPLETED", "CANCELLED"];

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  senderId: string;
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

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && (session.user as { role?: string }).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string }).role === "ADMIN") {
      fetch(`/api/admin/orders/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data);
          setSelectedStatus(data.status);
          setInvoiceUrl(data.invoiceUrl ?? "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, id]);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrder((prev) => prev ? { ...prev, status } : prev);
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
      setOrder((prev) => prev ? { ...prev, invoiceUrl } : prev);
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
      setOrder((prev) => prev ? { ...prev, status: "COMPLETED" } : prev);
      setSelectedStatus("COMPLETED");
      toast.success("Order marked as delivered.");
    } catch {
      toast.error("Could not update order.");
    } finally {
      setDelivering(false);
    }
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
      setOrder((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
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

  return (
    <div className="min-h-screen text-white">
      
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{order.service.name}</h1>
              <Badge className={`flex items-center gap-1 ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-gray-400">
              Order #{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={markDelivered}
              disabled={delivering || order.status === "COMPLETED"}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {delivering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Mark Delivered
            </Button>
          </div>
        </div>

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
                    <p className="text-sm text-gray-300 leading-relaxed">{order.details.description}</p>
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
                  <span className="text-xl font-bold text-purple-400">${order.totalPrice.toLocaleString()}</span>
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
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
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
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Package, DollarSign, Clock, Users, Zap, CheckCircle, XCircle,
  ArrowRight, MessageCircle, Shield, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  priority: string;
  deadline: string | null;
  service: { name: string; icon?: string };
  user: { name: string | null; email: string };
  details: { packageName?: string; description?: string };
  _count?: { messages: number };
}

const STATUSES = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "REVISION", "COMPLETED", "CANCELLED"];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  PAID: { label: "In Queue", color: "bg-blue-500/20 text-blue-300 border-blue-500/20", icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "Building", color: "bg-purple-500/20 text-purple-300 border-purple-500/20", icon: <Zap className="h-3 w-3" /> },
  REVIEW: { label: "Review", color: "bg-orange-500/20 text-orange-300 border-orange-500/20", icon: <Clock className="h-3 w-3" /> },
  REVISION: { label: "Revision", color: "bg-pink-500/20 text-pink-300 border-pink-500/20", icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: "Done", color: "bg-green-500/20 text-green-300 border-green-500/20", icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300 border-red-500/20", icon: <XCircle className="h-3 w-3" /> },
};

const PRIORITY_CONFIG: Record<string, string> = {
  LOW: "text-gray-400",
  NORMAL: "text-blue-400",
  HIGH: "text-orange-400",
  URGENT: "text-red-400",
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && (session.user as { role?: string }).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session && (session.user as { role?: string }).role === "ADMIN") {
      fetch("/api/admin/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  async function updateStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Status updated.");
    } catch {
      toast.error("Could not update status.");
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const totalRevenue = orders.filter((o) => !["CANCELLED", "PENDING"].includes(o.status)).reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const paidQueue = orders.filter((o) => o.status === "PAID");
  const uniqueCustomers = new Set(orders.map((o) => o.user.email)).size;

  const filteredOrders = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/20">
                <Shield className="mr-1 h-3 w-3" /> Admin
              </Badge>
            </div>
            <p className="text-gray-400">Manage orders, customers, and team operations.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/kanban">
              <Button variant="ghost" className="border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
                <Shield className="mr-2 h-4 w-4" /> Kanban Board
              </Button>
            </Link>
            <Link href="/admin/chat">
              <Button variant="ghost" className="border border-white/20 bg-transparent text-white hover:bg-white/10">
                <MessageCircle className="mr-2 h-4 w-4" /> Live Chats
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5 text-green-400" />, bg: "from-green-500/10 to-green-600/5", sub: `${orders.filter(o => o.status === "COMPLETED").length} completed` },
            { label: "Active Orders", value: activeOrders.length, icon: <Zap className="h-5 w-5 text-purple-400" />, bg: "from-purple-500/10 to-purple-600/5", sub: `${paidQueue.length} in queue` },
            { label: "Customers", value: uniqueCustomers, icon: <Users className="h-5 w-5 text-blue-400" />, bg: "from-blue-500/10 to-blue-600/5", sub: "unique accounts" },
            { label: "Avg. Order", value: orders.length ? `$${Math.round(totalRevenue / Math.max(orders.filter(o => !["CANCELLED", "PENDING"].includes(o.status)).length, 1))}` : "$0", icon: <TrendingUp className="h-5 w-5 text-yellow-400" />, bg: "from-yellow-500/10 to-yellow-600/5", sub: "per order" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${stat.bg} p-5`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Urgent queue */}
        {paidQueue.length > 0 && (
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-medium text-blue-300">{paidQueue.length} order{paidQueue.length > 1 ? "s" : ""} waiting in queue</p>
                <p className="text-sm text-gray-400 mt-1">These customers have paid and are waiting for work to begin.</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter + Orders */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold">Orders ({filteredOrders.length})</h2>
          <div className="flex gap-2 flex-wrap">
            {["ALL", ...STATUSES].map((s) => {
              const count = s === "ALL" ? orders.length : orders.filter(o => o.status === s).length;
              if (count === 0 && s !== "ALL") return null;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filter === s
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                      : "bg-white/[0.02] text-gray-500 border border-white/[0.06] hover:text-white"
                  }`}
                >
                  {s === "ALL" ? "All" : s.replace("_", " ")} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <p className="text-gray-400">No orders match this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Order info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-2xl shrink-0">
                        {order.service.icon || "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white">{order.service.name}</h3>
                          {order.details?.packageName && (
                            <span className="text-sm text-gray-500">· {order.details.packageName}</span>
                          )}
                          <Badge className={`flex items-center gap-1 border text-xs ${status.color}`}>
                            {status.icon} {status.label}
                          </Badge>
                          {order.priority && order.priority !== "NORMAL" && (
                            <span className={`text-xs font-bold ${PRIORITY_CONFIG[order.priority] || ""}`}>
                              {order.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{order.user.name || "—"} · {order.user.email}</p>
                        {order.details?.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{order.details.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>#{order.id.slice(-8).toUpperCase()}</span>
                          {order.deadline && (
                            <span className="text-orange-400">Due: {new Date(order.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xl font-bold text-purple-400">${order.totalPrice.toLocaleString()}</span>
                      <Select
                        value={order.status}
                        onValueChange={(v) => v && updateStatus(order.id, v)}
                      >
                        <SelectTrigger className="w-36 border-white/10 bg-white/[0.03] text-white text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10 text-white">
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="ghost" className="border border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/10 h-8">
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

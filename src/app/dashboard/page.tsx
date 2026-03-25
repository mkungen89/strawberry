"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  MessageCircle,
  Zap,
  Sparkles,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-data";
import { ORDER_STATUS_CONFIG } from "@/lib/order-status";
import { toast } from "sonner";

interface Subscription {
  id: string;
  planSlug: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const STATUS_CONFIG = ORDER_STATUS_CONFIG;

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  service: { name: string; icon?: string; slug?: string };
  details: { packageName?: string; description?: string };
  _count?: { messages: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      fetch("/api/subscriptions/current")
        .then((r) => r.json())
        .then((data) => { if (data && data.id) setSubscription(data); })
        .catch(() => { toast.error("Could not load subscription info"); });
    }
  }, [session]);

  async function handleCancelSubscription() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of the billing period.")) return;
    setCancellingSubscription(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (res.ok) setSubscription((s) => s ? { ...s, cancelAtPeriodEnd: true } : s);
    } finally {
      setCancellingSubscription(false);
    }
  }

  async function handleOpenPortal() {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setOpeningPortal(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const queuedOrders = orders.filter((o) => o.status === "PAID");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session.user.name?.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 text-gray-400">Track your orders and communicate with our team.</p>
          </div>
          <Link href="/services">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Zap className="mr-2 h-4 w-4" />
              New order
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total orders", value: orders.length, icon: <Package className="h-5 w-5 text-purple-400" />, bg: "from-purple-500/10 to-purple-600/5" },
            { label: "Active", value: activeOrders.length, icon: <Zap className="h-5 w-5 text-blue-400" />, bg: "from-blue-500/10 to-blue-600/5" },
            { label: "In queue", value: queuedOrders.length, icon: <Clock className="h-5 w-5 text-yellow-400" />, bg: "from-yellow-500/10 to-yellow-600/5" },
            { label: "Completed", value: completedOrders.length, icon: <CheckCircle className="h-5 w-5 text-green-400" />, bg: "from-green-500/10 to-green-600/5" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br p-5"
              style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
            >
              <div className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${stat.bg} p-5`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Queue notice */}
        {queuedOrders.length > 0 && (
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-300">
                  {queuedOrders.length} order{queuedOrders.length > 1 ? "s" : ""} in queue
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Your payment has been received! We&apos;re working through orders in the order they were placed.
                  We&apos;ll notify you as soon as work begins on your project.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription */}
        {(() => {
          const plan = subscription ? SUBSCRIPTION_PLANS.find((p) => p.slug === subscription.planSlug) : null;
          const isActive = subscription && subscription.status === "active";
          return (
            <div className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl shrink-0">
                    {plan ? plan.icon : <CreditCard className="h-6 w-6 text-gray-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">
                        {plan ? plan.name : "No active plan"}
                      </h2>
                      {isActive && (
                        <Badge className={`text-xs border ${subscription.cancelAtPeriodEnd ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-green-500/10 text-green-300 border-green-500/20"}`}>
                          {subscription.cancelAtPeriodEnd ? "Cancels at period end" : "Active"}
                        </Badge>
                      )}
                    </div>
                    {subscription ? (
                      <p className="text-sm text-gray-400">
                        {subscription.cancelAtPeriodEnd ? "Access until" : "Renews"}{" "}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Get monthly deliveries and save up to 25%</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {subscription ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleOpenPortal}
                        disabled={openingPortal}
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      >
                        {openingPortal ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-2 h-3.5 w-3.5" />}
                        Manage billing
                      </Button>
                      {!subscription.cancelAtPeriodEnd && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelSubscription}
                          disabled={cancellingSubscription}
                          className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
                        >
                          {cancellingSubscription ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link href="/plans">
                      <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        View plans
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Orders */}
        <h2 className="text-xl font-semibold mb-4">Your orders</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
            <p className="mb-6 text-gray-400">Place your first order and we&apos;ll get started right away!</p>
            <Link href="/services">
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                Browse services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="group block">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-2xl shrink-0">
                          {order.service.icon || "📦"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {order.service.name}
                            </h3>
                            {order.details?.packageName && (
                              <span className="text-sm text-gray-500">· {order.details.packageName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`flex items-center gap-1.5 border text-xs ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-purple-400">
                          ${order.totalPrice.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 group-hover:text-purple-400 transition-colors">
                          View details
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

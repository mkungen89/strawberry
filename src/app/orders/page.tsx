"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300", icon: <Clock className="h-3 w-3" /> },
  PAID: { label: "Paid", color: "bg-blue-500/20 text-blue-300", icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-500/20 text-purple-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  REVIEW: { label: "Under Review", color: "bg-orange-500/20 text-orange-300", icon: <Clock className="h-3 w-3" /> },
  REVISION: { label: "Revision", color: "bg-pink-500/20 text-pink-300", icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-300", icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-300", icon: <XCircle className="h-3 w-3" /> },
};

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  service: { name: string; icon?: string };
  details: { packageName?: string };
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completedOrders = orders.filter((o) => ["COMPLETED", "CANCELLED"].includes(o.status));

  function OrderRow({ order }: { order: Order }) {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
    return (
      <Card className="border-white/10 bg-white/5 text-white transition-all hover:border-white/20">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{order.service.name}</h3>
              {order.details?.packageName && (
                <span className="text-sm text-gray-400">— {order.details.packageName}</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`flex items-center gap-1 ${status.color}`}>
                {status.icon}
                {status.label}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-lg font-bold text-purple-400">{order.totalPrice} kr</span>
            <Link href={`/orders/${order.id}`}>
              <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                View
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="mt-1 text-gray-400">Track and manage all your orders.</p>
          </div>
          <Link href="/services">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              New order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="mb-4 h-14 w-14 text-gray-600" />
              <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
              <p className="mb-6 max-w-sm text-gray-400">
                Place your first order and we&apos;ll get started right away!
              </p>
              <Link href="/services">
                <Button className="bg-purple-600 text-white hover:bg-purple-700">
                  Browse services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Active orders */}
            {activeOrders.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Active Orders</h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-300">
                    {activeOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed orders */}
            {completedOrders.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Completed Orders</h2>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600/20 text-xs font-bold text-green-400">
                    {completedOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {completedOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

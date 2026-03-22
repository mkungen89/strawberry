"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
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
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Welcome, {session.user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-gray-400">Here&apos;s an overview of your orders.</p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total orders", value: orders.length, icon: <Package className="h-5 w-5 text-purple-400" /> },
            { label: "Active orders", value: activeOrders.length, icon: <Clock className="h-5 w-5 text-blue-400" /> },
            { label: "Completed", value: completedOrders.length, icon: <CheckCircle className="h-5 w-5 text-green-400" /> },
          ].map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-white/5 text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your orders</h2>
          <Link href="/services">
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
              New order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-4 h-12 w-12 text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
              <p className="mb-6 text-gray-400">Place your first order and we&apos;ll get started right away!</p>
              <Link href="/services">
                <Button className="bg-purple-600 text-white hover:bg-purple-700">
                  Browse services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
              return (
                <Card key={order.id} className="border-white/10 bg-white/5 text-white transition-all hover:border-white/20">
                  <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{order.service.name}</h3>
                        {order.details?.packageName && (
                          <span className="text-sm text-gray-400">— {order.details.packageName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`flex items-center gap-1 ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-purple-400">${order.totalPrice.toLocaleString()}</span>
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

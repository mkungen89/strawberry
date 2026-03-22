"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Package, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  service: { name: string };
  user: { name: string | null; email: string };
  details: { packageName?: string; description?: string };
}

const STATUSES = ["PENDING", "PAID", "IN_PROGRESS", "REVIEW", "REVISION", "COMPLETED", "CANCELLED"];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
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

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-gray-400">Manage all orders and customers.</p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total orders", value: orders.length, icon: <Package className="h-5 w-5 text-purple-400" /> },
            { label: "Active orders", value: activeOrders.length, icon: <Clock className="h-5 w-5 text-blue-400" /> },
            { label: "Revenue", value: `${totalRevenue.toLocaleString()} kr`, icon: <DollarSign className="h-5 w-5 text-green-400" /> },
            { label: "Customers", value: new Set(orders.map((o) => o.user.email)).size, icon: <Users className="h-5 w-5 text-yellow-400" /> },
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

        {/* Orders table */}
        <h2 className="mb-4 text-xl font-semibold">All orders</h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{order.service.name}</span>
                      {order.details.packageName && (
                        <span className="text-sm text-gray-400">— {order.details.packageName}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {order.user.name} ({order.user.email})
                    </p>
                    {order.details.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {order.details.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-purple-400">{order.totalPrice} kr</span>
                    <Select
                      value={order.status ?? "PENDING"}
                      onValueChange={(v) => v && updateStatus(order.id, v)}
                    >
                      <SelectTrigger className="w-40 border-white/20 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

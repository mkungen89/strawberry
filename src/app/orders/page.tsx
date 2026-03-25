"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Loader2, Zap } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "@/lib/order-status";

const STATUS_CONFIG = ORDER_STATUS_CONFIG;

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="mt-1 text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/services">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Zap className="mr-2 h-4 w-4" /> New order
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
            <p className="mb-6 text-gray-400">Browse our services and place your first order!</p>
            <Link href="/services">
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                Browse services <ArrowRight className="ml-2 h-4 w-4" />
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
                              {status.icon} {status.label}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-xs text-gray-700">#{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-purple-400">${order.totalPrice.toLocaleString()}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500 group-hover:text-purple-400 transition-colors">
                          View <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
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

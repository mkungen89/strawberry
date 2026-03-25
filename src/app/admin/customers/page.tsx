"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, ShoppingBag, Crown, Search, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface CustomerOrder {
  id: string;
  status: string;
  totalPrice: number;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  orders: CustomerOrder[];
  subscription: { planSlug: string; status: string } | null;
}

const PLAN_COLORS: Record<string, string> = {
  creator: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  streamer: "bg-purple-500/20 text-purple-300 border-purple-500/20",
  business: "bg-amber-500/20 text-amber-300 border-amber-500/20",
  growth: "bg-green-500/20 text-green-300 border-green-500/20",
};

const SUB_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-300 border-green-500/20",
  canceled: "bg-red-500/20 text-red-300 border-red-500/20",
  past_due: "bg-orange-500/20 text-orange-300 border-orange-500/20",
  trialing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",
  incomplete: "bg-gray-500/20 text-gray-400 border-gray-500/20",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name?.toLowerCase().includes(q) ?? false) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.orders.reduce((s, o) => s + o.totalPrice, 0),
    0
  );
  const withSub = customers.filter((c) => c.subscription?.status === "active").length;

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">All registered users and their order/subscription status.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total customers", value: customers.length, color: "purple", icon: Users },
            { label: "Active subscribers", value: withSub, color: "green", icon: Crown },
            { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}`, color: "amber", icon: ShoppingBag },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 text-${color}-400`} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Subscription</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => {
                  const spent = c.orders.reduce((s, o) => s + o.totalPrice, 0);
                  const completedOrders = c.orders.filter((o) => o.status === "COMPLETED").length;
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{c.name ?? "—"}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.subscription ? (
                          <div className="space-y-1">
                            <Badge className={`text-xs ${PLAN_COLORS[c.subscription.planSlug] ?? "bg-gray-500/20 text-gray-400"}`}>
                              {c.subscription.planSlug}
                            </Badge>
                            <Badge className={`text-xs ml-1 ${SUB_STATUS_COLORS[c.subscription.status] ?? ""}`}>
                              {c.subscription.status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{c.orders.length}</p>
                        <p className="text-xs text-gray-500">{completedOrders} completed</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">${spent.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin?customer=${c.id}`}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Orders
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-600">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

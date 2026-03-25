"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Referral {
  id: string;
  discount: number;
  used: boolean;
  createdAt: string;
  referrer: { name: string | null; email: string };
  referred: { name: string | null; email: string };
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      if (!res.ok) throw new Error();
      setReferrals(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const used = referrals.filter((r) => r.used).length;
  const pending = referrals.filter((r) => !r.used).length;

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Referrals</h1>
          <p className="mt-1 text-sm text-gray-500">Track who has referred new customers and which discounts have been redeemed.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total referrals", value: referrals.length, color: "purple" },
            { label: "Redeemed", value: used, color: "green" },
            { label: "Pending", value: pending, color: "amber" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] p-12 text-center">
            <Users className="h-8 w-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No referrals yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Referrer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Referred</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{r.referrer.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{r.referrer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{r.referred.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{r.referred.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{r.discount}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.used ? (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/20 text-xs gap-1">
                          <Check className="h-3 w-3" /> Redeemed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/20 text-xs gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

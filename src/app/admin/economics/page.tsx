"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, Zap,
  Plus, Trash2, RefreshCw, Loader2, Bot, BarChart3,
  Target, Edit2, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- Types ---
interface CostEntry {
  id: string; name: string; amountRaw: number; amountUsd: number;
  currency: string; category: string; active: boolean; notes?: string;
}
interface PlanStat { slug: string; name: string; count: number; monthlyRevenue: number; }
interface MonthData { label: string; orderRevenue: number; subRevenue: number; total: number; }
interface AiSource { source: string; _sum: { costUsd: number | null; inputTokens: number | null; outputTokens: number | null } }
interface EconomicsData {
  kpis: {
    mrr: number; totalRevenueThisMonth: number; orderRevenueThisMonth: number;
    stripeRevenueThisMonth: number; totalCostThisMonth: number; profit: number; lastMonthOrderRevenue: number;
  };
  subscribers: { byPlan: PlanStat[]; total: number };
  revenueChart: { months: MonthData[] };
  costs: {
    entries: CostEntry[]; totalFixedUsd: number;
    aiThisMonth: { costUsd: number; inputTokens: number; outputTokens: number };
    aiBySource: AiSource[];
    aiAllTime: { costUsd: number };
  };
  breakEven: { fixedCostsUsd: number; currentMrr: number; gap: number; coveragePercent: number };
}

// --- Helpers ---
const fmt = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);
const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a / b) * 100);

const CATEGORY_COLORS: Record<string, string> = {
  TOOL: "bg-purple-500/20 text-purple-300 border-purple-500/20",
  INFRASTRUCTURE: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  SALARY: "bg-amber-500/20 text-amber-300 border-amber-500/20",
  OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/20",
};

const PLAN_COLORS: Record<string, string> = {
  creator: "bg-blue-500",
  streamer: "bg-purple-500",
  business: "bg-amber-500",
  growth: "bg-green-500",
};

export default function EconomicsPage() {
  const [data, setData] = useState<EconomicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCost, setShowAddCost] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add cost form
  const [costName, setCostName] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costCurrency, setCostCurrency] = useState("USD");
  const [costCategory, setCostCategory] = useState("TOOL");
  const [costNotes, setCostNotes] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editCategory, setEditCategory] = useState("TOOL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/economics");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addCost() {
    if (!costName.trim() || !costAmount) return;
    setSaving(true);
    const res = await fetch("/api/admin/economics/costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: costName, amountRaw: parseFloat(costAmount), currency: costCurrency, category: costCategory, notes: costNotes }),
    });
    if (res.ok) {
      toast.success("Cost added!");
      setCostName(""); setCostAmount(""); setCostCurrency("USD"); setCostCategory("TOOL"); setCostNotes("");
      setShowAddCost(false);
      fetchData();
    } else toast.error("Failed to add cost.");
    setSaving(false);
  }

  async function startEdit(entry: CostEntry) {
    setEditingId(entry.id);
    setEditName(entry.name);
    setEditAmount(String(entry.amountRaw));
    setEditCurrency(entry.currency);
    setEditCategory(entry.category);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/economics/costs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, amountRaw: parseFloat(editAmount), currency: editCurrency, category: editCategory }),
    });
    if (res.ok) { toast.success("Updated!"); setEditingId(null); fetchData(); }
    else toast.error("Failed to update.");
    setSaving(false);
  }

  async function deleteCost(id: string) {
    const res = await fetch(`/api/admin/economics/costs/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Removed!"); fetchData(); }
    else toast.error("Failed to remove.");
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
    </div>
  );

  if (!data) return (
    <div className="p-6 text-center text-gray-500">Failed to load economics data.</div>
  );

  const { kpis, subscribers, revenueChart, costs, breakEven } = data;
  const maxMonthRevenue = Math.max(...revenueChart.months.map(m => m.total), 1);
  const totalMrr = subscribers.byPlan.reduce((s, p) => s + p.monthlyRevenue, 0);
  const isProfit = kpis.profit >= 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Economics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue, costs, and profitability — all figures in USD</p>
        </div>
        <Button size="sm" variant="ghost" className="border border-white/10 text-gray-400" onClick={fetchData}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "MRR", value: fmtK(kpis.mrr), sub: `${subscribers.total} active subscribers`,
            icon: TrendingUp, color: "text-purple-400", bg: "from-purple-600/10 to-pink-600/5",
          },
          {
            label: "Revenue this month", value: fmtK(kpis.totalRevenueThisMonth),
            sub: `Orders ${fmt(kpis.orderRevenueThisMonth)} · Subs ${fmt(kpis.stripeRevenueThisMonth)}`,
            icon: DollarSign, color: "text-blue-400", bg: "from-blue-600/10 to-blue-600/5",
          },
          {
            label: "Costs this month", value: fmt(kpis.totalCostThisMonth),
            sub: `Fixed ${fmt(costs.totalFixedUsd)} · AI ${fmt(costs.aiThisMonth.costUsd)}`,
            icon: CreditCard, color: "text-orange-400", bg: "from-orange-600/10 to-orange-600/5",
          },
          {
            label: isProfit ? "Profit" : "Loss", value: fmtK(Math.abs(kpis.profit)),
            sub: isProfit ? "In the green this month" : "Costs exceed revenue",
            icon: isProfit ? TrendingUp : TrendingDown,
            color: isProfit ? "text-green-400" : "text-red-400",
            bg: isProfit ? "from-green-600/10 to-green-600/5" : "from-red-600/10 to-red-600/5",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${card.bg} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Subscribers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" /> Revenue (12 months)
          </h2>
          <div className="flex items-end gap-1 h-40">
            {revenueChart.months.map((m) => {
              const totalH = pct(m.total, maxMonthRevenue);
              const subH = m.total > 0 ? pct(m.subRevenue, m.total) : 0;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {m.label}<br />Orders: {fmt(m.orderRevenue)}<br />Subs: {fmt(m.subRevenue)}
                  </div>
                  <div className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalH, 2)}%` }}>
                    <div className="w-full bg-purple-500/70" style={{ height: `${subH}%` }} />
                    <div className="w-full bg-blue-500/70 flex-1" />
                  </div>
                  <span className="text-[9px] text-gray-600 truncate w-full text-center">{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-sm bg-blue-500/70" /><span className="text-[10px] text-gray-500">Orders</span></div>
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-sm bg-purple-500/70" /><span className="text-[10px] text-gray-500">Subscriptions</span></div>
          </div>
        </div>

        {/* Subscribers by plan */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" /> Active Subscribers
          </h2>
          <div className="space-y-4">
            {subscribers.byPlan.map((plan) => {
              const barPct = totalMrr > 0 ? pct(plan.monthlyRevenue, totalMrr) : 0;
              return (
                <div key={plan.slug}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white capitalize">{plan.name}</span>
                      <Badge className="bg-white/[0.05] text-gray-400 border-white/10 text-[10px]">{plan.count} active</Badge>
                    </div>
                    <span className="text-sm text-gray-400">{fmt(plan.monthlyRevenue)}/mo</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${PLAN_COLORS[plan.slug] ?? "bg-gray-500"}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {subscribers.total === 0 && (
              <p className="text-sm text-gray-600 text-center py-6">No active subscribers yet.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between text-xs text-gray-500">
            <span>Total MRR</span>
            <span className="text-white font-medium">{fmt(kpis.mrr)}/mo</span>
          </div>
        </div>
      </div>

      {/* Fixed Costs + AI Usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fixed Costs */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-400" /> Fixed Costs
            </h2>
            <Button size="sm" variant="ghost" className="h-7 border border-white/10 text-gray-400 hover:text-white text-xs px-2" onClick={() => setShowAddCost(!showAddCost)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>

          {/* Add form */}
          {showAddCost && (
            <div className="mb-4 p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-gray-500 mb-1 block">Name</Label>
                  <Input value={costName} onChange={e => setCostName(e.target.value)} placeholder="Midjourney" className="border-white/10 bg-white/[0.03] text-white text-xs h-8" />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500 mb-1 block">Amount</Label>
                  <Input value={costAmount} onChange={e => setCostAmount(e.target.value)} placeholder="30" type="number" className="border-white/10 bg-white/[0.03] text-white text-xs h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-gray-500 mb-1 block">Currency</Label>
                  <select value={costCurrency} onChange={e => setCostCurrency(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white">
                    <option value="USD">USD ($)</option>
                    <option value="SEK">SEK (kr)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500 mb-1 block">Category</Label>
                  <select value={costCategory} onChange={e => setCostCategory(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white">
                    <option value="TOOL">Tool</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="SALARY">Salary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <Input value={costNotes} onChange={e => setCostNotes(e.target.value)} placeholder="Notes (optional)" className="border-white/10 bg-white/[0.03] text-white text-xs h-8" />
              <div className="flex gap-2">
                <Button size="sm" onClick={addCost} disabled={saving || !costName || !costAmount} className="bg-purple-600 text-white hover:bg-purple-700 text-xs h-7">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddCost(false)} className="border border-white/10 text-gray-400 text-xs h-7">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {costs.entries.length === 0 && !showAddCost && (
              <p className="text-sm text-gray-600 text-center py-6">No costs added yet. Click Add to get started.</p>
            )}
            {costs.entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                {editingId === entry.id ? (
                  <>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="border-white/10 bg-white/[0.03] text-white text-xs h-7 col-span-1" />
                      <Input value={editAmount} onChange={e => setEditAmount(e.target.value)} type="number" className="border-white/10 bg-white/[0.03] text-white text-xs h-7" />
                      <select value={editCurrency} onChange={e => setEditCurrency(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 text-xs text-white h-7">
                        <option value="USD">USD</option><option value="SEK">SEK</option><option value="EUR">EUR</option>
                      </select>
                    </div>
                    <button onClick={() => saveEdit(entry.id)} className="text-green-400 hover:text-green-300"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-400"><X className="h-3.5 w-3.5" /></button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{entry.name}</p>
                      <p className="text-[11px] text-gray-500">{entry.amountRaw} {entry.currency} ≈ {fmt(entry.amountUsd)}/mo</p>
                    </div>
                    <Badge className={`text-[10px] border shrink-0 ${CATEGORY_COLORS[entry.category] ?? CATEGORY_COLORS.OTHER}`}>{entry.category}</Badge>
                    <button onClick={() => startEdit(entry)} className="text-gray-600 hover:text-gray-400 shrink-0"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteCost(entry.id)} className="text-gray-600 hover:text-red-400 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between text-xs">
            <span className="text-gray-500">Total fixed/mo</span>
            <span className="text-white font-semibold">{fmt(costs.totalFixedUsd)}</span>
          </div>
        </div>

        {/* AI Usage */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" /> Claude API Usage
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Cost this month", value: fmt(costs.aiThisMonth.costUsd), color: "text-white" },
              { label: "All-time cost", value: fmt(costs.aiAllTime.costUsd), color: "text-gray-300" },
              { label: "Input tokens/mo", value: costs.aiThisMonth.inputTokens.toLocaleString(), color: "text-blue-300" },
              { label: "Output tokens/mo", value: costs.aiThisMonth.outputTokens.toLocaleString(), color: "text-purple-300" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                <p className="text-[10px] text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">By source (this month)</p>
            {costs.aiBySource.length === 0 ? (
              <p className="text-xs text-gray-600">No AI usage recorded yet.</p>
            ) : (
              costs.aiBySource.map((s) => {
                const total = costs.aiThisMonth.costUsd;
                const cost = s._sum.costUsd ?? 0;
                const barPct = total > 0 ? pct(cost, total) : 0;
                return (
                  <div key={s.source}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 capitalize">{s.source}</span>
                      <span className="text-gray-500">{fmt(cost)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-[10px] text-gray-700 mt-4">Haiku pricing: $0.25/M input · $1.25/M output tokens</p>
        </div>
      </div>

      {/* Break-even */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-green-400" /> Break-Even Analysis
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fixed monthly costs</span>
              <span className="text-white font-medium">{fmt(breakEven.fixedCostsUsd)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current MRR</span>
              <span className="text-white font-medium">{fmt(breakEven.currentMrr)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/[0.06] pt-3">
              <span className="text-gray-400">{breakEven.gap > 0 ? "Gap to break-even" : "Monthly surplus"}</span>
              <span className={`font-semibold ${breakEven.gap > 0 ? "text-red-400" : "text-green-400"}`}>
                {breakEven.gap > 0 ? `-${fmt(breakEven.gap)}` : `+${fmt(Math.abs(breakEven.gap))}`}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>MRR coverage of fixed costs</span>
              <span>{breakEven.coveragePercent}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${breakEven.coveragePercent >= 100 ? "bg-green-500" : breakEven.coveragePercent >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${breakEven.coveragePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {breakEven.coveragePercent >= 100
                ? "MRR covers all fixed costs — any orders are pure profit."
                : `Need ${fmt(breakEven.gap)} more MRR to cover fixed costs.`}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {[
                { plan: "Creator ($49)", n: Math.ceil(breakEven.gap > 0 ? breakEven.gap / 49 : 0) },
                { plan: "Streamer ($79)", n: Math.ceil(breakEven.gap > 0 ? breakEven.gap / 79 : 0) },
                { plan: "Business ($149)", n: Math.ceil(breakEven.gap > 0 ? breakEven.gap / 149 : 0) },
                { plan: "Growth ($399)", n: Math.ceil(breakEven.gap > 0 ? breakEven.gap / 399 : 0) },
              ].map(row => (
                <div key={row.plan} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-1.5">
                  <p className="text-gray-500">{row.plan}</p>
                  <p className="text-white font-medium">{breakEven.gap > 0 ? `${row.n} needed` : "✓ Covered"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

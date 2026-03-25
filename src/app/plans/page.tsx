"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles, Zap, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-data";
import { useCurrency } from "@/lib/currency-context";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const { format, currency } = useCurrency();
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function subscribe(planSlug: string) {
    if (!session) {
      router.push(`/login?redirect=/plans`);
      return;
    }
    setLoadingPlan(planSlug);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-purple-500/30 bg-purple-500/10 text-purple-300 px-4 py-1.5">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Monthly Plans
            </Badge>
            <h1 className="mb-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Your creative team,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                on demand
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Fresh designs delivered every month. No contracts, cancel anytime.
              Save up to 25% on one-time orders.
            </p>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.slug}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:bg-white/[0.04] ${
                  plan.popular
                    ? "border-purple-500/30 bg-purple-600/5 ring-1 ring-purple-500/20"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-4 text-3xl">{plan.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-white">
                    {currency === "EUR" ? `€${plan.priceEUR}` : currency === "GBP" ? `£${plan.priceGBP}` : `$${plan.price}`}
                  </span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-600 mb-4">{plan.bestFor}</p>
                <Button
                  onClick={() => subscribe(plan.slug)}
                  disabled={loadingPlan === plan.slug}
                  className={`w-full ${
                    plan.popular
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-white/20 bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  {loadingPlan === plan.slug ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>Get started <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Bundle Deals CTA */}
        <section className="px-4 pb-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center rounded-2xl border border-green-500/20 bg-green-500/5 p-10">
            <Badge className="mb-4 border-green-500/30 bg-green-500/10 text-green-300 px-3">
              <Zap className="mr-2 h-3.5 w-3.5" /> Save up to 25%
            </Badge>
            <h2 className="mb-3 text-2xl font-bold">Looking for a one-time deal?</h2>
            <p className="text-gray-400 mb-6">Check out our curated bundle packages — multiple services, one discounted price.</p>
            <Link href="/pricing">
              <Button className="bg-green-600 text-white hover:bg-green-700 px-8">
                View bundle deals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

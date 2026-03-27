import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-data";

export default function PlansTeaser() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/[0.04] to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center animate-fade-up">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            Monthly Plans
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl">
            Your creative team,{" "}
            <span className="gradient-text">every month</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/50 leading-relaxed">
            Subscribe and get recurring deliverables, strategy support, and up to 25% off all orders. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10 items-start">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
                plan.popular
                  ? "border-purple-500/40 bg-purple-600/8 ring-1 ring-purple-500/25 scale-[1.04] shadow-2xl shadow-purple-600/15"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-purple-500/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-600/30">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-3 text-2xl">{plan.icon}</div>
              <h3 className="font-bold text-white mb-1 tracking-tight">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white tracking-tight">${plan.price}</span>
                <span className="text-sm text-white/40">/mo</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/50">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-400 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-xs text-white/25">+{plan.features.length - 3} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/plans">
            <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                See all plans <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </Link>
          <Link href="/pricing">
            <button className="rounded-xl border border-white/15 bg-white/5 px-10 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
              View bundle deals
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

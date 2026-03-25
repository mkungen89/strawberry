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
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            Monthly Plans
          </Badge>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Your creative team,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              every month
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Subscribe and get recurring deliverables, strategy support, and up to 25% off all orders. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
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
              <div className="mb-3 text-2xl">{plan.icon}</div>
              <h3 className="font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-400 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-xs text-gray-600">+{plan.features.length - 3} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/plans">
            <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700 px-10">
              See all plans <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="ghost" className="border border-white/20 bg-transparent text-white hover:bg-white/10 px-10">
              View bundle deals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

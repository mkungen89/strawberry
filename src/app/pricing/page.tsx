"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { BUNDLES } from "@/lib/subscription-data";
import { useCurrency } from "@/lib/currency-context";

export default function BundlesPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-green-600/8 blur-[110px]" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-emerald-500/6 blur-[90px]" />
          </div>
          <div className="relative mx-auto max-w-7xl animate-fade-up">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                Bundle Deals
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                More value,{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  less cost
                </span>
              </h1>
              <p className="mb-6 text-lg text-white/50 leading-relaxed">
                Curated service packages built to work together. Save up to 25% compared to ordering separately.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/40 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                One-time payment — own it forever
              </div>
            </div>
          </div>
        </section>

        {/* Bundle Cards */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {BUNDLES.map((bundle) => (
              <div
                key={bundle.slug}
                className={`relative flex flex-col rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  bundle.popular
                    ? "border-green-500/35 bg-green-500/[0.05] scale-[1.03] shadow-2xl shadow-green-500/10"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-green-500/20 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-green-500/[0.05]"
                }`}
              >
                {bundle.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-green-600/30">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-green-500/10 text-2xl shrink-0">
                      {bundle.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight">{bundle.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{bundle.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-2">
                    {bundle.services.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 text-sm text-white/60">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/[0.06] px-6 py-5">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-sm text-white/20 line-through block leading-none mb-1">
                        {format(bundle.originalPrice, bundle.originalPriceGBP, bundle.originalPriceEUR)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white tracking-tight">
                          {format(bundle.bundlePrice, bundle.bundlePriceGBP, bundle.bundlePriceEUR)}
                        </span>
                        <span className="rounded-full border border-green-500/25 bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-300">
                          -{bundle.discount}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/contact">
                    <button
                      className={`group relative w-full overflow-hidden rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                        bundle.popular
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/25 hover:shadow-green-600/40"
                          : "border border-white/15 bg-white/5 text-white hover:border-green-500/30 hover:bg-white/10"
                      }`}
                    >
                      {bundle.popular && (
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      )}
                      <span className="relative flex items-center gap-2">
                        Order bundle <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 p-14 sm:p-20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/30" />
              <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-purple-500/10 blur-[90px]" />
              </div>
              <div className="relative">
                <Zap className="mx-auto mb-4 h-8 w-8 text-purple-400" />
                <h2 className="mb-3 text-3xl font-bold tracking-tight leading-[1.1]">
                  Need something recurring?
                </h2>
                <p className="mx-auto max-w-md text-white/50 leading-relaxed mb-8">
                  Check out our monthly plans for ongoing design, SEO, and creative support.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/plans">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center gap-2">
                        View monthly plans <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                      Browse all services
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

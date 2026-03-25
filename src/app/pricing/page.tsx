"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap, Package } from "lucide-react";
import { BUNDLES } from "@/lib/subscription-data";
import { useCurrency } from "@/lib/currency-context";

export default function BundlesPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-green-600/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-green-500/30 bg-green-500/10 text-green-300 px-4 py-1.5">
              <Package className="mr-2 h-3.5 w-3.5" /> Bundle Deals
            </Badge>
            <h1 className="mb-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              More value,{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                less cost
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Curated service packages built to work together. Save up to 25% compared to ordering separately.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              One-time payment — own it forever
            </div>
          </div>
        </section>

        {/* Bundle Cards */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLES.map((bundle) => (
              <div
                key={bundle.slug}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:bg-white/[0.04] ${
                  bundle.popular
                    ? "border-green-500/30 bg-green-500/5 ring-1 ring-green-500/20"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {bundle.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white border-0">
                    Best Value
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl shrink-0">
                    {bundle.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{bundle.name}</h3>
                    <p className="text-xs text-gray-500">{bundle.description}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {bundle.services.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-600 line-through block">
                        {format(bundle.originalPrice, bundle.originalPriceGBP, bundle.originalPriceEUR)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white">
                          {format(bundle.bundlePrice, bundle.bundlePriceGBP, bundle.bundlePriceEUR)}
                        </span>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/20">
                          -{bundle.discount}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button
                      className={`w-full ${
                        bundle.popular
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "border border-white/20 bg-transparent text-white hover:bg-white/10"
                      }`}
                    >
                      Order bundle <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/20 px-8 py-12">
              <Zap className="mx-auto mb-4 h-10 w-10 text-purple-400" />
              <h2 className="text-3xl font-bold">Need something recurring?</h2>
              <p className="mt-3 text-gray-400">
                Check out our monthly plans for ongoing design, SEO, and creative support.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/plans">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-8" size="lg">
                    View monthly plans <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost" size="lg" className="border border-white/20 bg-transparent text-white hover:bg-white/10 px-8">
                    Browse all services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

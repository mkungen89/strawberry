"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/services-details";
import { useCurrency } from "@/lib/currency-context";

export default function ServicesPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-purple-500/30 bg-purple-500/10 text-purple-300 px-4 py-1.5">
              Services
            </Badge>
            <h1 className="mb-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                stand out online
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
              Choose a service below and we&apos;ll guide you through every step.
              No technical knowledge needed — just tell us what you want.
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="px-4 pb-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {SERVICES.map((service) => {
              const details = SERVICE_DETAILS[service.slug];
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group block"
                >
                  <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]">
                    {/* Hover glow */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-pink-600/0 opacity-0 blur-sm group-hover:from-purple-600/10 group-hover:via-purple-600/5 group-hover:to-pink-600/10 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

                    <div className="relative">
                      {service.popular && (
                        <Badge className="absolute -top-2 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-600/20">
                          Popular
                        </Badge>
                      )}

                      <div className="flex flex-col lg:flex-row lg:gap-10">
                        {/* Left: Info */}
                        <div className="flex-1 mb-6 lg:mb-0">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-3xl border border-white/[0.06]">
                              {service.icon}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                {service.name}
                              </h2>
                              <p className="text-sm text-gray-500">
                                From{" "}
                                <span className="font-semibold text-purple-400">
                                  {format(service.basePrice, service.basePriceGBP, service.basePriceEUR)}
                                </span>
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-2xl">
                            {details?.longDescription || service.description}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {service.features.map((f) => (
                              <span key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right: Packages + meta */}
                        <div className="lg:w-80 shrink-0">
                          <div className="space-y-2 mb-4">
                            {service.packages.map((pkg, idx) => (
                              <div
                                key={pkg.name}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                                  idx === 1
                                    ? "border border-purple-500/20 bg-purple-600/5"
                                    : "border border-white/[0.06] bg-white/[0.03]"
                                }`}
                              >
                                <span className="text-sm font-medium text-white">{pkg.name}</span>
                                <span className="text-sm font-bold text-purple-400">
                                  {format(pkg.price, pkg.priceGBP, pkg.priceEUR)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Delivery time */}
                          {details?.deliveryTime && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                              <Clock className="h-3.5 w-3.5" />
                              Delivery: {details.deliveryTime}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                            View details & order
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

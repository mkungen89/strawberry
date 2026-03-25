"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";

export default function ServicesSection() {
  const { format } = useCurrency();

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            Services
          </Badge>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              in one place
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Design, SEO, copywriting, streaming, Discord, websites and more — everything your brand needs under one roof.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative"
            >
              {/* Hover glow effect */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-pink-600/0 opacity-0 blur-sm group-hover:from-purple-600/20 group-hover:via-purple-600/10 group-hover:to-pink-600/20 group-hover:opacity-100 transition-all duration-500" />

              <div className="relative flex flex-col h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/30 group-hover:bg-white/[0.06]">
                {service.popular && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-600/20">
                      Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-3xl border border-white/[0.06]">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      From{" "}
                      <span className="font-semibold text-purple-400">
                        {format(service.basePrice, service.basePriceGBP, service.basePriceEUR)}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-5 leading-relaxed">{service.description}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors mt-auto">
                  Order now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

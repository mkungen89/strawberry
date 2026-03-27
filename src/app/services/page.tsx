"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, ChevronDown, Clock, Zap } from "lucide-react";
import { SERVICES, ENTERPRISE_SERVICES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/services-details";
import { useCurrency } from "@/lib/currency-context";
import { useState } from "react";

// ── Config ────────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: "ALL",      label: "All" },
  { id: "GRAPHICS", label: "Design" },
  { id: "YOUTUBE",  label: "YouTube" },
  { id: "STREAMING",label: "Streaming" },
  { id: "DISCORD",  label: "Discord" },
  { id: "CONTENT",  label: "Content" },
  { id: "SEO",      label: "SEO" },
  { id: "GROWTH",   label: "Growth" },
  { id: "SOCIAL",   label: "Community" },
  { id: "WEB",      label: "Web" },
  { id: "STRATEGY", label: "Branding" },
];

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  GRAPHICS:  { label: "Design & Graphics",      description: "Logos, social kits, illustrations, and visual assets" },
  YOUTUBE:   { label: "YouTube",                description: "Channel art, thumbnails, and video assets" },
  STREAMING: { label: "Streaming",              description: "Overlays, alerts, emotes, and stream packs" },
  DISCORD:   { label: "Discord",                description: "Server setup, bots, and community design" },
  CONTENT:   { label: "Content & Copy",         description: "Words that convert — web copy, ads, and email sequences" },
  SEO:       { label: "SEO & Growth",           description: "Audits, keyword strategy, and ranking fixes" },
  GROWTH:    { label: "Growth Strategy",        description: "Data-driven channel and audience growth plans" },
  SOCIAL:    { label: "Community",              description: "Daily management across Discord, Twitter/X, and more" },
  WEB:       { label: "Web & Landing Pages",    description: "Custom pages designed and deployed to convert" },
  STRATEGY:  { label: "Strategy & Branding",    description: "Brand guidelines and identity documentation" },
};

// Controls display order of categories
const CATEGORY_ORDER = [
  "GRAPHICS", "YOUTUBE", "STREAMING", "DISCORD",
  "CONTENT", "SEO", "GROWTH", "SOCIAL", "WEB", "STRATEGY",
];

const INITIAL_CATEGORIES_SHOWN = 3;

type Service = typeof SERVICES[number];

// ── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  const { format } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  const details = SERVICE_DETAILS[service.slug];

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
        service.popular
          ? "border-purple-500/30 bg-purple-600/[0.05] shadow-lg shadow-purple-500/[0.07]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-purple-500/20 hover:bg-white/[0.04]"
      } hover:shadow-[0_0_25px_rgba(168,85,247,0.10)]`}
    >
      {/* Popular badge */}
      {service.popular && (
        <div className="absolute -top-3 right-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30">
            <Zap className="h-3 w-3" /> Popular
          </span>
        </div>
      )}

      {/* ── Compact row (always visible) ── */}
      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-2xl transition-transform duration-300 group-hover:scale-110">
          {service.icon}
        </div>

        {/* Info + price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors duration-200">
                {service.name}
              </h3>
              <p className="mt-1 text-xs text-white/45 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            </div>
            {/* Price block */}
            <div className="shrink-0 text-right ml-2">
              <p className="text-[10px] text-white/25 leading-none mb-0.5">starting at</p>
              <p className="text-sm font-bold text-purple-400 leading-none">
                {format(service.basePrice, service.basePriceGBP, service.basePriceEUR)}
              </p>
            </div>
          </div>

          {/* Feature tags + delivery */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {service.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/35"
              >
                {f}
              </span>
            ))}
            {details?.deliveryTime && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-white/25 shrink-0">
                <Clock className="h-2.5 w-2.5" />
                {details.deliveryTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded area (packages + CTA) ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Packages
          </p>

          <div className="space-y-2 mb-4">
            {service.packages.map((pkg, idx) => (
              <div
                key={pkg.name}
                className={`flex items-start justify-between rounded-xl px-3.5 py-2.5 gap-3 ${
                  idx === 1
                    ? "border border-purple-500/20 bg-purple-600/[0.06]"
                    : "border border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white">{pkg.name}</span>
                  <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">
                    {pkg.features.slice(0, 2).join(" · ")}
                    {pkg.features.length > 2 && (
                      <span className="text-white/20"> · +{pkg.features.length - 2} more</span>
                    )}
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-400 shrink-0">
                  {format(pkg.price, pkg.priceGBP, pkg.priceEUR)}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/services/${service.slug}`}
            className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/35 active:scale-[0.98]"
            onClick={(e) => e.stopPropagation()}
          >
            View details & order
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-auto flex w-full items-center justify-center gap-1 rounded-b-2xl border-t border-white/[0.05] py-2 text-[11px] text-white/30 transition-all duration-200 hover:bg-white/[0.02] hover:text-white/55"
      >
        {expanded ? "Hide packages" : "Show packages"}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

// ── Category Section ──────────────────────────────────────────────────────────

function CategorySection({
  categoryId,
  services,
}: {
  categoryId: string;
  services: Service[];
}) {
  const meta = CATEGORY_META[categoryId];
  if (!services.length || !meta) return null;

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{meta.label}</h2>
          <p className="mt-0.5 text-sm text-white/40">{meta.description}</p>
        </div>
        <span className="shrink-0 text-xs text-white/20">{services.length} service{services.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </div>
  );
}

// ── Mid-page CTA ──────────────────────────────────────────────────────────────

function MidPageCta() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/10 p-8 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.07),transparent)]" />
      <div className="relative">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-purple-400">
          Not sure where to start?
        </p>
        <h3 className="mb-2 text-xl font-bold tracking-tight text-white">
          Let us recommend the right service
        </h3>
        <p className="mb-5 text-sm text-white/45 leading-relaxed max-w-sm mx-auto">
          Answer a few quick questions and we&apos;ll match you with the perfect package for your goals.
        </p>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/15 px-5 py-2.5 text-sm font-semibold text-purple-300 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-600/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          Get a free recommendation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { format } = useCurrency();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Build grouped map in display order
  const grouped = CATEGORY_ORDER.reduce<Record<string, Service[]>>((acc, catId) => {
    const s = SERVICES.filter((svc) => svc.category === catId);
    if (s.length) acc[catId] = s;
    return acc;
  }, {});

  const allCategoryIds = CATEGORY_ORDER.filter((id) => id in grouped);
  const visibleCategoryIds = showAllCategories
    ? allCategoryIds
    : allCategoryIds.slice(0, INITIAL_CATEGORIES_SHOWN);

  const hiddenCount = allCategoryIds.length - visibleCategoryIds.length;
  const hiddenServiceCount = allCategoryIds
    .slice(INITIAL_CATEGORIES_SHOWN)
    .reduce((n, id) => n + (grouped[id]?.length ?? 0), 0);

  const filteredServices =
    activeFilter === "ALL"
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeFilter);

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-pink-600/6 blur-[90px]" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                {SERVICES.length} services available
              </span>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                Everything you need to{" "}
                <span className="gradient-text">stand out online</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Choose a service below and we&apos;ll guide you through every step.
                No technical knowledge needed.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-16 z-40 border-b border-white/[0.07] bg-black/60 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex-none rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "border border-purple-500/30 bg-purple-600/15 text-purple-300"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <section className="px-6 py-14 pb-24">
          <div className="mx-auto max-w-7xl">

            {activeFilter === "ALL" ? (
              /* ── Grouped by category ── */
              <div className="space-y-16">
                {visibleCategoryIds.map((catId, i) => (
                  <div key={catId}>
                    <CategorySection categoryId={catId} services={grouped[catId]} />
                    {/* Mid-page CTA injected after 3rd category */}
                    {i === INITIAL_CATEGORIES_SHOWN - 1 && !showAllCategories && hiddenCount > 0 && (
                      <div className="mt-12">
                        <MidPageCta />
                      </div>
                    )}
                    {i === INITIAL_CATEGORIES_SHOWN - 1 && showAllCategories && (
                      <div className="mt-12">
                        <MidPageCta />
                      </div>
                    )}
                  </div>
                ))}

                {/* Load more categories */}
                {!showAllCategories && hiddenCount > 0 && (
                  <div className="text-center pt-4">
                    <p className="mb-4 text-sm text-white/30">
                      {hiddenCount} more {hiddenCount === 1 ? "category" : "categories"} · {hiddenServiceCount} more services
                    </p>
                    <button
                      onClick={() => setShowAllCategories(true)}
                      className="rounded-xl border border-white/12 bg-white/[0.03] px-8 py-2.5 text-sm font-medium text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/30 hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
                    >
                      Show all services
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Single-category filtered view ── */
              <div>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {CATEGORY_META[activeFilter]?.label ?? activeFilter}
                    </h2>
                    <p className="mt-1 text-sm text-white/40">
                      {CATEGORY_META[activeFilter]?.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/35">
                    {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {filteredServices.length === 0 ? (
                  <p className="py-20 text-center text-white/30">No services in this category.</p>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredServices.map((service) => (
                        <ServiceCard key={service.slug} service={service} />
                      ))}
                    </div>
                    {filteredServices.length >= 4 && (
                      <div className="mt-12">
                        <MidPageCta />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* ── Enterprise ── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
                Enterprise
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                Need something{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  bigger?
                </span>
              </h2>
              <p className="mt-3 max-w-xl text-base text-white/50 leading-relaxed">
                Websites, apps, and SaaS platforms — custom-built for your business.
                Contact us for a free quote.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {ENTERPRISE_SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/enterprise/${service.slug}`}
                  className="group"
                >
                  <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 hover:border-orange-500/25 hover:bg-white/[0.04] hover:shadow-[0_0_25px_rgba(249,115,22,0.07)] hover:scale-[1.01]">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-gradient-to-br from-orange-500/10 to-red-500/5 text-2xl transition-transform duration-300 group-hover:scale-110">
                      {service.icon}
                    </div>
                    <h3 className="mb-1.5 text-base font-bold tracking-tight text-white group-hover:text-orange-300 transition-colors">
                      {service.name}
                    </h3>
                    <p className="mb-5 text-sm text-white/45 leading-relaxed line-clamp-2 flex-1">
                      {service.description}
                    </p>
                    <div className="flex items-end justify-between border-t border-white/[0.05] pt-4 mt-auto">
                      <div>
                        <p className="text-[10px] text-white/25 leading-none mb-0.5">starting at</p>
                        <p className="text-base font-bold text-orange-400">
                          {format(service.startingAt, service.startingAtGBP, service.startingAtEUR)}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-orange-400 transition-all duration-200 group-hover:text-orange-300 group-hover:translate-x-0.5">
                        Get a quote
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

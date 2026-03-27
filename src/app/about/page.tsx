"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Zap,
  MessageSquare,
  HeartHandshake,
  Shield,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";

const VALUES = [
  {
    icon: Star,
    title: "Quality",
    description: "Every deliverable goes through our quality checklist before it reaches you. We don't ship half-finished work.",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "We respect your time. Fast turnarounds without compromising quality — most projects delivered within 5–14 business days.",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "You'll always know where your project stands. We proactively update you at every milestone and respond within 24 hours.",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description: "Our relationship doesn't end at delivery. We provide post-delivery support and are always available for follow-up questions.",
  },
];

const STATS = [
  { icon: Users,        value: "100+", label: "Happy clients" },
  { icon: Shield,       value: "6",    label: "Service types" },
  { icon: Clock,        value: "24h",  label: "Response time" },
  { icon: CheckCircle2, value: "100%", label: "Satisfaction guarantee" },
];

export default function AboutPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[500px] w-[700px] rounded-full bg-purple-900/20 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl animate-fade-up">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                About us
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                About{" "}
                <span className="gradient-text">Vexcraft</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                We build the digital things that creators and businesses actually need —
                done right, done fast, and built to last.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Who we are */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                  Who we are
                </span>
                <h2 className="mt-4 mb-5 text-3xl font-bold tracking-tight leading-[1.1]">
                  A team of developers and designers{" "}
                  <span className="gradient-text">who get things done</span>
                </h2>
                <div className="space-y-4 text-white/55 leading-relaxed text-[15px]">
                  <p>
                    Vexcraft is a digital studio founded by a small team of passionate developers, designers and
                    creators. We started because we were tired of seeing people overpay for mediocre digital work —
                    or struggle to find reliable freelancers who actually delivered.
                  </p>
                  <p>
                    Today we serve clients ranging from individual streamers and content creators to small and
                    medium-sized businesses across Sweden and beyond. Whether you need a Discord server up and
                    running by tomorrow or a fully custom web application, we have the skills to make it happen.
                  </p>
                  <p>
                    We keep our team lean and our processes simple. Every project is handled personally — you&apos;ll
                    always be talking to the people actually building your product.
                  </p>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: "🎮", label: "Creators served",    count: "100+" },
                  { emoji: "🌐", label: "Websites launched",  count: "30+" },
                  { emoji: "📱", label: "Apps delivered",     count: "15+" },
                  { emoji: "✨", label: "Emote packs created", count: "50+" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/[0.05]"
                  >
                    <div className="mb-2 text-3xl">{stat.emoji}</div>
                    <div className="text-2xl font-bold text-white tracking-tight">{stat.count}</div>
                    <div className="mt-1 text-xs text-white/40">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Values */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Our values
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                What we <span className="gradient-text">stand for</span>
              </h2>
              <p className="mt-2 text-white/50">The principles we hold ourselves to on every project.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-500/[0.06] hover:scale-[1.01]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-600/15">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="mb-2 font-semibold text-white tracking-tight">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Stats */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-600/15">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-4xl font-bold text-white tracking-tight">{value}</div>
                  <div className="mt-1 text-sm text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Services list */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                What we build
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                Our <span className="gradient-text">services</span>
              </h2>
              <p className="mt-2 text-white/50">
                Service categories covering everything digital creators and businesses need.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/25 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/[0.05] active:scale-[0.99]"
                >
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm tracking-tight group-hover:text-purple-200 transition-colors">
                      {service.name}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">
                      From {format(service.basePrice, service.basePriceGBP, service.basePriceEUR)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-purple-400 shrink-0" />
                </Link>
              ))}
            </div>
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
                <h2 className="mb-3 text-3xl font-bold tracking-tight leading-[1.1]">
                  Let&apos;s build something{" "}
                  <span className="gradient-text">together</span>
                </h2>
                <p className="mx-auto max-w-md text-white/50 leading-relaxed mb-8">
                  Browse our services and find the perfect package for your project. If you have something custom in mind, reach out — we love a challenge.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/services">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center gap-2">
                        View all services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                      Contact us
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

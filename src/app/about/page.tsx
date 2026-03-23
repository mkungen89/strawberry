"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    description:
      "Every deliverable goes through our quality checklist before it reaches you. We don't ship half-finished work.",
  },
  {
    icon: Zap,
    title: "Speed",
    description:
      "We respect your time. Fast turnarounds without compromising quality — most projects delivered within 5–14 business days.",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description:
      "You'll always know where your project stands. We proactively update you at every milestone and respond within 24 hours.",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description:
      "Our relationship doesn't end at delivery. We provide post-delivery support and are always available for follow-up questions.",
  },
];

const STATS = [
  { icon: Users, value: "100+", label: "Happy clients" },
  { icon: Shield, value: "6", label: "Service types" },
  { icon: Clock, value: "24h", label: "Response time" },
  { icon: CheckCircle2, value: "100%", label: "Satisfaction guarantee" },
];

export default function AboutPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-purple-900/20 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
              About us
            </Badge>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              About Vexcraft
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              We build the digital things that creators and businesses actually
              need — done right, done fast, and built to last.
            </p>
          </div>
        </section>

        {/* Who we are */}
        <section className="border-t border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  Who we are
                </Badge>
                <h2 className="mb-5 text-3xl font-bold">
                  A team of developers and designers who get things done
                </h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>
                    Vexcraft is a digital studio founded by a small team of
                    passionate developers, designers and creators. We started
                    because we were tired of seeing people overpay for
                    mediocre digital work — or struggle to find reliable
                    freelancers who actually delivered.
                  </p>
                  <p>
                    Today we serve clients ranging from individual streamers and
                    content creators to small and medium-sized businesses
                    across Sweden and beyond. Whether you need a Discord server
                    up and running by tomorrow or a fully custom web application,
                    we have the skills and the drive to make it happen.
                  </p>
                  <p>
                    We keep our team lean and our processes simple. Every project
                    is handled personally — you&apos;ll always be talking to
                    the people actually building your product, not a project
                    manager acting as a middleman.
                  </p>
                </div>
              </div>

              {/* Visual column */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: "🎮", label: "Creators served", count: "100+" },
                  { emoji: "🌐", label: "Websites launched", count: "30+" },
                  { emoji: "📱", label: "Apps delivered", count: "15+" },
                  { emoji: "✨", label: "Emote packs created", count: "50+" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/5 p-6 text-center"
                  >
                    <div className="mb-2 text-3xl">{stat.emoji}</div>
                    <div className="text-2xl font-bold text-white">
                      {stat.count}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                Our values
              </Badge>
              <h2 className="text-3xl font-bold">What we stand for</h2>
              <p className="mt-2 text-gray-400">
                The principles we hold ourselves to on every project.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  className="border-white/10 bg-white/5 text-white hover:border-purple-500/50 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-4xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-sm text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services overview */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                What we build
              </Badge>
              <h2 className="text-3xl font-bold">Our services</h2>
              <p className="mt-2 text-gray-400">
                Six service categories covering everything digital creators and
                businesses need.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-purple-500/50"
                >
                  <span className="text-3xl">{service.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      From {format(service.basePrice, service.basePriceGBP, service.basePriceEUR)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-purple-400" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/30 bg-purple-600/10 px-8 py-12">
              <h2 className="text-3xl font-bold">Let&apos;s build something together</h2>
              <p className="mt-3 text-gray-400">
                Browse our services and find the perfect package for your
                project. If you have something custom in mind, reach out —
                we love a challenge.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/services">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-6" size="lg">
                    View all services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="border border-white/20 text-gray-300 hover:text-white px-6" size="lg">
                    Contact us
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

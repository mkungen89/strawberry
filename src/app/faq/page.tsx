import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "FAQ", description: "Find answers to common questions about our services, pricing, delivery and support.", path: "/faq" });

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import FaqAccordion from "@/components/faq/FaqAccordion";

export default function FaqPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl animate-fade-up">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                FAQ
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                Frequently Asked{" "}
                <span className="gradient-text">Questions</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Find answers to the most common questions about our services,
                ordering process, pricing and support.
              </p>
            </div>
          </div>
        </section>

        {/* Accordion */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <FaqAccordion />
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
                <MessageCircle className="mx-auto mb-4 h-8 w-8 text-purple-400" />
                <h2 className="mb-3 text-3xl font-bold tracking-tight leading-[1.1]">
                  Still have <span className="gradient-text">questions</span>?
                </h2>
                <p className="mx-auto max-w-md text-white/50 leading-relaxed mb-8">
                  Can&apos;t find the answer you&apos;re looking for? Our team is happy to help.
                  We typically reply within a few hours.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/contact">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center gap-2">
                        Contact us <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                      Browse services
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

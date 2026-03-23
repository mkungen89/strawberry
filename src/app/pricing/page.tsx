"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";
import { useState } from "react";

const FAQ_ITEMS = [
  { question: "Do you offer refunds?", answer: "Yes. If work has not yet started, you are entitled to a full refund. Once work has begun, refunds are issued proportionally based on how much has been completed. We will always be transparent and fair." },
  { question: "How many revisions are included?", answer: "Each package specifies the number of included revisions. Additional revisions beyond the included amount can be purchased at a flat rate." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards via Stripe, including Visa, Mastercard, and American Express. Payment is collected before work begins." },
  { question: "Can I upgrade my package after ordering?", answer: "Absolutely. If you decide you need more features during the project, simply contact us and we will arrange an upgrade. You only pay the difference between your current and new package." },
  { question: "Are prices inclusive of VAT?", answer: "All prices listed are excluding VAT. VAT may be applicable depending on your jurisdiction." },
  { question: "How long does delivery take?", answer: "Design assets typically take 1–5 business days. Discord servers 1–3 days. Websites 1–4 weeks. We will confirm an exact timeline when you place your order." },
];

export default function PricingPage() {
  const { format, currency } = useCurrency();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <Badge className="mb-6 border-purple-500/30 bg-purple-500/10 text-purple-300 px-4 py-1.5">Pricing</Badge>
            <h1 className="mb-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Simple,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              No hidden fees. No surprises. One-time payments — no subscriptions required.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-400">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              One-time payment &mdash; own it forever
            </div>
          </div>
        </section>

        {/* Services & Packages */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8 space-y-16">
          <div className="mx-auto max-w-7xl">
            {SERVICES.map((service) => (
              <div key={service.slug} className="mb-16">
                {/* Section header */}
                <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                  <div>
                    <div className="mb-2 flex items-center justify-center gap-3 sm:justify-start">
                      <span className="text-3xl">{service.icon}</span>
                      <h2 className="text-2xl font-bold">{service.name}</h2>
                    </div>
                    <p className="text-gray-400 max-w-xl">{service.description}</p>
                  </div>
                  <Link href={`/services/${service.slug}`} className="mt-4 sm:mt-0 shrink-0">
                    <Button variant="ghost" size="sm" className="border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                      View service <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Package cards */}
                <div className="grid gap-5 sm:grid-cols-3">
                  {service.packages.map((pkg, idx) => {
                    const isPopular = idx === 1;
                    return (
                      <div
                        key={pkg.name}
                        className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:bg-white/[0.04] ${
                          isPopular
                            ? "border-purple-500/30 bg-purple-600/5 ring-1 ring-purple-500/20"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      >
                        {isPopular && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                            Most popular
                          </Badge>
                        )}
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
                          {pkg.name}
                        </p>
                        <div className="flex items-end gap-1 mb-1">
                          <span className="text-4xl font-bold text-white">
                            {currency === "EUR"
                              ? `€${pkg.priceEUR.toLocaleString()}`
                              : currency === "GBP"
                              ? `£${pkg.priceGBP.toLocaleString()}`
                              : `$${pkg.price.toLocaleString()}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-5">One-time, ex. VAT</p>

                        <ul className="space-y-2.5 flex-1 mb-6">
                          {pkg.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                              {feat}
                            </li>
                          ))}
                        </ul>

                        <Link href={`/services/${service.slug}`} className="w-full">
                          <Button
                            className={`w-full ${
                              isPopular
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "border border-white/20 bg-transparent text-white hover:bg-white/10"
                            }`}
                          >
                            Get started <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/[0.06] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <HelpCircle className="mx-auto mb-4 h-10 w-10 text-purple-400" />
              <h2 className="text-3xl font-bold">Pricing FAQ</h2>
              <p className="mt-2 text-gray-400">Common questions about how our pricing and payments work.</p>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-300 ${
                    openFaq === i ? "border-purple-500/20 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-white">{item.question}</span>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      openFaq === i ? "bg-purple-500/20 text-purple-400 rotate-180" : "bg-white/[0.05] text-gray-500"
                    }`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <div className="h-px w-full bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent mb-4" />
                      <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/20 px-8 py-12">
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="mt-3 text-gray-400">Choose a service and place your order today.</p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/services">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-8" size="lg">
                    Browse services <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="ghost" size="lg" className="border border-white/20 bg-transparent text-white hover:bg-white/10 px-8">
                    View bundle deals
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

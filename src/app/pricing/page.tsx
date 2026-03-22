"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";

const FAQ_ITEMS = [
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If work has not yet started, you are entitled to a full refund. Once work has begun, refunds are issued proportionally based on how much has been completed. We will always be transparent and fair.",
  },
  {
    question: "How many revisions are included?",
    answer:
      "Each package specifies the number of included revisions. Additional revisions beyond the included amount can be purchased at a flat rate. We always aim to get it right the first time by gathering thorough requirements upfront.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept most major credit/debit cards via Stripe. Payment is collected before work begins. For larger projects we can arrange milestone-based billing.",
  },
  {
    question: "Can I upgrade my package after ordering?",
    answer:
      "Absolutely. If you decide you need more features during the project, simply contact us and we will arrange an upgrade. You only pay the difference between your current and new package.",
  },
  {
    question: "Are prices inclusive of VAT?",
    answer:
      "All prices listed are excluding VAT. VAT may be applicable depending on your jurisdiction. Companies with a valid VAT number may be exempt depending on their location.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery times vary by service and package. Graphic assets (banners, overlays, icons) typically take 2–5 business days. Discord servers and websites take 5–14 business days. We will confirm an exact timeline when you place your order.",
  },
];

export default function PricingPage() {
  const { format, currency } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
            Pricing
          </Badge>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            No hidden fees. No surprises. Pick the package that fits your needs
            — or{" "}
            <Link href="/contact" className="text-purple-400 hover:underline">
              contact us
            </Link>{" "}
            for a custom quote.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            One-time payment &mdash; no subscriptions
          </div>
        </section>

        {/* Services & Packages */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 space-y-20">
          {SERVICES.map((service) => (
            <div key={service.slug}>
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
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 border border-purple-500/30">
                    View service <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Package cards */}
              <div className="grid gap-6 sm:grid-cols-3">
                {service.packages.map((pkg, idx) => {
                  const isPopular = idx === 1;
                  return (
                    <div key={pkg.name} className="relative">
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white border-0 px-3">
                            Most popular
                          </Badge>
                        </div>
                      )}
                      <Card
                        className={[
                          "relative flex flex-col border-white/10 bg-white/5 text-white transition-all hover:border-purple-500/50",
                          isPopular
                            ? "border-purple-500/50 ring-1 ring-purple-500/30"
                            : "",
                        ].join(" ")}
                      >
                        <CardHeader className="border-b border-white/10 pb-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                            {pkg.name}
                          </p>
                          <div className="mt-1 flex items-end gap-1">
                            <span className="text-4xl font-bold">
                              {currency === "USD"
                                ? pkg.price.toLocaleString()
                                : pkg.priceGBP.toLocaleString()}
                            </span>
                            <span className="mb-1 text-sm text-gray-400">
                              {currency === "USD" ? "USD" : "GBP"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">One-time, ex. VAT</p>
                        </CardHeader>

                        <CardContent className="flex-1 py-5">
                          <ul className="space-y-3">
                            {pkg.features.map((feat) => (
                              <li
                                key={feat}
                                className="flex items-start gap-2 text-sm text-gray-300"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </CardContent>

                        <CardFooter className="border-t border-white/10 bg-transparent pt-4">
                          <Link href={`/services/${service.slug}`} className="w-full">
                            <Button
                              className={[
                                "w-full",
                                isPopular
                                  ? "bg-purple-600 text-white hover:bg-purple-700"
                                  : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                              ].join(" ")}
                            >
                              Get started
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="border-t border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <HelpCircle className="mx-auto mb-4 h-10 w-10 text-purple-400" />
              <h2 className="text-3xl font-bold">Pricing FAQ</h2>
              <p className="mt-2 text-gray-400">
                Common questions about how our pricing and payments work.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="py-6">
                  <h3 className="mb-2 font-semibold text-white">{item.question}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/30 bg-purple-600/10 px-8 py-12">
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="mt-3 text-gray-400">
                Choose a service and place your order today. We&apos;ll reach out
                within 24 hours to confirm the details.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/services">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-6" size="lg">
                    Browse services
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

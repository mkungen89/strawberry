"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/order/OrderForm";
import { SERVICES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/services-details";
import { UPSELLS } from "@/lib/subscription-data";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency-context";
import { ChevronDown, Clock, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import ServiceReviews from "@/components/reviews/ServiceReviews";

interface Props {
  params: Promise<{ slug: string }>;
}

function ServiceFaq({ faq }: { faq: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faq.map((item, i) => (
        <div
          key={i}
          className={`rounded-xl border transition-all duration-300 ${
            openIndex === i
              ? "border-purple-500/20 bg-white/[0.04]"
              : "border-white/[0.06] bg-white/[0.02]"
          }`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="pr-4 text-sm font-medium text-white">{item.question}</span>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
              openIndex === i ? "bg-purple-500/20 text-purple-400 rotate-180" : "bg-white/[0.05] text-gray-500"
            }`}>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4">
              <div className="h-px w-full bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent mb-3" />
              <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ServicePage({ params }: Props) {
  const { slug } = use(params);
  const service = SERVICES.find((s) => s.slug === slug);
  const details = SERVICE_DETAILS[slug];
  const { format } = useCurrency();

  if (!service) notFound();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-5xl">{service.icon}</span>
                  {service.popular && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      Popular
                    </Badge>
                  )}
                </div>
                <h1 className="mb-4 text-4xl font-bold sm:text-5xl">{service.name}</h1>
                <p className="text-lg text-gray-400 leading-relaxed">
                  {details?.longDescription || service.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 lg:flex-col">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="text-sm font-medium text-white">{details?.deliveryTime || "1–7 days"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
                  <RefreshCw className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Revisions</p>
                    <p className="text-sm font-medium text-white">{details?.revisions || "Included"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        {details?.highlights && (
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-8 text-2xl font-bold">What you get</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {details.highlights.map((h) => (
                  <div
                    key={h.title}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-2xl border border-white/[0.06]">
                      {h.icon}
                    </div>
                    <h3 className="mb-2 font-semibold text-white">{h.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Packages + Order Form */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Packages overview */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">Choose your package</h2>
                <div className="space-y-4">
                  {service.packages.map((pkg, idx) => {
                    const isPopular = idx === 1;
                    return (
                      <div
                        key={pkg.name}
                        className={`relative rounded-2xl border p-5 transition-all ${
                          isPopular
                            ? "border-purple-500/30 bg-purple-600/5"
                            : "border-white/[0.08] bg-white/[0.02]"
                        }`}
                      >
                        {isPopular && (
                          <Badge className="absolute -top-2.5 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs">
                            Most popular
                          </Badge>
                        )}
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{pkg.name}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-purple-400">
                              {format(pkg.price, pkg.priceGBP, pkg.priceEUR)}
                            </span>
                            <p className="text-xs text-gray-500">one-time</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {pkg.features.map((f) => (
                            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Process */}
                {details?.process && (
                  <div className="mt-12">
                    <h2 className="mb-6 text-2xl font-bold">Our process</h2>
                    <div className="space-y-0">
                      {details.process.map((p, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/20 text-sm font-bold text-purple-400">
                              {i + 1}
                            </div>
                            {i < details.process.length - 1 && (
                              <div className="w-px flex-1 bg-gradient-to-b from-purple-500/30 to-transparent my-1" />
                            )}
                          </div>
                          <div className="pb-6">
                            <h3 className="font-semibold text-white">{p.step}</h3>
                            <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order form */}
              <div>
                <OrderForm service={service} />
              </div>
            </div>
          </div>
        </section>

        {/* Upsells */}
        {UPSELLS[slug] && UPSELLS[slug].length > 0 && (
          <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-6 text-xl font-bold">Complete your order</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {UPSELLS[slug].map((upsell) => (
                  <Link
                    key={upsell.slug}
                    href={`/services/${upsell.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm">{upsell.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{upsell.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-purple-400">
                        {format(upsell.price, upsell.priceGBP, upsell.priceEUR)}
                      </span>
                      <p className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                        Add <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {details?.faq && (
          <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-white/[0.06]">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-2xl font-bold text-center">
                Questions about {service.name}
              </h2>
              <ServiceFaq faq={details.faq} />
            </div>
          </section>
        )}

        {/* Reviews */}
        <ServiceReviews serviceSlug={slug} />
      </main>
      <Footer />
    </div>
  );
}

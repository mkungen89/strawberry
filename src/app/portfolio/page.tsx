import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import { db } from "@/lib/db";

async function getTestimonials() {
  try {
    return await db.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const testimonials = await getTestimonials();

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
                Portfolio
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                Our{" "}
                <span className="gradient-text">Work</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                A selection of projects delivered for clients across gaming, streaming, and the web.
                Every project is built to order — no templates, no shortcuts.
              </p>
            </div>
          </div>
        </section>

        {/* Portfolio grid */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <PortfolioGrid />
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Testimonials */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Testimonials
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                What clients <span className="gradient-text">say</span>
              </h2>
              <p className="mt-2 text-white/50">Real feedback from real clients.</p>
            </div>

            {testimonials.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-12">No testimonials yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-500/[0.06]"
                  >
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-5 text-sm leading-relaxed text-white/65">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                      <div>
                        <p className="text-sm font-semibold text-white tracking-tight">{t.name}</p>
                        {t.handle && <p className="text-xs text-white/35 mt-0.5">{t.handle}</p>}
                      </div>
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300">
                        {t.service}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  Want to be our next{" "}
                  <span className="gradient-text">success story</span>?
                </h2>
                <p className="mx-auto max-w-md text-white/50 leading-relaxed mb-8">
                  Browse our services and place your order today. No technical knowledge needed.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/services">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center gap-2">
                        Browse services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </Link>
                  <Link href="/pricing">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                      View pricing
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

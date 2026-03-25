import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
            Portfolio
          </Badge>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Our Work
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            A selection of projects we&apos;ve delivered for clients across
            gaming, streaming, and the web. Every project is built to order —
            no templates, no shortcuts.
          </p>
        </section>

        {/* Portfolio grid with client-side filter */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <PortfolioGrid />
        </section>

        {/* Testimonials */}
        <section className="border-t border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">What clients say</h2>
              <p className="mt-2 text-gray-400">
                Real feedback from real clients.
              </p>
            </div>

            {testimonials.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No testimonials yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-300">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        {t.handle && <p className="text-xs text-gray-500">{t.handle}</p>}
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs">
                        {t.service}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/30 bg-purple-600/10 px-8 py-12">
              <h2 className="text-3xl font-bold">
                Want to be our next success story?
              </h2>
              <p className="mt-3 text-gray-400">
                Let&apos;s build something great together. Browse our services
                and place your order today.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/services">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-6" size="lg">
                    Browse services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="border border-white/20 text-gray-300 hover:text-white px-6" size="lg">
                    View pricing
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

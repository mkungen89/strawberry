import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 p-14 sm:p-20">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/30" />
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-80 w-80 rounded-full bg-purple-500/10 blur-[100px] animate-pulse" />
          </div>
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Start your project today
            </div>

            <h2 className="mb-5 text-4xl font-bold tracking-tight leading-[1.1] sm:text-5xl">
              Ready to bring your{" "}
              <span className="gradient-text">vision to life</span>?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-white/55 leading-relaxed">
              Tell us what you need — we handle everything from first concept to final delivery.
              No technical knowledge required.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/services">
                <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-purple-600/30 transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-purple-600/50 active:scale-[0.98]">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Get started now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
              <Link href="/contact">
                <button className="rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:border-white/30 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                  Contact us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

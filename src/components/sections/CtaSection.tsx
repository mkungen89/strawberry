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

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
              <Sparkles className="h-4 w-4" />
              Start your project today
            </div>

            <h2 className="mb-5 text-4xl font-bold sm:text-5xl leading-tight">
              Ready to bring your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                vision to life
              </span>
              ?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-gray-400 leading-relaxed">
              Tell us what you need — we handle everything from design to deployment.
              No technical knowledge required.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/services">
                <Button size="lg" className="group relative bg-purple-600 px-10 py-6 text-lg text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all duration-300">
                  <span className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Get started now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="border border-white/20 bg-transparent px-10 py-6 text-lg text-white hover:bg-white/10 backdrop-blur-sm">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-pink-900/30 p-12">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-400">
              Tell us what you need — we handle the rest. No technical knowledge required.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/services">
                <Button size="lg" className="group bg-purple-600 px-8 text-white hover:bg-purple-700">
                  Get started now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/20 px-8 text-white hover:bg-white/10">
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

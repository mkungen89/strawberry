import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge className="mb-6 border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
          ✨ Professional digital services
        </Badge>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          We build what{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            you dream of
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
          Discord servers, websites, streaming overlays, mobile apps and more.
          Tell us what you need — we handle the rest. No technical knowledge required.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/services">
            <Button size="lg" className="group bg-purple-600 px-8 text-white hover:bg-purple-700">
              See all services
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="outline" className="border-white/20 px-8 text-white hover:bg-white/10">
              View examples
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-400">5.0 average rating</span>
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">100+</span> satisfied customers
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">24h</span> response time
          </div>
        </div>
      </div>
    </section>
  );
}

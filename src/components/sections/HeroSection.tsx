import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Shield, Clock, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-32 pt-24 sm:px-6 lg:px-8">
      {/* Animated background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" />
        {/* Secondary glow */}
        <div className="absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px] animate-pulse [animation-delay:1s]" />
        {/* Accent glow */}
        <div className="absolute left-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/8 blur-[80px] animate-pulse [animation-delay:2s]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <Badge className="mb-8 border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-4 py-1.5 text-sm backdrop-blur-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Available for new projects
        </Badge>

        <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-8xl">
          We build what{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
              you dream of
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-purple-500/0 rounded-full" />
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
          Logo design, social media kits, SEO, copywriting, streaming overlays, websites, apps and more.
          Tell us what you need — we handle the rest.{" "}
          <span className="text-gray-300">No technical knowledge required.</span>
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/services">
            <Button size="lg" className="group relative bg-purple-600 px-10 py-6 text-lg text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all duration-300">
              <span className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                See all services
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="ghost" className="border border-white/20 bg-transparent px-10 py-6 text-lg text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              View our work
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-purple-500/20 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400">5.0 average rating</span>
            </div>
          </div>

          <div className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-purple-500/20 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100+</p>
              <span className="text-sm text-gray-400">satisfied customers</span>
            </div>
          </div>

          <div className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm hover:border-purple-500/20 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <Clock className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">24h</p>
              <span className="text-sm text-gray-400">response time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

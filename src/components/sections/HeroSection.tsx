import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const MARQUEE_ITEMS = [
  "Logo Design", "Social Media Kit", "YouTube Banners", "Streaming Overlays",
  "Discord Servers", "SEO Audit", "Copywriting", "Mobile Apps",
  "Website Development", "Video Shorts", "Growth Strategy", "Brand Identity",
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">

      {/* Background image — very subtle */}
      <Image
        src="/bg.png"
        alt=""
        fill
        className="pointer-events-none object-cover object-center opacity-[0.07]"
        priority
      />

      {/* Floating gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[8%] top-[10%] h-[700px] w-[700px] rounded-full bg-purple-700/25 blur-[130px]"
          style={{ animation: "float-orb 14s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[3%] top-[15%] h-[450px] w-[450px] rounded-full bg-pink-600/20 blur-[110px]"
          style={{ animation: "float-orb-2 17s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[5%] left-[35%] h-[380px] w-[380px] rounded-full bg-violet-500/15 blur-[90px]"
          style={{ animation: "float-orb 21s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute right-[25%] bottom-[25%] h-[280px] w-[280px] rounded-full bg-blue-500/10 blur-[80px]"
          style={{ animation: "float-orb-2 24s ease-in-out infinite" }}
        />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      {/* Radial fade-out edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,black_100%)]" />

      <div className="relative mx-auto w-full max-w-6xl">

        {/* Live badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            Available for new projects
          </div>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 text-center text-5xl font-extrabold leading-[1.07] tracking-tight sm:text-6xl lg:text-8xl xl:text-[96px]">
          <span className="block text-white">We build what</span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #c084fc, #f472b6, #818cf8, #c084fc)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 5s linear infinite",
            }}
          >
            you dream of
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-400 sm:text-xl leading-relaxed">
          Logos, social media kits, streaming overlays, websites, apps and more.{" "}
          <span className="text-white/70">Tell us what you need — we handle the rest.</span>
        </p>

        {/* CTA buttons */}
        <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/services">
            <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-purple-600/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-600/50">
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                See all services
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </Link>
          <Link href="/portfolio">
            <button className="rounded-xl border border-white/15 bg-white/5 px-10 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:bg-white/10">
              View our work
            </button>
          </Link>
        </div>

        {/* Marquee strip */}
        <div className="relative mb-20 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />
          <div
            className="flex"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 px-8 py-2">
                <span className="h-1 w-1 rounded-full bg-purple-500/60" />
                <span className="whitespace-nowrap text-sm text-gray-500">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { value: "100+", label: "Happy clients", glow: "shadow-purple-500/20", border: "border-purple-500/15", bg: "from-purple-500/10 to-transparent" },
            { value: "5.0 ★", label: "Average rating", glow: "shadow-yellow-500/20", border: "border-yellow-500/15", bg: "from-yellow-500/10 to-transparent" },
            { value: "24h", label: "Response time", glow: "shadow-green-500/20", border: "border-green-500/15", bg: "from-green-500/10 to-transparent" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`group rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-6 text-center backdrop-blur-sm shadow-xl ${stat.glow} transition-all duration-300 hover:scale-[1.02]`}
            >
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

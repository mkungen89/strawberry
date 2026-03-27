import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Alex K.",
    role: "Twitch Streamer",
    avatar: "AK",
    rating: 5,
    comment: "Incredible overlays! Got exactly what I wanted and delivery was fast. Highly recommend!",
    service: "Streaming Overlay",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Sara M.",
    role: "Business Owner",
    avatar: "SM",
    rating: 5,
    comment: "Ordered a website and knew nothing about tech — but they explained everything and chose the perfect solution for me.",
    service: "Website",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Johan L.",
    role: "Discord Community Manager",
    avatar: "JL",
    rating: 5,
    comment: "Our Discord server has never looked so professional. All roles, channels and bots work perfectly.",
    service: "Discord Server",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    name: "Emma R.",
    role: "YouTuber",
    avatar: "ER",
    rating: 5,
    comment: "New banner, avatar and thumbnail template — everything matched my brand perfectly. Subscribers noticed the difference right away!",
    service: "YouTube Banner",
    gradient: "from-red-500 to-orange-500",
  },
  {
    name: "Marcus T.",
    role: "App Founder",
    avatar: "MT",
    rating: 5,
    comment: "Got a complete mobile app for my startup. Clear communication throughout the project and the end result was incredible.",
    service: "Mobile App",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Lina P.",
    role: "Content Creator",
    avatar: "LP",
    rating: 5,
    comment: "Emotes and badges are on a completely different level now. My subs love them! Fast delivery and fantastic service.",
    service: "Streaming Icons",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center animate-fade-up">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            Testimonials
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl">
            Loved by{" "}
            <span className="gradient-text">creators worldwide</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/50 leading-relaxed">
            Over 100 satisfied customers — see what they think about working with us.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-500/[0.07] hover:scale-[1.01]"
            >
              {/* Quote icon */}
              <Quote className="absolute right-5 top-5 h-8 w-8 text-white/[0.04] group-hover:text-purple-400/15 transition-all duration-300" />

              <div className="mb-5 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white shadow-lg ring-2 ring-white/10`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white tracking-tight">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>

              <div className="mb-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10"}`}
                  />
                ))}
              </div>

              <p className="mb-4 text-sm text-white/65 leading-relaxed">&quot;{t.comment}&quot;</p>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs text-white/40">
                {t.service}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

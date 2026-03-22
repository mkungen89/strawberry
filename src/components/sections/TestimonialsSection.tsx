import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Alex K.",
    role: "Twitch Streamer",
    avatar: "AK",
    rating: 5,
    comment: "Incredible overlays! Got exactly what I wanted and delivery was fast. Highly recommend!",
    service: "Streaming Overlay",
  },
  {
    name: "Sara M.",
    role: "Business Owner",
    avatar: "SM",
    rating: 5,
    comment: "Ordered a website and knew nothing about tech — but they explained everything and chose the perfect solution for me.",
    service: "Website",
  },
  {
    name: "Johan L.",
    role: "Discord Community Manager",
    avatar: "JL",
    rating: 5,
    comment: "Our Discord server has never looked so professional. All roles, channels and bots work perfectly.",
    service: "Discord Server",
  },
  {
    name: "Emma R.",
    role: "YouTuber",
    avatar: "ER",
    rating: 5,
    comment: "New banner, avatar and thumbnail template — everything matched my brand perfectly. Subscribers noticed the difference right away!",
    service: "YouTube Banner",
  },
  {
    name: "Marcus T.",
    role: "App Founder",
    avatar: "MT",
    rating: 5,
    comment: "Got a complete mobile app for my startup. Clear communication throughout the project and the end result was incredible.",
    service: "Mobile App",
  },
  {
    name: "Lina P.",
    role: "Content Creator",
    avatar: "LP",
    rating: 5,
    comment: "Emotes and badges are on a completely different level now. My subs love them! Fast delivery and fantastic service.",
    service: "Streaming Icons",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">What our customers say</h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Over 100 satisfied customers — see what they think about our services.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                <p className="mb-3 text-sm text-gray-300">{t.comment}</p>
                <p className="text-xs text-purple-400">Service: {t.service}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

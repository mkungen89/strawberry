"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

type Project = {
  id: number;
  name: string;
  service: string;
  category: string;
  gradient: string;
  description: string;
};

const PROJECTS: Project[] = [
  {
    id: 1,
    name: "Gaming Community Hub",
    service: "Discord Server",
    category: "Discord",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    description: "A thriving gaming server with 2 000+ members, custom bots and automated moderation.",
  },
  {
    id: 2,
    name: "Esports Organisation",
    service: "Discord Server",
    category: "Discord",
    gradient: "from-blue-700 via-indigo-600 to-purple-700",
    description: "Fully structured esports community with team channels, ticket support and role automation.",
  },
  {
    id: 3,
    name: "Tech Creator Branding",
    service: "YouTube Banner & Avatar",
    category: "YouTube",
    gradient: "from-red-600 via-orange-500 to-yellow-400",
    description: "Clean, professional channel art for a tech review channel with 50k+ subscribers.",
  },
  {
    id: 4,
    name: "Lifestyle Vlog Identity",
    service: "YouTube Banner & Avatar",
    category: "YouTube",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    description: "Vibrant and eye-catching branding package with banner, avatar and thumbnail template.",
  },
  {
    id: 5,
    name: "FPS Streamer Overlay",
    service: "Streaming Overlay",
    category: "Streaming",
    gradient: "from-cyan-600 via-teal-500 to-green-500",
    description: "Fully animated overlay pack with custom alerts, scenes and panels for a Twitch FPS streamer.",
  },
  {
    id: 6,
    name: "IRL Stream Pack",
    service: "Streaming Overlay",
    category: "Streaming",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    description: "Minimalist IRL streaming pack featuring clean overlays and subscriber notification alerts.",
  },
  {
    id: 7,
    name: "SaaS Landing Page",
    service: "Website",
    category: "Website",
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    description: "High-converting landing page for a B2B SaaS product built with Next.js and Tailwind.",
  },
  {
    id: 8,
    name: "Tech Blog Platform",
    service: "Website",
    category: "Website",
    gradient: "from-slate-600 via-gray-700 to-zinc-600",
    description: "Full-featured blog platform with CMS, author dashboard and Stripe subscription payments.",
  },
  {
    id: 9,
    name: "Fitness Tracker App",
    service: "Mobile App",
    category: "App",
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
    description: "Cross-platform fitness app for iOS & Android with workout plans, progress tracking and push notifications.",
  },
  {
    id: 10,
    name: "Event Booking App",
    service: "Mobile App",
    category: "App",
    gradient: "from-purple-700 via-violet-600 to-indigo-500",
    description: "Native event discovery and booking app with in-app payments and real-time seat availability.",
  },
  {
    id: 11,
    name: "Twitch Emote Pack",
    service: "Streaming Icons & Emotes",
    category: "Streaming",
    gradient: "from-fuchsia-600 via-purple-600 to-blue-600",
    description: "30-emote full pack for a Twitch partner, including sub-badges and channel point icons.",
  },
  {
    id: 12,
    name: "Discord Emote Bundle",
    service: "Streaming Icons & Emotes",
    category: "Streaming",
    gradient: "from-sky-600 via-blue-600 to-indigo-600",
    description: "Custom Discord server emotes and reaction pack designed to match the server's brand identity.",
  },
];

const CATEGORIES = ["All", "Discord", "YouTube", "Streaming", "Website", "App"];

export default function PortfolioGrid() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              active === cat
                ? "border-purple-500 bg-purple-600 text-white"
                : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/50 hover:text-white",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-purple-500/50"
          >
            {/* Gradient placeholder */}
            <div
              className={`relative h-48 w-full bg-gradient-to-br ${project.gradient} flex items-center justify-center`}
            >
              <span className="text-4xl font-black text-white/20 select-none">
                {project.name.charAt(0)}
              </span>
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Card body */}
            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white leading-snug">
                  {project.name}
                </h3>
                <Badge className="shrink-0 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs">
                  {project.category}
                </Badge>
              </div>
              <p className="mb-1 text-xs font-medium text-purple-400">
                {project.service}
              </p>
              <p className="mb-4 text-sm text-gray-400 leading-relaxed">
                {project.description}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full border border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50 hover:text-white"
              >
                View details
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

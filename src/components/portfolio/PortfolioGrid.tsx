"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  service: string;
  category: string;
  gradient: string;
  description: string;
  imageUrl: string | null;
};

const CATEGORIES = ["All", "Discord", "YouTube", "Streaming", "Website", "App", "Branding"];

export default function PortfolioGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  // Only show category tabs that have at least one project
  const activeCats = CATEGORIES.filter(
    (cat) => cat === "All" || projects.some((p) => p.category === cat)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm">
        No portfolio projects yet.
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {activeCats.map((cat) => (
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
            className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
          >
            {/* Image or gradient placeholder */}
            <div className={`relative h-48 w-full bg-gradient-to-br ${project.gradient} overflow-hidden`}>
              {project.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-4xl font-black text-white/20 select-none">
                    {project.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Card body */}
            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white leading-snug">{project.title}</h3>
                <Badge className="shrink-0 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs">
                  {project.category}
                </Badge>
              </div>
              <p className="mb-1 text-xs font-medium text-purple-400">{project.service}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Github, Twitter, Linkedin, Globe, ArrowRight } from "lucide-react";

interface TeamMemberData {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

const TEAM: TeamMemberData[] = [
  {
    name: "Ida Lindqvist",
    role: "Lead Designer",
    avatar: "🎨",
    bio: "Ida crafts the visual identity of every project — from logos to full brand kits. Her eye for detail and love for dark, glassmorphic aesthetics defines the Vexcraft look.",
    social: {
      twitter: "https://twitter.com",
    },
  },
  {
    name: "Leo Svensson",
    role: "Full-Stack Developer",
    avatar: "⚡",
    bio: "Leo architects our web and app solutions. With a passion for clean code and fast deployments, he turns complex requirements into elegant, production-ready systems.",
    social: {
      github: "https://github.com",
    },
  },
  {
    name: "Selma Borg",
    role: "Discord Specialist",
    avatar: "🎮",
    bio: "Selma is the force behind our Discord server setups. She knows bots, permissions, and community structures inside out — and builds servers that actually work.",
    social: {
      twitter: "https://twitter.com",
    },
  },
  {
    name: "Noah Karlsson",
    role: "Motion & Video Designer",
    avatar: "🎬",
    bio: "Noah creates the overlays, alerts, and transitions that make streams pop. His animations are smooth, snappy, and built for the streaming world.",
    social: {
      twitter: "https://twitter.com",
    },
  },
  {
    name: "Elias Magnusson",
    role: "Brand & Identity Designer",
    avatar: "✨",
    bio: "Elias lives for logos and brand systems. He digs deep into each client's vision and translates it into a cohesive visual language that stands out.",
    social: {
      linkedin: "https://linkedin.com",
    },
  },
  {
    name: "Maja Eriksson",
    role: "Project Manager & Support",
    avatar: "🛡️",
    bio: "Maja keeps everything on track. She's the glue between clients and creatives — making sure deadlines are met, communication is clear, and every client feels heard.",
    social: {
      linkedin: "https://linkedin.com",
    },
  },
];

const CULTURE = [
  {
    emoji: "🌐",
    title: "Remote-first",
    description: "Our team is distributed across Sweden and beyond. We work where we're most productive.",
  },
  {
    emoji: "⚡",
    title: "Move fast",
    description: "We value speed without sacrificing quality. Most projects ship in 5–14 business days.",
  },
  {
    emoji: "💬",
    title: "Communicate openly",
    description: "No surprises. We keep clients in the loop at every step and respond within 24 hours.",
  },
  {
    emoji: "🎯",
    title: "Obsess over quality",
    description: "Every deliverable goes through our quality checklist before it reaches you.",
  },
];

export default function TeamPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl animate-fade-up">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Our team
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl">
                The people behind{" "}
                <span className="gradient-text">Vexcraft</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                A lean, passionate team of designers, developers, and creators —
                all obsessed with shipping quality work on time.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Team members */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Meet the crew
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                The people who build your <span className="gradient-text">vision</span>
              </h2>
              <p className="mt-2 text-white/50">
                When you work with Vexcraft, you talk to the people actually doing the work.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-500/[0.06]"
                >
                  {/* Avatar */}
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-gradient-to-br from-purple-600/20 to-purple-900/20 text-2xl backdrop-blur-sm">
                    {member.avatar}
                  </div>

                  {/* Name + Role */}
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-purple-400">
                    {member.role}
                  </p>

                  {/* Bio */}
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    {member.bio}
                  </p>

                  {/* Social links */}
                  {member.social && (
                    <div className="mt-5 flex items-center gap-2">
                      {member.social.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-[1.1]"
                          aria-label="GitHub"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-[1.1]"
                          aria-label="Twitter"
                        >
                          <Twitter className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-[1.1]"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {member.social.website && (
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:scale-[1.1]"
                          aria-label="Website"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Culture section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Our culture
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight leading-[1.1]">
                How we <span className="gradient-text">work</span>
              </h2>
              <p className="mt-2 text-white/50">
                The principles that guide how we collaborate — with each other and with our clients.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CULTURE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-500/[0.06] hover:scale-[1.01]"
                >
                  <div className="mb-4 text-3xl">{item.emoji}</div>
                  <h3 className="mb-2 font-semibold text-white tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="section-divider" />
        </div>

        {/* Hiring CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 p-14 sm:p-20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-pink-900/30" />
              <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-purple-500/10 blur-[90px]" />
              </div>
              <div className="relative">
                <div className="mx-auto mb-4 text-4xl">🚀</div>
                <h2 className="mb-3 text-3xl font-bold tracking-tight leading-[1.1]">
                  Want to <span className="gradient-text">join us</span>?
                </h2>
                <p className="mx-auto max-w-md text-white/50 leading-relaxed mb-8">
                  We&apos;re always looking for talented people who love what they do.
                  If you&apos;re a designer, developer, or creative — let&apos;s talk.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <a href="mailto:hello@vexcraft.io">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-purple-600/40 active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center gap-2">
                        Get in touch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </a>
                  <Link href="/contact">
                    <button className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
                      Contact page
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

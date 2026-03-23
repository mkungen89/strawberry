"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Twitter, Linkedin, Globe } from "lucide-react";

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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-purple-900/20 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Our team
            </Badge>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              The people behind Vexcraft
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              A lean, passionate team of designers, developers, and creators — all
              obsessed with shipping quality work on time.
            </p>
          </div>
        </section>

        {/* Team members */}
        <section className="border-t border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                Meet the crew
              </Badge>
              <h2 className="text-3xl font-bold">The people who build your vision</h2>
              <p className="mt-2 text-gray-400">
                When you work with Vexcraft, you talk to the people actually doing the work.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((member) => (
                <Card
                  key={member.name}
                  className="border-white/10 bg-white/5 text-white hover:border-purple-500/40 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    {/* Avatar */}
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 to-purple-900/20 text-3xl backdrop-blur">
                      {member.avatar}
                    </div>

                    {/* Name + Role */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-purple-400">
                      {member.role}
                    </p>

                    {/* Bio */}
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      {member.bio}
                    </p>

                    {/* Social links */}
                    {member.social && (
                      <div className="mt-5 flex items-center gap-3">
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-purple-500/40 hover:text-purple-400"
                            aria-label="GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a
                            href={member.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-purple-500/40 hover:text-purple-400"
                            aria-label="Twitter"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-purple-500/40 hover:text-purple-400"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.website && (
                          <a
                            href={member.social.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:border-purple-500/40 hover:text-purple-400"
                            aria-label="Website"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Culture section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                Our culture
              </Badge>
              <h2 className="text-3xl font-bold">How we work</h2>
              <p className="mt-2 text-gray-400">
                The principles that guide how we collaborate — with each other and with our clients.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CULTURE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-purple-500/30"
                >
                  <div className="mb-3 text-3xl">{item.emoji}</div>
                  <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring CTA */}
        <section className="border-t border-white/10 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/30 bg-purple-600/10 px-8 py-12">
              <div className="mb-3 text-4xl">🚀</div>
              <h2 className="text-3xl font-bold">Want to join us?</h2>
              <p className="mt-3 text-gray-400">
                We&apos;re always looking for talented people who love what they do.
                If you&apos;re a designer, developer, or creative — let&apos;s talk.
              </p>
              <a
                href="mailto:hello@vexcraft.io"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-700"
              >
                Get in touch →
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

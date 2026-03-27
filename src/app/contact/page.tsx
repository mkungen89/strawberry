"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, MessageSquare, Zap, Clock, Calendar, Loader2, ArrowRight } from "lucide-react";

const SUBJECTS = [
  { value: "general",     label: "General Inquiry" },
  { value: "order",       label: "Order Support" },
  { value: "technical",   label: "Technical Issue" },
  { value: "partnership", label: "Partnership" },
  { value: "other",       label: "Other" },
];

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email and we'll get back to you within 24 hours.",
    value: "support@vexcraft.io",
    href: "mailto:support@vexcraft.io",
  },
  {
    icon: MessageSquare,
    title: "Discord",
    description: "Join our Discord server for community support and fast responses.",
    value: "discord.gg/vexcraft",
    href: "https://discord.gg/GsgGFt7Rgu",
  },
  {
    icon: Zap,
    title: "Live Chat",
    description: "Chat with us directly on the website during business hours.",
    value: "Available on site",
    href: "#chat",
  },
];

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });

  function setField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
                Contact
              </span>
              <h1 className="mb-4 mt-6 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl">
                Let&apos;s{" "}
                <span className="gradient-text">talk</span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Have a question or want to work with us? We&apos;re here to help.
                Reach out through any of the channels below.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">

            {/* Left — contact info */}
            <div className="space-y-8">
              {/* Quick info */}
              <div className="space-y-3">
                {[
                  { icon: Mail,     label: "Email us at",  value: "support@vexcraft.io", href: "mailto:support@vexcraft.io", link: true },
                  { icon: Clock,    label: "Response time", value: "Within 24 hours",     href: null, link: false },
                  { icon: Calendar, label: "Available",     value: "Monday – Sunday",     href: null, link: false },
                ].map(({ icon: Icon, label, value, href, link }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] shrink-0">
                      <Icon className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/35">{label}</p>
                      {link && href ? (
                        <a href={href} className="text-sm font-medium text-white hover:text-purple-300 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact method cards */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Contact methods</p>
                <div className="space-y-3">
                  {CONTACT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.title}
                        className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/25 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-purple-500/[0.05]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-600/15">
                            <Icon className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white tracking-tight">{method.title}</p>
                            <p className="mt-0.5 text-xs text-white/45 leading-relaxed">{method.description}</p>
                            <a
                              href={method.href}
                              target={method.href.startsWith("http") ? "_blank" : undefined}
                              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="mt-1.5 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              {method.value}
                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-lg font-bold tracking-tight text-white">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-xs text-white/50 mb-1.5 block">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    required
                    className="border-white/[0.12] bg-white/[0.04] text-white placeholder:text-white/20 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs text-white/50 mb-1.5 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                    className="border-white/[0.12] bg-white/[0.04] text-white placeholder:text-white/20 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-xs text-white/50 mb-1.5 block">Subject</Label>
                  <Select value={form.subject} onValueChange={(v) => v && setField("subject", v)}>
                    <SelectTrigger
                      id="subject"
                      className="w-full border-white/[0.12] bg-white/[0.04] text-white data-placeholder:text-white/20"
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-950 border-white/10 text-white">
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-xs text-white/50 mb-1.5 block">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your question or project..."
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    required
                    rows={5}
                    className="border-white/[0.12] bg-white/[0.04] text-white placeholder:text-white/20 resize-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.01] hover:shadow-purple-600/40 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      "Send Message"
                    )}
                  </span>
                </button>
              </form>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

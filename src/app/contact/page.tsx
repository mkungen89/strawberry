"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, MessageSquare, Zap, Clock, Calendar, Loader2 } from "lucide-react";

const SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Support" },
  { value: "technical", label: "Technical Issue" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
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
    href: "https://discord.gg/vexcraft",
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
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Have a question or want to work with us? We&apos;re here to help. Reach out through any
            of the channels below.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left — Contact info */}
          <div className="space-y-8">
            {/* Info block */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Mail className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400">Email us at</p>
                  <a
                    href="mailto:support@vexcraft.io"
                    className="font-medium text-white hover:text-purple-400 transition-colors"
                  >
                    support@vexcraft.io
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Clock className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400">Response time</p>
                  <p className="font-medium text-white">Within 24 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400">Available</p>
                  <p className="font-medium text-white">Monday &ndash; Sunday</p>
                </div>
              </div>
            </div>

            {/* Contact method cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Contact Methods</h2>
              {CONTACT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.title}
                    className="border-white/10 bg-white/5 text-white transition-colors hover:border-purple-500/40"
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600/20">
                        <Icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{method.title}</p>
                        <p className="mt-0.5 text-sm text-gray-400">{method.description}</p>
                        <a
                          href={method.href}
                          target={method.href.startsWith("http") ? "_blank" : undefined}
                          rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="mt-1 inline-block text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {method.value}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right — Contact form */}
          <div>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <h2 className="mb-6 text-lg font-semibold text-white">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      required
                      className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      required
                      className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-gray-300">
                      Subject
                    </Label>
                    <Select
                      value={form.subject}
                      onValueChange={(value) => value && setField("subject", value as string)}
                    >
                      <SelectTrigger
                        id="subject"
                        className="mt-1 w-full border-white/20 bg-white/5 text-white data-placeholder:text-gray-600"
                      >
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-gray-300">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your question or project..."
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      required
                      rows={5}
                      className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending&hellip;
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

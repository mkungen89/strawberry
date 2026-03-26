"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ENTERPRISE_SERVICES } from "@/lib/services-data";
import { ArrowLeft, Github, Loader2 } from "lucide-react";

const BUDGET_RANGES = [
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-5k", label: "$1,000 – $5,000" },
  { value: "5k-10k", label: "$5,000 – $10,000" },
  { value: "10k-25k", label: "$10,000 – $25,000" },
  { value: "25k+", label: "$25,000+" },
  { value: "flexible", label: "Flexible / Not sure" },
];

const TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "1-month", label: "Within 1 month" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "flexible", label: "Flexible" },
];

const SITE_TYPES = [
  { value: "portfolio", label: "Portfolio / Personal site" },
  { value: "ecommerce", label: "E-commerce / Online store" },
  { value: "blog", label: "Blog / News" },
  { value: "webapp", label: "Web app / SaaS" },
  { value: "landing", label: "Landing page" },
  { value: "other", label: "Other" },
];

const SAAS_FEATURES = [
  { id: "auth", label: "User authentication & accounts" },
  { id: "payments", label: "Payments & subscriptions (Stripe)" },
  { id: "admin", label: "Admin dashboard" },
  { id: "api", label: "Public API" },
  { id: "realtime", label: "Real-time features (chat, notifications)" },
  { id: "analytics", label: "Analytics & reporting" },
  { id: "email", label: "Transactional emails" },
  { id: "multitenancy", label: "Multi-tenancy / teams" },
];

const DESCRIPTION_PLACEHOLDERS: Record<string, string> = {
  website:
    "Describe your website — what it should do, who it's for, any references or inspiration you like...",
  "mobile-app":
    "Describe your app — what it does, who it's for, key features you need...",
  "saas-platform":
    "Describe your SaaS idea — what problem it solves, your target users, what it should do...",
};

export default function EnterpriseQuotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const service = ENTERPRISE_SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();
  const svc = service!;

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  // Website-specific
  const [siteType, setSiteType] = useState("");
  const [techStackPref, setTechStackPref] = useState("");

  // Mobile-specific
  const [platform, setPlatform] = useState("");
  const [hasDesigns, setHasDesigns] = useState("");

  // SaaS-specific
  const [saasFeatures, setSaasFeatures] = useState<string[]>([]);

  function toggleSaasFeature(id: string) {
    setSaasFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !description.trim() || !budget || !timeline) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (slug === "website" && !siteType) {
      toast.error("Please select the type of website.");
      return;
    }
    if (slug === "mobile-app" && !platform) {
      toast.error("Please select the target platform.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: slug,
          serviceName: svc.name,
          name,
          email,
          description,
          github,
          budget,
          timeline,
          siteType: slug === "website" ? siteType : undefined,
          techStackPref: slug === "website" ? techStackPref : undefined,
          platform: slug === "mobile-app" ? platform : undefined,
          hasDesigns: slug === "mobile-app" ? hasDesigns : undefined,
          saasFeatures: slug === "saas-platform" ? saasFeatures : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Something went wrong.");
        return;
      }

      toast.success("Quote request sent! We'll get back to you within 24 hours.");
      router.push("/services");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-4xl">{svc.icon}</span>
            <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-300 px-3">
              Enterprise
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{svc.name}</h1>
          <p className="mt-2 text-gray-400">{svc.description}</p>
        </div>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="p-6">
            <h2 className="mb-1 text-lg font-semibold">Request a Quote</h2>
            <p className="mb-6 text-sm text-gray-400">
              Fill in as much detail as possible — we&apos;ll get back to you within 24 hours with a custom quote.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-gray-300">Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Website-specific */}
              {slug === "website" && (
                <>
                  <div>
                    <Label className="text-gray-300">Type of website *</Label>
                    <Select value={siteType} onValueChange={(v) => v && setSiteType(v)}>
                      <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="What kind of site?" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        {SITE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">
                      Tech stack preference{" "}
                      <span className="text-gray-500 font-normal">(optional)</span>
                    </Label>
                    <Input
                      value={techStackPref}
                      onChange={(e) => setTechStackPref(e.target.value)}
                      placeholder="e.g. Next.js + PostgreSQL, WordPress, no preference..."
                      className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                    />
                  </div>
                </>
              )}

              {/* Mobile-specific */}
              {slug === "mobile-app" && (
                <>
                  <div>
                    <Label className="text-gray-300">Target platform *</Label>
                    <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                      <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="iOS, Android, or both?" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="ios">iOS only</SelectItem>
                        <SelectItem value="android">Android only</SelectItem>
                        <SelectItem value="both">Both (cross-platform)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">
                      Do you have designs or wireframes?{" "}
                      <span className="text-gray-500 font-normal">(optional)</span>
                    </Label>
                    <Select value={hasDesigns} onValueChange={(v) => v && setHasDesigns(v)}>
                      <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="yes">Yes, I have Figma / design files</SelectItem>
                        <SelectItem value="partial">Partial / rough sketches</SelectItem>
                        <SelectItem value="no">No, start from scratch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* SaaS-specific */}
              {slug === "saas-platform" && (
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Features you need{" "}
                    <span className="text-gray-500 font-normal">(select all that apply)</span>
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SAAS_FEATURES.map((f) => (
                      <label
                        key={f.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-300 hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={saasFeatures.includes(f.id)}
                          onChange={() => toggleSaasFeature(f.id)}
                          className="h-4 w-4 accent-orange-500 shrink-0"
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <Label className="text-gray-300">Project description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={DESCRIPTION_PLACEHOLDERS[slug] ?? "Describe your project..."}
                  required
                  rows={5}
                  className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600 resize-none"
                />
              </div>

              {/* GitHub / Reference */}
              <div>
                <Label className="text-gray-300 flex items-center gap-2">
                  <Github className="h-3.5 w-3.5" />
                  GitHub / Figma / reference URL{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </Label>
                <Input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourname/repo"
                  className="mt-1 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
                />
              </div>

              {/* Budget & Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-gray-300">Budget range *</Label>
                  <Select value={budget} onValueChange={(v) => v && setBudget(v)}>
                    <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                      <SelectValue placeholder="Select budget..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Timeline *</Label>
                  <Select value={timeline} onValueChange={(v) => v && setTimeline(v)}>
                    <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                      <SelectValue placeholder="When do you need it?" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                      {TIMELINES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Quote Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

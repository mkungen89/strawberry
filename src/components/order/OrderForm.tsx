"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TECH_STACKS, RECOMMENDATIONS, MODULES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";
import ModuleSelector from "@/components/order/ModuleSelector";

interface Package {
  name: string;
  price: number;
  priceGBP: number;
  priceEUR: number;
  features: string[];
}

interface Service {
  slug: string;
  name: string;
  icon: string;
  packages: Package[];
  hasTechStack?: boolean;
}

interface Props {
  service: Service;
}

export default function OrderForm({ service }: Props) {
  const router = useRouter();
  const { format } = useCurrency();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [details, setDetails] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [siteType, setSiteType] = useState("");
  const [techStack, setTechStack] = useState({
    frontend: "",
    backend: "",
    database: "",
    hosting: "",
  });
  const [recommendation, setRecommendation] = useState<{
    frontend: string;
    backend: string;
    database: string;
    hosting: string;
    reason: string;
  } | null>(null);

  function toggleModule(moduleId: string) {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  }

  const modulesTotal = selectedModules.reduce(
    (sum, id) => sum + (MODULES.find((m) => m.id === id)?.price || 0),
    0
  );
  const modulesTotalGBP = selectedModules.reduce(
    (sum, id) => sum + (MODULES.find((m) => m.id === id)?.priceGBP || 0),
    0
  );
  const modulesTotalEUR = selectedModules.reduce(
    (sum, id) => sum + (MODULES.find((m) => m.id === id)?.priceEUR || 0),
    0
  );

  function getRecommendation() {
    const rec = RECOMMENDATIONS[siteType] || RECOMMENDATIONS["webapp"];
    setRecommendation(rec);
    setTechStack({
      frontend: rec.frontend,
      backend: rec.backend,
      database: rec.database,
      hosting: rec.hosting,
    });
  }

  async function handleSubmit() {
    if (!selectedPackage) {
      toast.error("Please select a package first.");
      return;
    }
    if (!details.trim()) {
      toast.error("Please describe what you want.");
      return;
    }

    const totalUSD = selectedPackage.price + modulesTotal;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          packageName: selectedPackage.name,
          price: totalUSD,
          details,
          modules: selectedModules,
          techStack: service.hasTechStack ? techStack : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "UNAUTHENTICATED") {
          router.push("/login");
          return;
        }
        throw new Error(data.error);
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepList = service.hasTechStack ? [1, 2, 3, 4] : [1, 2, 3];

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <h2 className="text-2xl font-bold">Place an order</h2>
        <div className="flex gap-2">
          {stepList.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s ? "bg-purple-600 text-white" : "bg-white/10 text-gray-500"
                }`}
              >
                {s}
              </div>
              {i < stepList.length - 1 && <div className="h-px w-6 bg-white/20" />}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Choose package */}
        {step === 1 && (
          <div>
            <h3 className="mb-4 font-semibold text-gray-200">Choose a package</h3>
            <div className="space-y-3">
              {service.packages.map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedPackage?.name === pkg.name
                      ? "border-purple-500 bg-purple-600/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{pkg.name}</span>
                    <span className="text-lg font-bold text-purple-400">{format(pkg.price, pkg.priceGBP, pkg.priceEUR)}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="text-xs text-gray-400">• {f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedPackage}
              className="mt-6 w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Describe what you want */}
        {step === 2 && (
          <div>
            <h3 className="mb-2 font-semibold text-gray-200">Tell us what you want</h3>
            <p className="mb-4 text-sm text-gray-400">
              Don&apos;t worry about being technical — just describe your idea, style, colors, and what you need.
            </p>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={`Example: I want a Discord server for my gaming community. The theme should be dark blue and neon green. I need channels for announcements, general chat, gaming sessions, and a rules channel. I'd like a welcome bot that greets new members.`}
              className="min-h-48 border-white/20 bg-white/5 text-white placeholder:text-gray-600"
            />
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!details.trim()}
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Module selection */}
        {step === 3 && (
          <div>
            <ModuleSelector
              serviceSlug={service.slug}
              selectedModules={selectedModules}
              onToggle={toggleModule}
            />
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={() => (service.hasTechStack ? setStep(4) : handleSubmit())}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : service.hasTechStack ? (
                  "Continue"
                ) : (
                  "Proceed to payment"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Tech stack (website/app only) */}
        {step === 4 && service.hasTechStack && (
          <div>
            <h3 className="mb-2 font-semibold text-gray-200">Tech stack & hosting</h3>
            <p className="mb-4 text-sm text-gray-400">
              Not sure what to choose? Use the AI recommendation below — we&apos;ll explain everything!
            </p>

            {/* AI recommendation */}
            <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-600/10 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-300">
                <Sparkles className="h-4 w-4" />
                AI Recommendation
              </h4>
              <div className="mb-3">
                <Label className="text-gray-400 text-xs">What type of website is it?</Label>
                <Select value={siteType} onValueChange={(v) => v && setSiteType(v)}>
                  <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Choose type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="portfolio">Portfolio / Personal site</SelectItem>
                    <SelectItem value="ecommerce">E-commerce / Online store</SelectItem>
                    <SelectItem value="blog">Blog / News</SelectItem>
                    <SelectItem value="webapp">Web app / SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={getRecommendation}
                disabled={!siteType}
                size="sm"
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get recommendation
              </Button>
              {recommendation && (
                <div className="mt-3 rounded-lg bg-white/5 p-3">
                  <p className="mb-2 text-xs text-gray-300">{recommendation.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recommendation)
                      .filter(([k]) => k !== "reason")
                      .map(([key, val]) => (
                        <Badge key={key} className="bg-purple-600/30 text-purple-200 text-xs">
                          {key}: {val}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Manual selection */}
            <div className="space-y-3">
              {(["frontend", "backend", "database", "hosting"] as const).map((key) => (
                <div key={key}>
                  <Label className="capitalize text-gray-300">{key}</Label>
                  <Select
                    value={techStack[key]}
                    onValueChange={(v) => v && setTechStack({ ...techStack, [key]: v })}
                  >
                    <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                      <SelectValue placeholder={`Select ${key}...`} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                      {TECH_STACKS[key].map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proceed to payment"}
              </Button>
            </div>
          </div>
        )}

        {/* Price summary */}
        {selectedPackage && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Base package ({selectedPackage.name})</span>
              <span>{format(selectedPackage.price, selectedPackage.priceGBP, selectedPackage.priceEUR)}</span>
            </div>
            {selectedModules.map((id) => {
              const mod = MODULES.find((m) => m.id === id);
              if (!mod) return null;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-gray-400">+ {mod.name}</span>
                  <span>{format(mod.price, mod.priceGBP, mod.priceEUR)}</span>
                </div>
              );
            })}
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-purple-400">
                {format(
                  selectedPackage.price + modulesTotal,
                  selectedPackage.priceGBP + modulesTotalGBP,
                  selectedPackage.priceEUR + modulesTotalEUR
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

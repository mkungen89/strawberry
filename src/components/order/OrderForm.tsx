"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import {
  SiYoutube, SiTwitch, SiX, SiInstagram, SiTiktok, SiFacebook,
  SiDiscord, SiKick, SiSteam, SiPlaystation,
  SiEpicgames, SiBattledotnet,
} from "react-icons/si";
import { FaLinkedin, FaXbox } from "react-icons/fa6";
import { toast } from "sonner";
import { TECH_STACKS, RECOMMENDATIONS, MODULES, SERVICE_PLATFORMS } from "@/lib/services-data";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube:         <SiYoutube className="h-4 w-4 text-[#FF0000]" />,
  "youtube-shorts": <SiYoutube className="h-4 w-4 text-[#FF0000]" />,
  "youtube-gaming": <SiYoutube className="h-4 w-4 text-[#FF0000]" />,
  "youtube-landscape": <SiYoutube className="h-4 w-4 text-[#FF0000]" />,
  twitch:          <SiTwitch className="h-4 w-4 text-[#9146FF]" />,
  twitter:         <SiX className="h-4 w-4 text-white" />,
  instagram:       <SiInstagram className="h-4 w-4 text-[#E1306C]" />,
  "instagram-reels": <SiInstagram className="h-4 w-4 text-[#E1306C]" />,
  tiktok:          <SiTiktok className="h-4 w-4 text-white" />,
  "tiktok-live":   <SiTiktok className="h-4 w-4 text-white" />,
  facebook:        <SiFacebook className="h-4 w-4 text-[#1877F2]" />,
  discord:         <SiDiscord className="h-4 w-4 text-[#5865F2]" />,
  linkedin:        <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />,
  kick:            <SiKick className="h-4 w-4 text-[#53FC18]" />,
  steam:           <SiSteam className="h-4 w-4 text-white" />,
  xbox:            <FaXbox className="h-4 w-4 text-[#107C10]" />,
  playstation:     <SiPlaystation className="h-4 w-4 text-[#003791]" />,
  epic:            <SiEpicgames className="h-4 w-4 text-white" />,
  battlenet:       <SiBattledotnet className="h-4 w-4 text-[#009AE4]" />,
  "twitter-video": <SiX className="h-4 w-4 text-white" />,
  shorts:          <SiYoutube className="h-4 w-4 text-[#FF0000]" />,
};
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
  briefPlaceholder?: string;
}

interface Props {
  service: Service;
}

export default function OrderForm({ service }: Props) {
  const router = useRouter();
  const { format } = useCurrency();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [details, setDetails] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const availablePlatforms = SERVICE_PLATFORMS[service.slug] ?? [];
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

  function togglePlatform(platformId: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  }

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
          platforms: selectedPlatforms,
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

            {/* Platform selection (only shown for relevant services) */}
            {availablePlatforms.length > 0 && (
              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-medium text-gray-200">Which platforms do you need this for?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availablePlatforms.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-600/15"
                            : "border-white/10 bg-white/5 hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center">
                            {PLATFORM_ICONS[platform.id] ?? <span className="text-sm">{platform.icon}</span>}
                          </span>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {platform.sizes.map((s) => (
                            <p key={s.label} className="text-[10px] leading-tight text-gray-500">
                              {s.label}: {s.dimensions}
                            </p>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedPlatforms.length > 0 && (
                  <p className="mt-2 text-xs text-purple-400">
                    {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}

            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={service.briefPlaceholder ?? "Example: Describe your project — style, colors, vibe, what you need. The more detail you give, the better the result."}
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
            {!service.hasTechStack && (
              <label className="mt-4 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-purple-500 shrink-0"
                />
                <span className="text-xs text-gray-400">
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}
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
                disabled={loading || (!service.hasTechStack && !acceptedTerms)}
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
              Not sure what to choose? Use the recommendation tool below — we&apos;ll explain everything!
            </p>

            {/* Recommendation */}
            <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-600/10 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-300">
                <Sparkles className="h-4 w-4" />
                Recommendation
              </h4>
              <div className="mb-3">
                <Label className="text-gray-400 text-xs">What type of website is it?</Label>
                <Select value={siteType} onValueChange={(v) => v && setSiteType(v)}>
                  <SelectTrigger className="mt-1 border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Choose type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="landing-page">Landing page / Campaign</SelectItem>
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

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-purple-500 shrink-0"
              />
              <span className="text-xs text-gray-400">
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
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
                disabled={loading || !acceptedTerms}
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

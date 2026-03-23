"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vexcraft-cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("vexcraft-cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("vexcraft-cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-gray-950/95 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/20">
            <Cookie className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">We use cookies</h3>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  We use essential cookies to keep the site running and optional analytics cookies to 
                  improve your experience. By clicking &quot;Accept all&quot; you consent to the use of all 
                  cookies. Read more in our{" "}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/gdpr" className="text-purple-400 hover:text-purple-300 underline">
                    GDPR page
                  </Link>.
                </p>
              </div>
              <button
                onClick={decline}
                className="shrink-0 rounded-lg p-1 text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={accept}
                className="bg-purple-600 text-white hover:bg-purple-700"
                size="sm"
              >
                Accept all
              </Button>
              <Button
                onClick={decline}
                variant="ghost"
                size="sm"
                className="border border-white/20 text-gray-300 hover:text-white"
              >
                Essential only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

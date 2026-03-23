import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CurrencyProvider } from "@/lib/currency-context";
import CookieConsent from "@/components/layout/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vexcraft — Digital Services for Creators & Businesses",
  description:
    "We build Discord servers, websites, streaming overlays, mobile apps and more. Tailored for you — whether you're a beginner or a pro.",
  openGraph: {
    title: "Vexcraft",
    description: "Professional digital services for creators & businesses",
    url: "https://vexcraft.io",
    siteName: "Vexcraft",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <CurrencyProvider>
          {children}
          <CookieConsent />
          <Toaster richColors position="top-right" />
        </CurrencyProvider>
      </body>
    </html>
  );
}

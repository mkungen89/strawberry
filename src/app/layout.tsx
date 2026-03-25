import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CurrencyProvider } from "@/lib/currency-context";
import CookieConsent from "@/components/layout/CookieConsent";
import LiveChat from "@/components/chat/LiveChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vexcraft — Digital Services for Creators & Businesses",
  description:
    "Vexcraft is a full-service digital studio offering logo design, social media kits, streaming overlays, YouTube branding, Discord setup, SEO, copywriting, growth strategy, community management, websites, mobile apps, and monthly subscription plans.",
  openGraph: {
    title: "Vexcraft — Digital Services for Creators & Businesses",
    description: "Full-service digital studio for creators and businesses. Design, SEO, copywriting, websites, apps and more.",
    url: "https://vexcraft.io",
    siteName: "Vexcraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vexcraft — Digital Services for Creators & Businesses",
    description: "Full-service digital studio for creators and businesses. Design, SEO, copywriting, websites, apps and more.",
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
          <LiveChat />
          <CookieConsent />
          <Toaster richColors position="top-right" />
        </CurrencyProvider>
      </body>
    </html>
  );
}

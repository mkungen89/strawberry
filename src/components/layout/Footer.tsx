import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vexcraft</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Professional digital services for creators & businesses.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/services/discord-server", label: "Discord Server" },
                { href: "/services/website", label: "Website" },
                { href: "/services/streaming-overlay", label: "Streaming Overlay" },
                { href: "/services/mobile-app", label: "Mobile App" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/about", label: "About us" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/login", label: "Log in" },
                { href: "/register", label: "Register" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/orders", label: "Orders" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Vexcraft. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/gdpr" className="text-sm text-gray-500 hover:text-white">
              GDPR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

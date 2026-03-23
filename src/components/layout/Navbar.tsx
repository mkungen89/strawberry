"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrency } from "@/lib/currency-context";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { currency, setCurrency } = useCurrency();

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/plans", label: "Plans" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/team", label: "Team" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-600/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vexcraft</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center rounded-lg border border-white/20 text-xs">
              <button onClick={() => setCurrency("USD")} className={`px-2 py-1 rounded-l-lg ${currency === "USD" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>$</button>
              <button onClick={() => setCurrency("EUR")} className={`px-2 py-1 ${currency === "EUR" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>€</button>
              <button onClick={() => setCurrency("GBP")} className={`px-2 py-1 rounded-r-lg ${currency === "GBP" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>£</button>
            </div>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? ""} />
                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-white/10 text-white">
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/orders"}>
                    My orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-400 focus:text-red-400"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-purple-300 hover:bg-transparent">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-white/10 pb-4 pt-2 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-2 py-3 text-sm text-gray-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center rounded-lg border border-white/20 text-xs w-fit">
                <button onClick={() => setCurrency("USD")} className={`px-2 py-1 rounded-l-lg ${currency === "USD" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>$</button>
                <button onClick={() => setCurrency("EUR")} className={`px-2 py-1 ${currency === "EUR" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>€</button>
                <button onClick={() => setCurrency("GBP")} className={`px-2 py-1 rounded-r-lg ${currency === "GBP" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>£</button>
              </div>
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-400">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400"
                    onClick={() => signOut()}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full text-gray-400">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

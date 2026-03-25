"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ShoppingBag,
  Zap,
  ChevronRight,
  Mail,
  ShieldCheck,
  MessageCircle,
  BarChart3,
  Share2,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/team", icon: Users, label: "Team" },
  { href: "/admin", icon: ShoppingBag, label: "Orders", exact: true },
  { href: "/admin/emails", icon: Mail, label: "Emails" },
  { href: "/admin/qa", icon: ShieldCheck, label: "QA Review" },
  { href: "/admin/chat", icon: MessageCircle, label: "Live Chat" },
  { href: "/admin/social", icon: Share2, label: "Social" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/economics", icon: TrendingUp, label: "Economics" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-white/[0.06] bg-black/95 backdrop-blur hidden lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">Vexcraft</p>
            <p className="text-[10px] text-purple-400 font-medium uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/20"
                    : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-purple-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                {label}
                {active && <ChevronRight className="ml-auto h-3 w-3 text-purple-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-5 py-4">
          <p className="text-[11px] text-gray-700">⚡ Vexcraft Internal</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 bg-black/95 backdrop-blur sticky top-0 z-20">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold">Vexcraft Admin</span>
        <nav className="flex gap-1 ml-auto">
          {NAV.map(({ href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  active ? "bg-purple-600/20 text-purple-400" : "text-gray-600 hover:text-gray-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import Link from "next/link";
import { ChevronLeft, Kanban } from "lucide-react";

export const metadata = {
  title: "Kanban Board — Vexcraft Admin",
  description: "Sprint board for the Vexcraft team",
};

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Page header */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center gap-3">
          <Link
            href="/admin"
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Kanban className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Kanban Board</h1>
              <p className="text-[10px] text-white/30">Current sprint · Vexcraft team</p>
            </div>
          </div>

          {/* Sprint badge */}
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400">
              Sprint active
            </span>
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Board content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 h-[calc(100vh-57px)] flex flex-col">
        <KanbanBoard />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task, COLUMNS, KanbanStatus } from "./types";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { toast } from "sonner";
import { Loader2, RefreshCw, Plus, Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";

type ViewMode = "board" | "list";
type ActiveTab = "board" | "priority" | "team" | "roadmap" | "mine";

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "board", label: "Board" },
  { id: "priority", label: "Priority" },
  { id: "team", label: "Team items" },
  { id: "roadmap", label: "Roadmap" },
  { id: "mine", label: "My items" },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("board");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks?include=all", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setTasks(data);
    } catch {
      if (!silent) toast.error("Failed to load tasks");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // Poll every 30s
    pollRef.current = setInterval(() => fetchTasks(true), 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchTasks]);

  async function seedTasks() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (!res.ok) throw new Error();
      await fetchTasks();
      toast.success("Sprint tasks seeded!");
    } catch {
      toast.error("Seed failed");
    } finally {
      setSeeding(false);
    }
  }

  function getTasksByColumn(columnId: string) {
    return tasks.filter((t) => t.status === columnId);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target status
    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const targetStatus = overColumn?.id ?? overTask?.status;

    // Block visual preview into QA-gated columns
    if (targetStatus === "REVIEW" || targetStatus === "DONE") return;

    if (overColumn && activeTask.status !== overId) {
      setTasks((prev) =>
        prev.map((t) => t.id === activeId ? { ...t, status: overId } : t)
      );
    }

    if (overTask && overTask.status !== activeTask.status) {
      setTasks((prev) =>
        prev.map((t) => t.id === activeId ? { ...t, status: overTask.status } : t)
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const movedTask = tasks.find((t) => t.id === activeId);
    if (!movedTask) return;

    // Determine new status
    let newStatus = movedTask.status;
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus !== movedTask.status) {
      // Block QA-gated transitions — must go through proper endpoints
      if (newStatus === "DONE") {
        toast.error("Use the Approve button in QA Review to move to Done");
        fetchTasks();
        return;
      }
      if (newStatus === "REVIEW") {
        toast.error("Use 'Submit for QA Review' button to submit for review");
        fetchTasks();
        return;
      }

      // Optimistic update already applied in dragOver, now persist
      try {
        await fetch(`/api/admin/tasks/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch {
        toast.error("Failed to move task");
        fetchTasks(); // revert
      }
    } else {
      // Reorder within column
      const columnTasks = tasks.filter((t) => t.status === movedTask.status);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      if (activeIndex !== overIndex) {
        const reordered = arrayMove(columnTasks, activeIndex, overIndex);
        setTasks((prev) => {
          const others = prev.filter((t) => t.status !== movedTask.status);
          return [...others, ...reordered];
        });
      }
    }
  }

  function handleTaskUpdate(updatedTask: Task) {
    setTasks((prev) => prev.map((t) => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.assigneeName?.toLowerCase().includes(q) ||
        t.project?.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top tabs */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "board" ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/50"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/50"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchTasks()}
            className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Seed button (only if no tasks) */}
          {tasks.length === 0 && (
            <button
              onClick={seedTasks}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50"
            >
              {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Seed sprint
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, assignees..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/70 placeholder-white/20 outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.04] border border-white/[0.06] transition-all">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>
        <span className="text-[11px] text-white/20 ml-auto">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          {tasks.length === 0 && (
            <button onClick={seedTasks} disabled={seeding} className="ml-2 text-purple-400 hover:underline">
              {seeding ? "Seeding..." : "Seed sprint data →"}
            </button>
          )}
        </span>
      </div>

      {/* Board / List view */}
      {viewMode === "board" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={filteredTasks.filter((t) => t.status === col.id)}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // List view
        <div className="flex-1 space-y-2">
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-white/20 text-sm">No tasks found</div>
          )}
          {filteredTasks.map((task) => {
            const col = COLUMNS.find((c) => c.id === task.status);
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04] cursor-pointer transition-all group"
              >
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${col?.dotColor || "bg-gray-500"}`} />
                <span className="text-sm text-white/80 font-medium flex-1 truncate">{task.title}</span>
                <span className="text-[11px] text-white/30 hidden sm:block">{task.assigneeName || "—"}</span>
                <div className="w-20 hidden md:block">
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
                <span className={`text-[11px] font-medium hidden sm:block ${col?.color || "text-white/30"}`}>
                  {col?.label || task.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}

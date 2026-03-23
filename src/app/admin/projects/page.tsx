"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Plus, FolderKanban, Clock, AlertTriangle, CheckCircle2,
  Circle, ArrowRight, Filter, ChevronDown, X, Send,
} from "lucide-react";

interface TaskUpdate {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  dueDate: string | null;
  projectId: string | null;
  assigneeName: string | null;
  project: { id: string; title: string; color: string } | null;
  updates: TaskUpdate[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string;
  color: string;
  tasks: { id: string; status: string; progress: number }[];
}

const STATUSES = ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"];

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; border: string; header: string }> = {
  BACKLOG: {
    label: "Backlog",
    icon: <Circle className="h-3.5 w-3.5 text-gray-500" />,
    border: "border-gray-500/20",
    header: "bg-gray-500/10",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: <ArrowRight className="h-3.5 w-3.5 text-yellow-400" />,
    border: "border-yellow-500/20",
    header: "bg-yellow-500/10",
  },
  REVIEW: {
    label: "Review",
    icon: <Clock className="h-3.5 w-3.5 text-blue-400" />,
    border: "border-blue-500/20",
    header: "bg-blue-500/10",
  },
  DONE: {
    label: "Done",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
    border: "border-green-500/20",
    header: "bg-green-500/10",
  },
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-gray-500",
  NORMAL: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

function TaskCard({ task, onUpdate }: { task: Task; onUpdate: (id: string, data: Partial<Task>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  async function moveStatus(newStatus: string) {
    await fetch("/api/admin/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: newStatus }),
    });
    onUpdate(task.id, { status: newStatus });
  }

  async function postComment() {
    if (!comment.trim()) return;
    setPosting(true);
    const res = await fetch("/api/admin/tasks/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, content: comment, authorName: "Admin" }),
    });
    if (res.ok) {
      const newUpdate = await res.json();
      onUpdate(task.id, { updates: [newUpdate, ...task.updates] });
      setComment("");
    }
    setPosting(false);
  }

  return (
    <div className={`rounded-xl border bg-white/[0.02] transition-all hover:bg-white/[0.04] ${overdue ? "border-red-500/20" : "border-white/[0.06]"}`}>
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-2 mb-2">
          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || "bg-gray-500"}`} />
          <p className="text-sm font-medium text-white leading-snug flex-1">{task.title}</p>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-600 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>

        {task.assigneeName && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/20 text-[9px] font-bold text-purple-300">
              {task.assigneeName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] text-gray-500">{task.assigneeName}</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-1 rounded-full transition-all"
              style={{
                width: `${task.progress}%`,
                backgroundColor: task.progress === 100 ? "#22c55e" : task.progress >= 50 ? "#a855f6" : "#eab308"
              }}
            />
          </div>
          <span className="text-[10px] text-gray-600 tabular-nums">{task.progress}%</span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${overdue ? "text-red-400" : "text-gray-600"}`}>
            {overdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
            {overdue ? "Overdue · " : ""}
            {new Date(task.dueDate).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/[0.04] px-3 pb-3 pt-2 space-y-3">
          {task.description && (
            <p className="text-xs text-gray-500 leading-relaxed">{task.description}</p>
          )}

          {/* Status buttons */}
          <div className="flex flex-wrap gap-1">
            {STATUSES.filter(s => s !== task.status).map(s => (
              <button
                key={s}
                onClick={() => moveStatus(s)}
                className="text-[10px] border border-white/[0.06] rounded px-2 py-1 text-gray-500 hover:text-white hover:border-purple-500/30 transition-all"
              >
                → {STATUS_META[s].label}
              </button>
            ))}
          </div>

          {/* Updates */}
          {task.updates.length > 0 && (
            <div className="space-y-1.5">
              {task.updates.map(u => (
                <div key={u.id} className="rounded-lg bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-purple-400">{u.authorName}</span>
                    <span className="text-[10px] text-gray-700">
                      {new Date(u.createdAt).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{u.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment box */}
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && postComment()}
              placeholder="Add comment..."
              className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-700 outline-none focus:border-purple-500/40"
            />
            <button
              onClick={postComment}
              disabled={posting || !comment.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all disabled:opacity-30"
            >
              {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "DONE">("ALL");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assigneeName: "", progress: 0, dueDate: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    const [pRes, tRes] = await Promise.all([
      fetch("/api/admin/projects"),
      fetch("/api/admin/tasks"),
    ]);
    if (pRes.ok) setProjects(await pRes.json());
    if (tRes.ok) setTasks(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [fetchData]);

  function updateTask(id: string, data: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }

  async function createTask() {
    if (!newTask.title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newTask,
        projectId: selectedProject !== "ALL" ? selectedProject : undefined,
        status: "BACKLOG",
        priority: "NORMAL",
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks(prev => [t, ...prev]);
      setNewTask({ title: "", assigneeName: "", progress: 0, dueDate: "" });
      setShowNewTask(false);
    }
    setCreating(false);
  }

  let filtered = tasks;
  if (selectedProject !== "ALL") filtered = filtered.filter(t => t.projectId === selectedProject);
  if (filter === "IN_PROGRESS") filtered = filtered.filter(t => t.status === "IN_PROGRESS");
  if (filter === "DONE") filtered = filtered.filter(t => t.status === "DONE");

  const byStatus: Record<string, Task[]> = {};
  STATUSES.forEach(s => { byStatus[s] = filtered.filter(t => t.status === s); });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* New task form */}
      {showNewTask && (
        <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-600/[0.05] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Create Task</h3>
            <button onClick={() => setShowNewTask(false)}>
              <X className="h-4 w-4 text-gray-500 hover:text-white" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              placeholder="Task title *"
              className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40 sm:col-span-2"
            />
            <input
              value={newTask.assigneeName}
              onChange={e => setNewTask(p => ({ ...p, assigneeName: e.target.value }))}
              placeholder="Assignee name"
              className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40"
            />
            <input
              type="datetime-local"
              value={newTask.dueDate}
              onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
              className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs text-gray-500">Progress: {newTask.progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={newTask.progress}
              onChange={e => setNewTask(p => ({ ...p, progress: +e.target.value }))}
              className="flex-1 accent-purple-500"
            />
            <button
              onClick={createTask}
              disabled={creating || !newTask.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40 transition-all"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-gray-600 shrink-0" />

        {/* Project filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedProject("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
              selectedProject === "ALL"
                ? "border-purple-500/30 bg-purple-600/10 text-purple-300"
                : "border-white/[0.06] text-gray-500 hover:text-white bg-white/[0.02]"
            }`}
          >
            All Projects
          </button>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5 ${
                selectedProject === p.id
                  ? "border-white/20 bg-white/[0.06] text-white"
                  : "border-white/[0.06] text-gray-500 hover:text-white bg-white/[0.02]"
              }`}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.title}
              <span className="text-gray-600">({p.tasks.length})</span>
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

        {/* Status filter */}
        <div className="flex gap-1.5">
          {(["ALL", "IN_PROGRESS", "DONE"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                filter === f
                  ? "border-pink-500/30 bg-pink-600/10 text-pink-300"
                  : "border-white/[0.06] text-gray-500 hover:text-white bg-white/[0.02]"
              }`}
            >
              {f === "ALL" ? "All" : f === "IN_PROGRESS" ? "In Progress" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid gap-4 lg:grid-cols-4">
        {STATUSES.map(status => {
          const meta = STATUS_META[status];
          const col = byStatus[status];
          return (
            <div key={status} className={`rounded-2xl border ${meta.border}`}>
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${meta.header}`}>
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <span className="text-sm font-semibold text-white">{meta.label}</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-bold text-gray-400">
                  {col.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-2 min-h-24">
                {col.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-gray-700">No tasks</p>
                  </div>
                ) : (
                  col.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects overview */}
      {projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-purple-400" />
            Projects Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map(p => {
              const total = p.tasks.length;
              const done = p.tasks.filter(t => t.status === "DONE").length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p.id === selectedProject ? "ALL" : p.id)}
                  className={`text-left rounded-2xl border p-4 transition-all hover:border-opacity-50 ${
                    selectedProject === p.id ? "border-opacity-80" : "border-white/[0.06]"
                  }`}
                  style={{ borderColor: selectedProject === p.id ? p.color + "60" : undefined }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: p.color }}>{pct}%</span>
                  </div>
                  <p className="text-xs text-gray-600">{done}/{total} tasks done</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

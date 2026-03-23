"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, Clock, AlertTriangle, Loader2, RefreshCw,
  TrendingUp, Users, Zap, Eye, Flame,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  progress: number;
  dueDate: string | null;
  priority: string;
  assigneeName: string | null;
  project: { title: string; color: string } | null;
  updates: { id: string; content: string; authorName: string; createdAt: string }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  tasks: {
    id: string;
    title: string;
    status: string;
    progress: number;
    dueDate: string | null;
    priority: string;
    project: { title: string; color: string } | null;
  }[];
}

const STATUS_COLOR: Record<string, string> = {
  BACKLOG: "bg-gray-500/20 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  REVIEW: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  DONE: "bg-green-500/20 text-green-300 border-green-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  BACKLOG: "Not Started",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

function ProgressBar({ value, color = "#9333ea" }: { value: number; color?: string }) {
  const getColor = () => {
    if (value === 100) return "#22c55e";
    if (value >= 80) return "#a855f6";
    if (value >= 50) return "#eab308";
    if (value > 0) return "#f97316";
    return "#6b7280";
  };
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
      <div
        className="h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color || getColor() }}
      />
    </div>
  );
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

function formatDue(dueDate: string | null) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) + " " +
    d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

function MemberCard({ member }: { member: TeamMember }) {
  const activeTasks = member.tasks;
  const maxProgress = activeTasks.length > 0
    ? Math.max(...activeTasks.map(t => t.progress))
    : 0;
  const overallProgress = activeTasks.length > 0
    ? Math.round(activeTasks.reduce((s, t) => s + t.progress, 0) / activeTasks.length)
    : 0;
  const overdue = activeTasks.some(t => isOverdue(t.dueDate, t.status));

  const initials = member.name.slice(0, 2).toUpperCase();
  const colors = ["from-purple-600 to-pink-600", "from-blue-600 to-cyan-600", "from-orange-600 to-red-600", "from-green-600 to-emerald-600", "from-yellow-600 to-orange-600"];
  const color = colors[member.name.charCodeAt(0) % colors.length];

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:border-purple-500/30 ${overdue ? "border-red-500/20 bg-red-500/[0.03]" : "border-white/[0.06] bg-white/[0.02]"}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-bold text-white shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">{member.name}</h3>
            {overdue && <span className="text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">OVERDUE</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-white">{overallProgress}%</p>
          <p className="text-[10px] text-gray-600">overall</p>
        </div>
      </div>

      <ProgressBar value={overallProgress} />

      {activeTasks.length === 0 ? (
        <p className="mt-3 text-xs text-gray-600">No active tasks</p>
      ) : (
        <div className="mt-4 space-y-3">
          {activeTasks.map(task => {
            const od = isOverdue(task.dueDate, task.status);
            return (
              <div key={task.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-white leading-snug">{task.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${STATUS_COLOR[task.status] || STATUS_COLOR.BACKLOG}`}>
                    {STATUS_LABEL[task.status] || task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">{task.progress}%</span>
                  <div className="flex-1">
                    <ProgressBar value={task.progress} />
                  </div>
                </div>
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-[10px] ${od ? "text-red-400" : "text-gray-600"}`}>
                    <Clock className="h-2.5 w-2.5" />
                    {od ? "OVERDUE · " : ""}{formatDue(task.dueDate)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    const [tasksRes, membersRes] = await Promise.all([
      fetch("/api/admin/tasks"),
      fetch("/api/admin/team"),
    ]);
    if (tasksRes.ok) setTasks(await tasksRes.json());
    if (membersRes.ok) setMembers(await membersRes.json());
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleSeed() {
    setSeeding(true);
    await fetch("/api/admin/seed", { method: "POST" });
    await fetchData();
    setSeeding(false);
  }

  const activeTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const inReview = tasks.filter(t => t.status === "REVIEW");
  const done = tasks.filter(t => t.status === "DONE");
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.status));

  const recentUpdates = tasks
    .flatMap(t => t.updates.map(u => ({ ...u, taskTitle: t.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live status · updated {lastRefresh.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          {tasks.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-600/20 transition-all disabled:opacity-50"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
              Seed Priority Tasks
            </button>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Active Tasks",
            value: activeTasks.length,
            icon: <Zap className="h-5 w-5 text-yellow-400" />,
            bg: "from-yellow-500/10 to-yellow-600/5",
            sub: "in progress",
          },
          {
            label: "In Review",
            value: inReview.length,
            icon: <Eye className="h-5 w-5 text-blue-400" />,
            bg: "from-blue-500/10 to-blue-600/5",
            sub: "awaiting review",
          },
          {
            label: "Completed",
            value: done.length,
            icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
            bg: "from-green-500/10 to-green-600/5",
            sub: "all time",
          },
          {
            label: "Overdue",
            value: overdueTasks.length,
            icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
            bg: overdueTasks.length > 0 ? "from-red-500/15 to-red-600/5" : "from-gray-500/10 to-gray-600/5",
            sub: overdueTasks.length > 0 ? "needs attention" : "all on track",
          },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${stat.bg} p-5`}>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team cards — 2 col */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-purple-400" />
            <h2 className="font-semibold text-white">Team Status</h2>
            <span className="text-xs text-gray-600 ml-1">({members.length} members)</span>
          </div>
          {members.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-gray-700" />
              <p className="text-gray-500 text-sm">No team members yet.</p>
              <button onClick={handleSeed} className="mt-3 text-xs text-purple-400 hover:text-purple-300">
                Seed demo data →
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {members.map(m => <MemberCard key={m.id} member={m} />)}
            </div>
          )}
        </div>

        {/* Activity log — 1 col */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-pink-400" />
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {recentUpdates.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 text-sm">No activity yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentUpdates.map(u => (
                  <div key={u.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-purple-400">{u.authorName}</span>
                      <span className="text-[10px] text-gray-700">
                        {new Date(u.createdAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{u.content}</p>
                    <p className="text-[10px] text-gray-700 mt-0.5 truncate">{u.taskTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

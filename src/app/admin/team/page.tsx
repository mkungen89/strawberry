"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Users, Plus, Clock, CheckCircle2, AlertTriangle,
  Circle, ArrowRight, X,
} from "lucide-react";

interface MemberTask {
  id: string;
  title: string;
  status: string;
  progress: number;
  dueDate: string | null;
  priority: string;
  project: { title: string; color: string } | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  tasks: MemberTask[];
}

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  BACKLOG: { label: "Not Started", icon: <Circle className="h-3 w-3" />, color: "text-gray-400" },
  READY: { label: "Ready", icon: <ArrowRight className="h-3 w-3" />, color: "text-blue-400" },
  IN_PROGRESS: { label: "In Progress", icon: <ArrowRight className="h-3 w-3" />, color: "text-yellow-400" },
  REVIEW: { label: "QA Review", icon: <Clock className="h-3 w-3" />, color: "text-orange-400" },
  DONE: { label: "Done", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-green-400" },
};

// Role definitions for task routing
export const TEAM_ROLES = {
  DEVELOPER: {
    label: "Developer",
    description: "Handles code tasks (development, IN_PROGRESS)",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    categories: ["development"],
    taskStatuses: ["BACKLOG", "READY", "IN_PROGRESS"],
  },
  CODE_ANALYST: {
    label: "Code Analyst / QA",
    description: "Reviews code in REVIEW — approves or rejects",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    categories: ["review"],
    taskStatuses: ["REVIEW"],
  },
  DESIGNER: {
    label: "Designer",
    description: "Handles design tasks — graphics, UI, branding",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    categories: ["design"],
    taskStatuses: ["BACKLOG", "READY", "IN_PROGRESS"],
  },
  MANAGER: {
    label: "Manager",
    description: "Assigns tasks, manages team, customer comms",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    categories: ["management"],
    taskStatuses: ["BACKLOG", "READY", "DONE"],
  },
} as const;

const AVATAR_GRADIENTS = [
  "from-purple-600 to-pink-600",
  "from-blue-600 to-cyan-600",
  "from-orange-500 to-red-600",
  "from-green-500 to-emerald-600",
  "from-yellow-500 to-orange-600",
  "from-pink-600 to-rose-600",
];

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

function MemberDetailCard({ member }: { member: TeamMember }) {
  const gradient = AVATAR_GRADIENTS[member.name.charCodeAt(0) % AVATAR_GRADIENTS.length];
  const activeTasks = member.tasks;
  const overallProgress = activeTasks.length > 0
    ? Math.round(activeTasks.reduce((s, t) => s + t.progress, 0) / activeTasks.length)
    : 100;
  const overdueCount = activeTasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const doneCount = activeTasks.filter(t => t.status === "DONE").length;
  const inProgressCount = activeTasks.filter(t => t.status === "IN_PROGRESS").length;
  const reviewCount = activeTasks.filter(t => t.status === "REVIEW").length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shrink-0`}>
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{overallProgress}%</p>
            <p className="text-xs text-gray-600">avg progress</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4 h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Mini stats */}
        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Active", value: inProgressCount, color: "text-yellow-400" },
            { label: "Review", value: reviewCount, color: "text-blue-400" },
            { label: "Done", value: doneCount, color: "text-green-400" },
            { label: "Overdue", value: overdueCount, color: overdueCount > 0 ? "text-red-400" : "text-gray-600" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks list */}
      <div className="p-4 space-y-2">
        {activeTasks.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500/40" />
            <p className="text-sm text-gray-600">No active tasks — all clear!</p>
          </div>
        ) : (
          activeTasks.map(task => {
            const overdue = isOverdue(task.dueDate, task.status);
            const meta = STATUS_META[task.status] || STATUS_META.BACKLOG;
            return (
              <div
                key={task.id}
                className={`rounded-xl border p-3 ${overdue ? "border-red-500/20 bg-red-500/[0.03]" : "border-white/[0.04] bg-white/[0.02]"}`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={`mt-0.5 ${meta.color}`}>{meta.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.project && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.project.color }} />
                        <span className="text-[10px] text-gray-600">{task.project.title}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: task.progress === 100 ? "#22c55e" : task.progress >= 70 ? "#a855f6" : "#eab308",
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-gray-500">{task.progress}%</span>
                </div>

                {task.dueDate && (
                  <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${overdue ? "text-red-400" : "text-gray-600"}`}>
                    {overdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                    {overdue ? "OVERDUE · " : "Due: "}
                    {new Date(task.dueDate).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/team");
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [fetchData]);

  async function addMember() {
    if (!newMember.name.trim() || !newMember.role.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });
    if (res.ok) {
      const m = await res.json();
      setMembers(prev => [...prev, m]);
      setNewMember({ name: "", role: "" });
      setShowAdd(false);
    }
    setCreating(false);
  }

  const totalTasks = members.flatMap(m => m.tasks).length;
  const overdueTasks = members.flatMap(m => m.tasks).filter(t => isOverdue(t.dueDate, t.status)).length;

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
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            Team
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {members.length} members · {totalTasks} active tasks
            {overdueTasks > 0 && <span className="text-red-400 ml-2">· {overdueTasks} overdue</span>}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Add member form */}
      {showAdd && (
        <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-600/[0.05] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Add Team Member</h3>
            <button onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4 text-gray-500 hover:text-white" />
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              value={newMember.name}
              onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
              placeholder="Name *"
              className="flex-1 min-w-32 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40"
            />
            <input
              value={newMember.role}
              onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}
              placeholder="Role *"
              className="flex-1 min-w-32 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/40"
            />
            <button
              onClick={addMember}
              disabled={creating || !newMember.name.trim() || !newMember.role.trim()}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40 transition-all"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Role Definitions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Roles</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(TEAM_ROLES).map(([key, role]) => (
            <div key={key} className={`rounded-xl border p-4 ${role.bg}`}>
              <p className={`text-sm font-semibold ${role.color}`}>{role.label}</p>
              <p className="text-xs text-gray-500 mt-1">{role.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {role.taskStatuses.map(s => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-500">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members grid */}
      {members.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-gray-700" />
          <p className="text-gray-500">No team members yet.</p>
          <p className="text-gray-700 text-sm mt-1">
            Go to <span className="text-purple-400">Dashboard</span> and click &quot;Seed Priority Tasks&quot; to add demo data.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {members.map(m => <MemberDetailCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
}

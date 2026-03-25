"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, Clock, Bug, ChevronDown, ChevronUp,
  Plus, X, RefreshCw, ShieldCheck, User, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskUpdate {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  updateType: string;
  bugsFound: string[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  dueDate: string | null;
  assigneeName: string | null;
  qaStatus: string | null;
  submittedForReviewAt: string | null;
  reviewedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  project: { id: string; title: string; color: string } | null;
  assignee: { id: string; name: string; role: string } | null;
  updates: TaskUpdate[];
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return diffDays === 1 ? "yesterday" : `${diffDays}d ago`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── Approve Dialog ─────────────────────────────────────────────────────────────

function ApproveDialog({ open, taskTitle, onClose, onConfirm }: {
  open: boolean; taskTitle: string; onClose: () => void; onConfirm: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    setLoading(true);
    try { await onConfirm(note); setNote(""); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-gray-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <h2 className="font-semibold text-white">Approve Task</h2>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <p className="text-sm text-white truncate">{taskTitle}</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">Approver note <span className="text-gray-600">(optional)</span></Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Great work! All checks passed..."
            rows={3} className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-gray-600 resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => !loading && onClose()}
            className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-gray-400 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600/20 border border-green-500/30 px-4 py-2 text-sm text-green-300 hover:bg-green-600/30 transition-all disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject Dialog ──────────────────────────────────────────────────────────────

function RejectDialog({ open, taskTitle, onClose, onConfirm }: {
  open: boolean; taskTitle: string; onClose: () => void; onConfirm: (bugs: string[], notes: string) => Promise<void>;
}) {
  const [bugs, setBugs] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bugError, setBugError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    const valid = bugs.map((b) => b.trim()).filter(Boolean);
    if (valid.length === 0) { setBugError("At least one bug is required."); return; }
    setLoading(true);
    try { await onConfirm(valid, notes); setBugs([""]); setNotes(""); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-gray-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-400" />
          <h2 className="font-semibold text-white">Reject Task</h2>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <p className="text-sm text-white truncate">{taskTitle}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Bugs found <span className="text-red-400">*</span></Label>
            <button onClick={() => setBugs([...bugs, ""])}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
              <Plus className="h-3 w-3" /> Add bug
            </button>
          </div>
          <div className="space-y-2">
            {bugs.map((bug, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                  {i + 1}
                </div>
                <Input value={bug} onChange={(e) => { setBugError(""); setBugs(bugs.map((b, j) => j === i ? e.target.value : b)); }}
                  placeholder={`Bug #${i + 1}`}
                  className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-gray-600" />
                {bugs.length > 1 && (
                  <button onClick={() => setBugs(bugs.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {bugError && <p className="text-xs text-red-400">{bugError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">Notes <span className="text-gray-600">(optional)</span></Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context or suggestions..."
            rows={3} className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-gray-600 resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => !loading && onClose()}
            className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-gray-400 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-600/30 transition-all disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────────────────────────

function TaskCard({ task, onApproved, onRejected }: {
  task: Task; onApproved: (id: string) => void; onRejected: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<TaskUpdate[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const devNote = [...task.updates].reverse().find((u) => u.updateType === "QA_SUBMITTED");
  const isUrgent = task.priority === "URGENT" || task.priority === "HIGH";

  async function handleToggleExpand() {
    if (!expanded && history === null) {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/admin/tasks/${task.id}/updates`);
        if (res.ok) setHistory(await res.json());
        else toast.error("Failed to load history");
      } catch { toast.error("Failed to load history"); }
      finally { setHistoryLoading(false); }
    }
    setExpanded((v) => !v);
  }

  async function handleApprove(note: string) {
    const res = await fetch(`/api/admin/tasks/${task.id}/approve`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approverNote: note || undefined }),
    });
    if (!res.ok) { toast.error("Failed to approve"); throw new Error(); }
    toast.success(`Approved: ${task.title}`);
    setApproveOpen(false);
    onApproved(task.id);
  }

  async function handleReject(bugs: string[], notes: string) {
    const res = await fetch(`/api/admin/tasks/${task.id}/reject`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bugsFound: bugs, notes: notes || undefined }),
    });
    if (!res.ok) { toast.error("Failed to reject"); throw new Error(); }
    toast.error(`Rejected: ${task.title}`, { description: `${bugs.length} bug${bugs.length !== 1 ? "s" : ""} reported` });
    setRejectOpen(false);
    onRejected(task.id);
  }

  const displayUpdates = history ?? task.updates;

  return (
    <>
      <div className={`rounded-2xl border transition-colors ${
        isUrgent ? "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/30" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"
      }`}>
        <div className="p-5">
          {/* Title row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm leading-snug mb-1 truncate">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
              )}
            </div>
            <Badge className={`shrink-0 text-xs ${
              isUrgent ? "bg-red-600/20 text-red-400 border-red-600/30" : "bg-white/[0.06] text-gray-400 border-white/[0.06]"
            }`}>
              {task.priority}
            </Badge>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {task.project && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{ color: task.project.color, borderColor: `${task.project.color}30`, backgroundColor: `${task.project.color}15` }}>
                {task.project.title}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <User className="h-3 w-3" /> {task.assignee.name}
                <span className="text-gray-700">·</span>
                <span className="text-gray-600">{task.assignee.role}</span>
              </span>
            )}
            {task.submittedForReviewAt && (
              <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
                <Clock className="h-3 w-3" /> Submitted {formatRelative(task.submittedForReviewAt)}
                <span className="text-gray-700">·</span>
                {formatDateTime(task.submittedForReviewAt)}
              </span>
            )}
          </div>

          {/* Developer note */}
          {devNote && (
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-3 py-2.5 mb-3">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">Developer note</p>
              <p className="text-xs text-gray-300 leading-relaxed">{devNote.content}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
            <button onClick={() => setApproveOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-green-600/15 hover:bg-green-600/25 border border-green-500/25 px-3 py-1.5 text-xs font-medium text-green-300 transition-all">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </button>
            <button onClick={() => setRejectOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 px-3 py-1.5 text-xs font-medium text-red-300 transition-all">
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
            <button onClick={handleToggleExpand} disabled={historyLoading}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/[0.06] px-3 py-1.5 text-xs text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all">
              {historyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              History
            </button>
          </div>

          {/* History */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
              {displayUpdates.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-2">No updates yet.</p>
              ) : displayUpdates.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-400 mt-0.5">
                    {u.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-purple-400">{u.authorName}</span>
                      {u.updateType !== "COMMENT" && (
                        <span className="text-[9px] font-medium text-gray-600 bg-white/[0.04] border border-white/[0.04] rounded px-1.5 py-0.5">
                          {u.updateType}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-700 ml-auto">{formatDateTime(u.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{u.content}</p>
                    {u.bugsFound?.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {u.bugsFound.map((bug, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                            <Bug className="h-3 w-3 mt-0.5 shrink-0" /> {bug}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ApproveDialog open={approveOpen} taskTitle={task.title} onClose={() => setApproveOpen(false)} onConfirm={handleApprove} />
      <RejectDialog open={rejectOpen} taskTitle={task.title} onClose={() => setRejectOpen(false)} onConfirm={handleReject} />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function QAReviewPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchTasks = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks?status=REVIEW");
      if (!res.ok) throw new Error();
      setTasks(await res.json());
      setLastRefresh(new Date());
    } catch {
      if (!silent) toast.error("Failed to load review queue");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => fetchTasks(true), 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const pending = tasks.filter((t) => t.qaStatus !== "APPROVED" && t.qaStatus !== "REJECTED");

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">QA Review</h1>
              {!loading && pending.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-purple-600/25 border border-purple-500/30 px-2 text-xs font-bold text-purple-300">
                  {pending.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Code review queue · updated {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
          <button
            onClick={() => fetchTasks(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "In review", value: tasks.length, color: "purple" },
            { label: "Pending review", value: pending.length, color: "amber" },
            { label: "Urgent/High", value: tasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length, color: "red" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] h-32 animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500/60" />
            </div>
            <h3 className="text-base font-semibold text-gray-300 mb-1">Queue is clear</h3>
            <p className="text-sm text-gray-600 max-w-xs">No tasks are waiting for QA review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onApproved={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                onRejected={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Task, PRIORITY_CONFIG, COLUMNS } from "./types";
import {
  X,
  Calendar,
  User,
  ChevronDown,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldCheck,
  ShieldX,
  Bug,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-yellow-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-violet-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// QA Checklist items
const QA_CHECKLIST = [
  { id: "logic", label: "Logic errors" },
  { id: "security", label: "Security issues (SQL injection, XSS, auth bypass)" },
  { id: "performance", label: "Performance problems (N+1 queries, slow loops)" },
  { id: "style", label: "Code style / standards compliance" },
  { id: "tests", label: "Test coverage adequate" },
  { id: "types", label: "TypeScript types correct (no `any`)" },
  { id: "accessibility", label: "Accessibility (if UI)" },
];

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [localTask, setLocalTask] = useState<Task>(task);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // QA State
  const [qaChecked, setQaChecked] = useState<Record<string, boolean>>({});
  const [bugList, setBugList] = useState<string[]>([]);
  const [newBug, setNewBug] = useState("");
  const [qaNote, setQaNote] = useState("");
  const [qaSubmitting, setQaSubmitting] = useState(false);

  const isInReview = localTask.status === "REVIEW";

  async function submitForReview() {
    setQaSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${localTask.id}/submit-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerNote: comment }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setLocalTask(updated);
      onUpdate(updated);
      setComment("");
      toast.success("Task submitted for QA review 🔍");
    } catch {
      toast.error("Failed to submit for review");
    } finally {
      setQaSubmitting(false);
    }
  }

  async function approveTask() {
    setQaSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${localTask.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverNote: qaNote }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setLocalTask(updated);
      onUpdate(updated);
      toast.success("✅ Task approved and moved to Done!");
      onClose();
    } catch {
      toast.error("Failed to approve task");
    } finally {
      setQaSubmitting(false);
    }
  }

  async function rejectTask() {
    if (bugList.length === 0) {
      toast.error("Add at least one bug before rejecting");
      return;
    }
    setQaSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${localTask.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bugsFound: bugList, notes: qaNote }),
      });
      if (!res.ok) throw new Error("Failed");
      const { task: updated } = await res.json();
      setLocalTask(updated);
      onUpdate(updated);
      toast.error(`🐛 Task rejected — ${bugList.length} bug(s) found`);
      setBugList([]);
      setQaNote("");
    } catch {
      toast.error("Failed to reject task");
    } finally {
      setQaSubmitting(false);
    }
  }

  const assigneeName = localTask.assigneeName || localTask.assignee?.name || "Unassigned";
  const gradientColor = getAvatarColor(assigneeName);
  const priority = PRIORITY_CONFIG[localTask.priority] || PRIORITY_CONFIG.NORMAL;
  const column = COLUMNS.find((c) => c.id === localTask.status);

  async function updateField(field: string, value: string | number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tasks/${localTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setLocalTask(updated);
      onUpdate(updated);
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function postComment() {
    if (!comment.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/admin/tasks/${localTask.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment.trim(), authorName: "Mikael" }),
      });
      if (!res.ok) throw new Error();
      const update = await res.json();
      setLocalTask((prev) => ({
        ...prev,
        updates: [...(prev.updates || []), update],
      }));
      setComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0f0f0f] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-3 p-5 border-b border-white/[0.06] bg-[#0f0f0f]">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-white leading-snug">{localTask.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Status */}
              <span className={`text-[11px] font-medium ${column?.color || "text-white/40"}`}>
                {column?.label || localTask.status}
              </span>
              <span className="text-white/20">·</span>
              {/* Priority badge */}
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${priority.bg} ${priority.color}`}>
                {priority.label}
              </span>
              {saving && <Loader2 className="h-3 w-3 animate-spin text-white/30" />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Description */}
          {localTask.description && (
            <div>
              <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-sm text-white/70 leading-relaxed">{localTask.description}</p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[11px] text-white/30 font-medium">Status</span>
              </div>
              <select
                value={localTask.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full bg-transparent text-sm text-white/80 outline-none cursor-pointer"
              >
                {COLUMNS.filter((c) => c.id !== "REVIEW" && c.id !== "DONE").map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
                    {c.label}
                  </option>
                ))}
                {/* REVIEW and DONE are read-only — set via QA endpoints */}
                {(localTask.status === "REVIEW" || localTask.status === "DONE") && (
                  <option value={localTask.status} className="bg-[#1a1a1a]">
                    {COLUMNS.find((c) => c.id === localTask.status)?.label}
                  </option>
                )}
              </select>
            </div>

            {/* Priority */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[11px] text-white/30 font-medium">Priority</span>
              </div>
              <select
                value={localTask.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className="w-full bg-transparent text-sm text-white/80 outline-none cursor-pointer"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                  <option key={key} value={key} className="bg-[#1a1a1a]">
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <User className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[11px] text-white/30 font-medium">Assignee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                  {getInitials(assigneeName)}
                </div>
                <span className="text-sm text-white/80">{assigneeName}</span>
              </div>
            </div>

            {/* Due date */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[11px] text-white/30 font-medium">Due date</span>
              </div>
              <input
                type="datetime-local"
                value={localTask.dueDate ? new Date(localTask.dueDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateField("dueDate", e.target.value)}
                className="w-full bg-transparent text-sm text-white/80 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[11px] text-white/30 font-medium">Progress</span>
              <span className="ml-auto text-sm font-semibold text-white/70">{localTask.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={localTask.progress}
              onChange={(e) => setLocalTask((prev) => ({ ...prev, progress: parseInt(e.target.value) }))}
              onMouseUp={(e) => updateField("progress", parseInt((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => updateField("progress", parseInt((e.target as HTMLInputElement).value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${localTask.progress}%` }}
              />
            </div>
          </div>

          {/* ── QA Section (shown when in REVIEW) ── */}
          {isInReview && (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.03] p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-300">QA Review Checklist</h3>
                {localTask.qaStatus === "PENDING" && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/20">
                    Awaiting Review
                  </span>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {QA_CHECKLIST.map(item => (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={qaChecked[item.id] ?? false}
                      onChange={e => setQaChecked(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="h-3.5 w-3.5 accent-purple-500"
                    />
                    <span className={`text-xs transition-colors ${qaChecked[item.id] ? "text-green-400 line-through" : "text-gray-400 group-hover:text-white"}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Bug list */}
              <div>
                <p className="text-[11px] font-medium text-white/40 mb-2 flex items-center gap-1.5">
                  <Bug className="h-3.5 w-3.5" />
                  Bugs Found ({bugList.length})
                </p>
                <div className="space-y-1 mb-2">
                  {bugList.map((bug, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-red-500/[0.08] border border-red-500/20 px-2.5 py-1.5">
                      <span className="flex-1 text-xs text-red-300">{i + 1}. {bug}</span>
                      <button onClick={() => setBugList(prev => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3 text-red-500/60 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBug}
                    onChange={e => setNewBug(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && newBug.trim()) {
                        setBugList(prev => [...prev, newBug.trim()]);
                        setNewBug("");
                      }
                    }}
                    placeholder="Describe a bug and press Enter..."
                    className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 outline-none focus:border-red-500/30"
                  />
                  <button
                    onClick={() => {
                      if (newBug.trim()) {
                        setBugList(prev => [...prev, newBug.trim()]);
                        setNewBug("");
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* QA Note */}
              <textarea
                value={qaNote}
                onChange={e => setQaNote(e.target.value)}
                placeholder="Additional notes for the developer... (optional)"
                rows={2}
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 outline-none resize-none"
              />

              {/* Approve / Reject buttons */}
              <div className="flex gap-2">
                <button
                  onClick={rejectTask}
                  disabled={qaSubmitting || bugList.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all"
                >
                  {qaSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldX className="h-3.5 w-3.5" />}
                  Reject ({bugList.length} bug{bugList.length !== 1 ? "s" : ""})
                </button>
                <button
                  onClick={approveTask}
                  disabled={qaSubmitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-40 transition-all"
                >
                  {qaSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Approve & Move to Done
                </button>
              </div>
            </div>
          )}

          {/* Submit for review button (when IN_PROGRESS) */}
          {localTask.status === "IN_PROGRESS" && (
            <button
              onClick={submitForReview}
              disabled={qaSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] px-4 py-2.5 text-sm font-medium text-orange-300 hover:bg-orange-500/10 disabled:opacity-40 transition-all"
            >
              {qaSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Submit for QA Review
            </button>
          )}

          {/* QA Result indicator */}
          {localTask.qaStatus === "APPROVED" && localTask.approvedAt && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/[0.05] px-4 py-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-xs font-medium text-green-300">Approved by QA</p>
                <p className="text-[10px] text-green-500/70">
                  {localTask.reviewedBy} · {formatDateTime(localTask.approvedAt)}
                </p>
              </div>
            </div>
          )}

          {localTask.qaStatus === "REJECTED" && localTask.rejectedAt && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] px-4 py-3 flex items-center gap-2">
              <ShieldX className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-xs font-medium text-red-300">Rejected by QA — fix and resubmit</p>
                <p className="text-[10px] text-red-500/70">
                  {localTask.reviewedBy} · {formatDateTime(localTask.rejectedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Comments/Updates */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Activity</span>
              <span className="ml-auto text-[11px] text-white/20">{(localTask.updates || []).length} updates</span>
            </div>

            {/* Updates list */}
            <div className="space-y-2 mb-3">
              {(localTask.updates || []).length === 0 && (
                <p className="text-[12px] text-white/20 text-center py-3">No activity yet</p>
              )}
              {(localTask.updates || []).map((u) => {
                const isQaApproved = u.updateType === "QA_APPROVED";
                const isQaRejected = u.updateType === "QA_REJECTED";
                const isQaSubmit = u.updateType === "QA_SUBMITTED";
                const borderClass = isQaApproved
                  ? "border-green-500/20 bg-green-500/[0.03]"
                  : isQaRejected
                  ? "border-red-500/20 bg-red-500/[0.03]"
                  : isQaSubmit
                  ? "border-orange-500/20 bg-orange-500/[0.03]"
                  : "border-white/[0.05] bg-white/[0.02]";

                return (
                  <div key={u.id} className="flex gap-2.5">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(u.authorName)} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5`}>
                      {getInitials(u.authorName)}
                    </div>
                    <div className={`flex-1 rounded-xl border px-3 py-2 ${borderClass}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-white/60">{u.authorName}</span>
                        <span className="text-[10px] text-white/20">{formatDateTime(u.createdAt)}</span>
                      </div>
                      <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{u.content}</p>
                      {u.bugsFound && u.bugsFound.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {u.bugsFound.map((bug, i) => (
                            <p key={i} className="text-[11px] text-red-400">🐛 {bug}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comment input */}
            <div className="flex gap-2">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-1`}>
                M
              </div>
              <div className="flex-1 flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 focus-within:border-purple-500/40">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) postComment();
                  }}
                  placeholder="Add a comment..."
                  rows={2}
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none resize-none"
                />
                <button
                  onClick={postComment}
                  disabled={postingComment || !comment.trim()}
                  className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

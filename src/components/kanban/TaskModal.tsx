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

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [localTask, setLocalTask] = useState<Task>(task);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

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
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
                    {c.label}
                  </option>
                ))}
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
              {(localTask.updates || []).map((u) => (
                <div key={u.id} className="flex gap-2.5">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(u.authorName)} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5`}>
                    {getInitials(u.authorName)}
                  </div>
                  <div className="flex-1 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-white/60">{u.authorName}</span>
                      <span className="text-[10px] text-white/20">{formatDateTime(u.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-white/70 leading-relaxed">{u.content}</p>
                  </div>
                </div>
              ))}
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

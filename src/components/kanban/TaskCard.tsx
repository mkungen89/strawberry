"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, PRIORITY_CONFIG } from "./types";
import { CalendarDays, GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

function isOverdue(dueDate: string | null | undefined) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDueDate(dueDate: string) {
  const d = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return `Today ${d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric" }) + ` ${d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}`;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
  const overdue = isOverdue(task.dueDate);
  const assigneeName = task.assigneeName || task.assignee?.name || "Unassigned";
  const gradientColor = getAvatarColor(assigneeName);

  // Get project label as tag
  const projectTag = task.project?.title;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-3.5 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-150 ${isDragging ? "shadow-2xl shadow-purple-500/20 border-purple-500/30 scale-[1.02]" : ""}`}
      onClick={() => onClick(task)}
    >
      {/* Grip handle */}
      <button
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity cursor-grab active:cursor-grabbing text-white/40"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Title */}
      <p className="text-sm font-medium text-white/90 leading-snug mb-3 pr-5">{task.title}</p>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Priority */}
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>
        {/* Project tag */}
        {projectTag && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400">
            {projectTag}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/30">Progress</span>
          <span className="text-[10px] text-white/50 font-medium">{task.progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Bottom row: assignee + due date */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {task.assignee?.avatar ? (
            <img
              src={task.assignee.avatar}
              alt={assigneeName}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
              {getInitials(assigneeName)}
            </div>
          )}
          <span className="text-[11px] text-white/50">{assigneeName}</span>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${overdue ? "text-red-400" : "text-white/40"}`}>
            <CalendarDays className="h-3 w-3" />
            {formatDueDate(task.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}

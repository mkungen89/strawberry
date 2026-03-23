"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Task } from "./types";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
}

export function KanbanColumn({ column, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] xl:w-[300px] shrink-0">
      {/* Column header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`h-2 w-2 rounded-full ${column.dotColor} flex-shrink-0`} />
          <h3 className={`text-sm font-semibold ${column.color}`}>{column.label}</h3>
          <span className="ml-auto text-[11px] text-white/30 font-medium tabular-nums">
            {tasks.length}
            {column.limit ? `/${column.limit}` : ""}
          </span>
        </div>
        <p className="text-[11px] text-white/30 ml-4">{column.subtitle}</p>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl p-2 transition-colors duration-150 ${
          isOver ? "bg-white/[0.03] ring-1 ring-purple-500/30" : "bg-transparent"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {/* Add task button */}
        <button
          onClick={() => onAddTask?.(column.id)}
          className="flex items-center gap-1.5 w-full p-2 rounded-lg text-[11px] text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-150 group mt-1"
        >
          <Plus className="h-3.5 w-3.5 group-hover:text-purple-400 transition-colors" />
          Add task
        </button>
      </div>
    </div>
  );
}

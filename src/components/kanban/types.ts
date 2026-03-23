export type KanbanStatus = "BACKLOG" | "READY" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface TaskAssignee {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface TaskProject {
  id: string;
  title: string;
  category: string;
  color: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  dueDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  projectId?: string | null;
  project?: TaskProject | null;
  assignee?: TaskAssignee | null;
  updates?: TaskUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: KanbanStatus;
  label: string;
  subtitle: string;
  color: string;
  dotColor: string;
  limit?: number;
}

export const COLUMNS: Column[] = [
  {
    id: "BACKLOG",
    label: "Backlog",
    subtitle: "Not started",
    color: "text-gray-400",
    dotColor: "bg-gray-500",
    limit: 5,
  },
  {
    id: "READY",
    label: "Ready",
    subtitle: "Ready to pick up",
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    limit: 0,
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    subtitle: "Being worked on",
    color: "text-purple-400",
    dotColor: "bg-purple-500",
    limit: 3,
  },
  {
    id: "REVIEW",
    label: "In Review",
    subtitle: "Waiting approval",
    color: "text-orange-400",
    dotColor: "bg-orange-500",
    limit: 5,
  },
  {
    id: "DONE",
    label: "Done",
    subtitle: "Completed",
    color: "text-green-400",
    dotColor: "bg-green-500",
    limit: 5,
  },
];

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "text-gray-400", bg: "bg-gray-500/20 border-gray-500/30" },
  NORMAL: { label: "Medium", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  HIGH: { label: "High", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
  URGENT: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
};

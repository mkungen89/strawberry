import { Clock, CheckCircle, XCircle, Zap, Loader2 } from "lucide-react";

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:     { label: "Pending payment", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  PAID:        { label: "In queue",        color: "bg-blue-500/20 text-blue-300 border-blue-500/20",       icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In progress",     color: "bg-purple-500/20 text-purple-300 border-purple-500/20", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  REVIEW:      { label: "Under review",    color: "bg-orange-500/20 text-orange-300 border-orange-500/20", icon: <Zap className="h-3 w-3" /> },
  REVISION:    { label: "Revision",        color: "bg-pink-500/20 text-pink-300 border-pink-500/20",       icon: <Clock className="h-3 w-3" /> },
  COMPLETED:   { label: "Completed",       color: "bg-green-500/20 text-green-300 border-green-500/20",    icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED:   { label: "Cancelled",       color: "bg-red-500/20 text-red-300 border-red-500/20",          icon: <XCircle className="h-3 w-3" /> },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_CONFIG);

export const MILESTONE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "Pending",     color: "text-gray-400" },
  IN_PROGRESS: { label: "In progress", color: "text-purple-400" },
  COMPLETED:   { label: "Completed",   color: "text-green-400" },
  PAID:        { label: "Paid",        color: "text-blue-400" },
};

export const INVOICE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:   { label: "Draft",   color: "bg-gray-500/20 text-gray-300" },
  SENT:    { label: "Sent",    color: "bg-blue-500/20 text-blue-300" },
  PAID:    { label: "Paid",    color: "bg-green-500/20 text-green-300" },
  OVERDUE: { label: "Overdue", color: "bg-red-500/20 text-red-300" },
};

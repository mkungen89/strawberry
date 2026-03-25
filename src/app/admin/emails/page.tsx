"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { EmailCard } from "./email-card";

type EmailThread = {
  id: string;
  from: string;
  subject: string;
  originalEmail: string;
  aiResponse: string | null;
  status: "PENDING" | "DRAFT" | "SENT" | "FAILED";
  receivedAt: string;
  processedAt: string | null;
  sentAt: string | null;
  failureReason: string | null;
  draft: {
    id: string;
    to: string;
    subject: string;
    body: string;
    approved: boolean;
  } | null;
};

type Filter = "all" | "draft" | "sent" | "failed";

export default function EmailAdminPage() {
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmails = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter.toUpperCase()}` : "";
      const res = await fetch(`/api/admin/emails${params}`);
      const data = await res.json();
      setEmails(data.threads || []);
    } catch {
      toast.error("Failed to load emails");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => { fetchEmails(); }, [filter, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => fetchEmails(true), 30000);
    return () => clearInterval(interval);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (draftId: string) => {
    try {
      const res = await fetch(`/api/admin/emails/${draftId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "Admin" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Email sent successfully");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to send email");
    }
  };

  const handleReject = async (threadId: string) => {
    if (!confirm("Reject this draft?")) return;
    try {
      const res = await fetch(`/api/admin/emails/${threadId}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Draft rejected");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to reject draft");
    }
  };

  const counts = {
    all: emails.length,
    draft: emails.filter((e) => e.status === "DRAFT").length,
    sent: emails.filter((e) => e.status === "SENT").length,
    failed: emails.filter((e) => e.status === "FAILED").length,
  };

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "draft", label: `Draft (${counts.draft})` },
    { id: "sent", label: `Sent (${counts.sent})` },
    { id: "failed", label: `Failed (${counts.failed})` },
  ];

  return (
    <div className="min-h-screen bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Mail className="h-5 w-5 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Email Queue</h1>
            </div>
            <p className="text-sm text-gray-500">Review and approve AI-generated email responses from Elin.</p>
          </div>
          <button
            onClick={() => fetchEmails(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.all, color: "purple" },
            { label: "Awaiting review", value: counts.draft, color: "amber" },
            { label: "Sent", value: counts.sent, color: "green" },
            { label: "Failed", value: counts.failed, color: "red" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 p-4`}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all capitalize ${
                filter === id
                  ? "border-purple-500 bg-purple-600 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : emails.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Mail className="h-8 w-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No emails in this queue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onApprove={handleApprove}
                onReject={handleReject}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

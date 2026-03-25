"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Send, X, Edit2, Check, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type EmailThread = {
  id: string;
  from: string;
  subject: string;
  originalEmail: string;
  aiResponse: string | null;
  status: "PENDING" | "DRAFT" | "SENT" | "FAILED";
  receivedAt: string;
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

type Props = {
  email: EmailThread;
  onApprove: (draftId: string) => void;
  onReject: (threadId: string) => void;
  onRefresh: () => void;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:   { label: "Draft",   color: "bg-amber-500/20 text-amber-300 border-amber-500/20" },
  SENT:    { label: "Sent",    color: "bg-green-500/20 text-green-300 border-green-500/20" },
  FAILED:  { label: "Failed",  color: "bg-red-500/20 text-red-300 border-red-500/20" },
  PENDING: { label: "Pending", color: "bg-gray-500/20 text-gray-400 border-gray-500/20" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function EmailCard({ email, onApprove, onReject, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(email.draft?.body || "");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const status = STATUS_CONFIG[email.status] ?? { label: email.status, color: "bg-gray-500/20 text-gray-400" };

  const handleApprove = async () => {
    if (!email.draft) return;
    setSending(true);
    await onApprove(email.draft.id);
    setSending(false);
  };

  const handleSaveEdit = async () => {
    if (!email.draft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/emails/${email.draft.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editedBody }),
      });
      if (!res.ok) throw new Error();
      toast.success("Draft updated");
      setEditing(false);
      onRefresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-4 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Mail className="h-4 w-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-medium text-white text-sm truncate">{email.subject}</p>
            <Badge className={`text-xs shrink-0 ${status.color}`}>{status.label}</Badge>
          </div>
          <p className="text-xs text-gray-500">
            From <span className="text-gray-300">{email.from}</span> · {fmt(email.receivedAt)}
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 shrink-0 text-xs text-gray-500 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4">
          {/* Original email */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Original email</p>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {email.originalEmail}
            </div>
          </div>

          {/* AI draft */}
          {email.draft && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">Elin&apos;s suggested response</p>
                {email.status === "DRAFT" && !editing && (
                  <button
                    onClick={() => { setEditedBody(email.draft!.body); setEditing(true); }}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={8}
                    className="border-white/20 bg-white/5 text-white text-xs font-mono leading-relaxed resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg bg-purple-600/20 border border-purple-500/30 px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-600/30 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-all"
                    >
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.04] p-3 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {email.draft.body}
                </div>
              )}

              {/* Actions */}
              {email.status === "DRAFT" && !editing && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleApprove}
                    disabled={sending}
                    className="flex items-center gap-1.5 rounded-xl bg-green-600/15 hover:bg-green-600/25 border border-green-500/25 px-4 py-2 text-xs font-medium text-green-300 transition-all disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Approve & Send
                  </button>
                  <button
                    onClick={() => onReject(email.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 px-4 py-2 text-xs font-medium text-red-300 transition-all"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sent confirmation */}
          {email.status === "SENT" && email.sentAt && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.06] px-3 py-2">
              <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
              <p className="text-xs text-green-300">Sent {fmt(email.sentAt)}</p>
            </div>
          )}

          {/* Error */}
          {email.status === "FAILED" && email.failureReason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
              <p className="text-xs font-medium text-red-300 mb-0.5">Send failed</p>
              <p className="text-xs text-red-400/80">{email.failureReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

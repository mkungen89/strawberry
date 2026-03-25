'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type EmailThread = {
  id: string;
  from: string;
  subject: string;
  originalEmail: string;
  aiResponse: string | null;
  status: 'PENDING' | 'DRAFT' | 'SENT' | 'FAILED';
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

type EmailCardProps = {
  email: EmailThread;
  onApprove: (draftId: string) => void;
  onReject: (threadId: string) => void;
};

export function EmailCard({ email, onApprove, onReject }: EmailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedBody, setEditedBody] = useState(email.draft?.body || '');
  const [sending, setSending] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">⚠️ DRAFT</Badge>;
      case 'SENT':
        return <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">✅ SENT</Badge>;
      case 'FAILED':
        return <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500">❌ FAILED</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-700 border-gray-500">⏳ PENDING</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = async () => {
    if (!email.draft) return;
    setSending(true);
    await onApprove(email.draft.id);
    setSending(false);
  };

  const handleSaveEdit = async () => {
    if (!email.draft) return;
    try {
      const res = await fetch(`/api/admin/emails/${email.draft.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editedBody }),
      });

      if (!res.ok) throw new Error('Failed to save edit');

      setEditDialogOpen(false);
      window.location.reload(); // Refresh to show updated content
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{email.subject}</h3>
                {getStatusBadge(email.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                From: <span className="font-medium">{email.from}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(email.receivedAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▲ Collapse' : '▼ Expand'}
            </Button>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="space-y-4 pt-0">
            <Separator />

            {/* Original Email */}
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">
                Original Email:
              </Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                {email.originalEmail}
              </div>
            </div>

            {/* AI Response */}
            {email.draft && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Elin's Suggested Response:
                  </Label>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md text-sm whitespace-pre-wrap">
                    {email.draft.body}
                  </div>
                </div>

                {/* Actions */}
                {email.status === 'DRAFT' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditedBody(email.draft!.body);
                        setEditDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      onClick={handleApprove}
                      variant="default"
                      size="sm"
                      disabled={sending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {sending ? 'Sending...' : '✅ Approve & Send'}
                    </Button>
                    <Button
                      onClick={() => onReject(email.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      ❌ Reject
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Sent Confirmation */}
            {email.status === 'SENT' && email.sentAt && (
              <div className="text-sm text-green-600 font-medium">
                ✅ Sent at {formatDate(email.sentAt)}
              </div>
            )}

            {/* Error Message */}
            {email.status === 'FAILED' && email.failureReason && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-sm text-red-700">
                <strong>Error:</strong> {email.failureReason}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>To: {email.draft?.to}</Label>
            </div>
            <div>
              <Label>Subject: {email.draft?.subject}</Label>
            </div>
            <div>
              <Label htmlFor="edit-body">Message Body</Label>
              <Textarea
                id="edit-body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={12}
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

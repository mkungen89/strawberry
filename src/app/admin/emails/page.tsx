'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EmailCard } from './email-card';

type EmailThread = {
  id: string;
  from: string;
  subject: string;
  originalEmail: string;
  aiResponse: string | null;
  status: 'PENDING' | 'DRAFT' | 'SENT' | 'FAILED';
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

export default function EmailAdminPage() {
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter.toUpperCase()}` : '';
      const res = await fetch(`/api/admin/emails${params}`);
      const data = await res.json();
      setEmails(data.threads || []);
    } catch (error) {
      toast.error('Failed to load emails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [filter, refreshKey]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmails();
    }, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleApprove = async (draftId: string) => {
    try {
      const res = await fetch(`/api/admin/emails/${draftId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Admin' }),
      });

      if (!res.ok) throw new Error('Failed to send email');

      toast.success('Email sent successfully! ✅');
      setRefreshKey((prev) => prev + 1); // Refresh list
    } catch (error) {
      toast.error('Failed to send email');
      console.error(error);
    }
  };

  const handleReject = async (threadId: string) => {
    if (!confirm('Are you sure you want to reject this draft?')) return;

    try {
      const res = await fetch(`/api/admin/emails/${threadId}/delete`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to reject draft');

      toast.success('Draft rejected ❌');
      setRefreshKey((prev) => prev + 1); // Refresh list
    } catch (error) {
      toast.error('Failed to reject draft');
      console.error(error);
    }
  };

  const filteredEmails = emails;

  const statusCounts = {
    all: emails.length,
    draft: emails.filter((e) => e.status === 'DRAFT').length,
    sent: emails.filter((e) => e.status === 'SENT').length,
    failed: emails.filter((e) => e.status === 'FAILED').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📧 Email Queue</h1>
          <p className="text-muted-foreground mt-1">
            Manage Elin's AI-generated email responses
          </p>
        </div>
        <Button onClick={() => setRefreshKey((prev) => prev + 1)} variant="outline">
          🔄 Refresh
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="draft">
            DRAFT ({statusCounts.draft})
          </TabsTrigger>
          <TabsTrigger value="sent">
            SENT ({statusCounts.sent})
          </TabsTrigger>
          <TabsTrigger value="failed">
            FAILED ({statusCounts.failed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading emails...
        </div>
      ) : filteredEmails.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No emails found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

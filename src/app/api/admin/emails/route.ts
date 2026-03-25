import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

/**
 * GET /api/admin/emails
 * List all email threads with their drafts
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const threads = await db.emailThread.findMany({
      where: status ? { status } : undefined,
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });

    const drafts = await db.emailDraft.findMany({
      where: {
        emailThreadId: { in: threads.map((t) => t.id) },
      },
    });

    // O(1) lookup with Map instead of O(n) find
    const draftsMap = new Map(drafts.map((d) => [d.emailThreadId, d]));
    const threadsWithDrafts = threads.map((thread) => ({
      ...thread,
      draft: draftsMap.get(thread.id) || null,
    }));

    return NextResponse.json({ threads: threadsWithDrafts, count: threads.length });
  } catch (error) {
    console.error('[API /admin/emails] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

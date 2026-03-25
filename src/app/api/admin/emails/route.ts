import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/emails
 * List all email threads with their drafts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const threads = await db.emailThread.findMany({
      where: status ? { status } : undefined,
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });

    // Fetch drafts separately
    const drafts = await db.emailDraft.findMany({
      where: {
        emailThreadId: { in: threads.map((t) => t.id) },
      },
    });

    // Combine threads with their drafts
    const threadsWithDrafts = threads.map((thread) => ({
      ...thread,
      draft: drafts.find((d) => d.emailThreadId === thread.id) || null,
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

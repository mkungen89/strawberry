import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

/**
 * DELETE /api/admin/emails/[id]/delete
 * Delete a draft and mark thread as rejected
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { id: threadId } = await context.params;

    // Delete draft if exists
    await db.emailDraft.deleteMany({
      where: { emailThreadId: threadId },
    });

    // Update thread status
    await db.emailThread.update({
      where: { id: threadId },
      data: {
        status: 'FAILED',
        failureReason: 'Rejected by admin',
      },
    });

    return NextResponse.json({ success: true, message: 'Draft rejected' });
  } catch (error) {
    console.error('[API /admin/emails/[id]/delete] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject draft' },
      { status: 500 }
    );
  }
}

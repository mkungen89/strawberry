import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * DELETE /api/admin/emails/[id]/delete
 * Delete a draft and mark thread as rejected
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

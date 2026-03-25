import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * PATCH /api/admin/emails/[id]/edit
 * Edit a draft email body
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: draftId } = await context.params;
    const { body } = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: 'body is required' },
        { status: 400 }
      );
    }

    // Update the draft
    const draft = await db.emailDraft.update({
      where: { id: draftId },
      data: { body },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('[API /admin/emails/[id]/edit] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update draft' },
      { status: 500 }
    );
  }
}

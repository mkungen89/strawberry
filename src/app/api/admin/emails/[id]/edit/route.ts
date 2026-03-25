import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

const MAX_BODY_LENGTH = 50_000;

/**
 * PATCH /api/admin/emails/[id]/edit
 * Edit a draft email body
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { id: draftId } = await context.params;
    const { body } = await request.json();

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'body is required' },
        { status: 400 }
      );
    }

    if (body.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Email body too long (max ${MAX_BODY_LENGTH.toLocaleString()} characters)` },
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

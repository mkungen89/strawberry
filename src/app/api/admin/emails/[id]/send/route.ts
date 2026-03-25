import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { EmailSender } from '@/services/email-sender';

/**
 * POST /api/admin/emails/[id]/send
 * Approve and send a draft email
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const { id: draftId } = await context.params;
    const { approvedBy } = await request.json();

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'approvedBy is required' },
        { status: 400 }
      );
    }

    const sender = new EmailSender();
    await sender.sendApprovedDraft(draftId, approvedBy);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('[API /admin/emails/[id]/send] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

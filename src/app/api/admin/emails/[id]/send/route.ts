import { NextRequest, NextResponse } from 'next/server';
import { EmailSender } from '@/services/email-sender';

/**
 * POST /api/admin/emails/[id]/send
 * Approve and send a draft email
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

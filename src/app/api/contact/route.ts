import { NextRequest, NextResponse } from "next/server";

const VALID_SUBJECTS = ["general", "order", "technical", "partnership", "other"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: "Please select a valid subject." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Log the submission (email sending can be added later)
    console.log("[Contact Form Submission]", {
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact API Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_SUBJECTS = ["general", "order", "technical", "partnership", "other"];

export async function POST(req: NextRequest) {
  // Rate limit: 5 contact submissions per 15 minutes per IP
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`contact:${ip}`, { maxRequests: 5, windowSeconds: 900 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      }
    );
  }

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

    // Send notification to support@vexcraft.io
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.spacemail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_ACCOUNT || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
      });

      await transporter.sendMail({
        from: `Vexcraft Website <${process.env.EMAIL_ACCOUNT}>`,
        to: 'support@vexcraft.io',
        replyTo: email.trim(),
        subject: `[Contact Form] ${subject} — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      });
    } catch (emailErr) {
      console.error('[Contact API] Failed to send notification email:', emailErr);
      // Don't fail the response — submission was still received
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact API Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_SLUGS = ["website", "mobile-app", "saas-platform"];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`quote:${ip}`, { maxRequests: 5, windowSeconds: 900 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const {
      serviceSlug, serviceName, name, email, description,
      github, budget, timeline,
      // Website-specific
      siteType, techStackPref,
      // Mobile-specific
      platform, hasDesigns,
      // SaaS-specific
      saasFeatures,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (!VALID_SLUGS.includes(serviceSlug)) {
      return NextResponse.json({ error: "Invalid service." }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json({ error: "Please describe your project (at least 20 characters)." }, { status: 400 });
    }
    if (!budget || !timeline) {
      return NextResponse.json({ error: "Please select budget and timeline." }, { status: 400 });
    }

    const lines: string[] = [
      `Service: ${serviceName} (${serviceSlug})`,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Budget: ${budget}`,
      `Timeline: ${timeline}`,
      "",
    ];

    if (siteType) lines.push(`Site type: ${siteType}`);
    if (techStackPref?.trim()) lines.push(`Tech stack preference: ${techStackPref.trim()}`);
    if (platform) lines.push(`Platform: ${platform}`);
    if (hasDesigns) lines.push(`Has designs/wireframes: ${hasDesigns}`);
    if (Array.isArray(saasFeatures) && saasFeatures.length > 0) {
      lines.push(`Features needed: ${saasFeatures.join(", ")}`);
    }

    lines.push("", "--- Project Description ---", description.trim());

    if (github?.trim()) {
      lines.push("", `GitHub / Reference URL: ${github.trim()}`);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "mail.spacemail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_ACCOUNT || "",
          pass: process.env.EMAIL_PASSWORD || "",
        },
      });

      await transporter.sendMail({
        from: `Vexcraft Website <${process.env.EMAIL_ACCOUNT}>`,
        to: "support@vexcraft.io",
        replyTo: email.trim(),
        subject: `[Quote Request] ${serviceName} — ${name.trim()}`,
        text: lines.join("\n"),
      });
    } catch (emailErr) {
      console.error("[Quote API] Failed to send email:", emailErr);
      // Don't fail the response
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Quote API Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

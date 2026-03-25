import { NextRequest, NextResponse } from "next/server";
import { exchangePinterestCode } from "@/lib/social/pinterest";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vexcraft.io";

  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${appUrl}/admin/social?error=pinterest_no_code`);
  }

  try {
    await exchangePinterestCode(code);
    return NextResponse.redirect(`${appUrl}/admin/social?connected=pinterest`);
  } catch (err) {
    console.error("[Pinterest OAuth Error]", err);
    return NextResponse.redirect(`${appUrl}/admin/social?error=pinterest_auth_failed`);
  }
}

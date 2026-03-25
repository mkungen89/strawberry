import { db } from "@/lib/db";

const PINTEREST_API = "https://api.pinterest.com/v5";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findUnique({ where: { platform: "PINTEREST" } });
  if (!account) throw new Error("Pinterest not connected. Please connect your Pinterest account first.");
  if (account.tokenExpiry && account.tokenExpiry < new Date()) {
    throw new Error("Pinterest access token expired. Please reconnect your Pinterest account.");
  }
  return account.accessToken;
}

export async function getPinterestBoards(): Promise<{ id: string; name: string }[]> {
  const token = await getAccessToken();
  const res = await fetch(`${PINTEREST_API}/boards?page_size=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Pinterest boards fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []).map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }));
}

export async function createPin(params: {
  boardId: string;
  title: string;
  description: string;
  link?: string;
  imageUrl?: string;
}): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();

  const body: Record<string, unknown> = {
    board_id: params.boardId,
    title: params.title,
    description: params.description,
  };

  if (params.link) body.link = params.link;

  if (params.imageUrl) {
    body.media_source = { source_type: "image_url", url: params.imageUrl };
  } else {
    body.media_source = { source_type: "image_url", url: "https://vexcraft.io/og-image.png" };
  }

  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest pin creation failed: ${err}`);
  }

  const pin = await res.json();
  return {
    id: pin.id,
    url: `https://www.pinterest.com/pin/${pin.id}/`,
  };
}

export async function getPinterestOAuthUrl(): Promise<string> {
  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/pinterest`);
  const scope = encodeURIComponent("boards:read,boards:write,pins:read,pins:write");
  return `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
}

export async function exchangePinterestCode(code: string): Promise<void> {
  const clientId = process.env.PINTEREST_APP_ID!;
  const clientSecret = process.env.PINTEREST_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/pinterest`;

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest token exchange failed: ${err}`);
  }

  const data = await res.json();
  const expiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null;

  await db.socialAccount.upsert({
    where: { platform: "PINTEREST" },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      tokenExpiry: expiry,
    },
    create: {
      platform: "PINTEREST",
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      tokenExpiry: expiry,
    },
  });
}

import "server-only";

const AUTHORIZE_URL = "https://apis.roblox.com/oauth/v1/authorize";
const TOKEN_URL = "https://apis.roblox.com/oauth/v1/token";
const USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo";

export function robloxOAuthConfigured(): boolean {
  return Boolean(process.env.ROBLOX_CLIENT_ID && process.env.ROBLOX_CLIENT_SECRET);
}

export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function redirectUri(): string {
  return process.env.ROBLOX_REDIRECT_URI ?? `${baseUrl()}/api/auth/roblox/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID as string,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid profile",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID as string,
    client_secret: process.env.ROBLOX_CLIENT_SECRET as string,
    grant_type: "authorization_code",
    code,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Roblox token exchange failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Roblox token exchange returned no token");
  return json.access_token;
}

export interface RobloxProfile {
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export async function fetchRobloxProfile(accessToken: string): Promise<RobloxProfile> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Roblox userinfo failed (${res.status})`);
  const json = (await res.json()) as {
    sub: string;
    name?: string;
    nickname?: string;
    preferred_username?: string;
    picture?: string;
  };
  const avatarUrl = json.picture ?? (await fetchRobloxAvatar(json.sub));
  return {
    robloxId: json.sub,
    username: json.preferred_username ?? json.name ?? `user_${json.sub}`,
    displayName: json.nickname ?? json.name ?? `User ${json.sub}`,
    avatarUrl,
  };
}

export async function fetchRobloxAvatar(robloxUserId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUserId}&size=150x150&format=Png&isCircular=false`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { imageUrl?: string }[] };
    return json.data?.[0]?.imageUrl ?? null;
  } catch {
    return null;
  }
}

/**
 * Verifies ownership of an official Roblox Game Pass via the public Roblox
 * inventory API. Purchases themselves always happen on roblox.com — this site
 * never sells, transfers or manipulates Robux.
 */
export async function userOwnsGamePass(
  robloxUserId: string,
  gamePassId: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://inventory.roblox.com/v1/users/${robloxUserId}/items/GamePass/${gamePassId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: unknown[] };
    return Array.isArray(json.data) && json.data.length > 0;
  } catch {
    return false;
  }
}

export function adminRobloxIds(): string[] {
  return (process.env.ADMIN_ROBLOX_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Emails allowed to claim the owner account in demo mode. Defaults to the
 * store owner's address so the shop is owner-locked out of the box.
 * Note: Roblox OAuth never exposes user emails — for the real OAuth flow,
 * admin rights are granted through ADMIN_ROBLOX_IDS instead.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "damon0wendt@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

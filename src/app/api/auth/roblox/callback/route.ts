import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";
import {
  exchangeCodeForToken,
  fetchRobloxProfile,
  fetchRobloxAvatar,
  adminRobloxIds,
  robloxOAuthConfigured,
} from "@/lib/roblox";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

function loginRedirect(origin: string, error: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!robloxOAuthConfigured()) {
    return loginRedirect(origin, "oauth_not_configured");
  }

  const rl = rateLimit(`auth-callback:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) return loginRedirect(origin, "access_denied");
  if (!code || !state) return loginRedirect(origin, "oauth");

  const store = await cookies();
  const savedState = store.get("roblox_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return loginRedirect(origin, "state");
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchRobloxProfile(accessToken);
    const avatarUrl = profile.avatarUrl ?? (await fetchRobloxAvatar(profile.robloxId));
    const isAdmin = adminRobloxIds().includes(profile.robloxId);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.robloxId, profile.robloxId))
      .limit(1);

    let userId: string;
    if (existing[0]) {
      await db
        .update(users)
        .set({
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl,
          isAdmin: existing[0].isAdmin || isAdmin,
        })
        .where(eq(users.id, existing[0].id));
      userId = existing[0].id;
    } else {
      const inserted = await db
        .insert(users)
        .values({
          robloxId: profile.robloxId,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl,
          isAdmin,
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
    }

    await createSession(userId, accessToken);

    const next = store.get("auth_next")?.value;
    const target = next && next.startsWith("/") ? next : "/";
    const response = NextResponse.redirect(new URL(target, origin));
    response.cookies.delete("roblox_oauth_state");
    response.cookies.delete("auth_next");
    return response;
  } catch (error) {
    console.error("[auth] Roblox callback failed:", error);
    return loginRedirect(origin, "server");
  }
}

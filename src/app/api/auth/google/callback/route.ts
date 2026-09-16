import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { adminEmails } from "@/lib/roblox";
import { createDemoSession, createSession, clientIp } from "@/lib/session";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  googleOAuthConfigured,
} from "@/lib/google";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function redirectToLogin(origin: string, error: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!googleOAuthConfigured()) return redirectToLogin(origin, "google_not_configured");

  const rl = rateLimit(`auth-google-callback:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");
  const store = await cookies();
  const savedState = store.get("google_oauth_state")?.value;

  if (oauthError) return redirectToLogin(origin, "access_denied");
  if (!code || !state || state !== savedState) return redirectToLogin(origin, "state");

  try {
    const accessToken = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(accessToken);
    const isAdmin = adminEmails().includes(profile.email);

    if (!process.env.DATABASE_URL) {
      await createDemoSession({
        id: crypto.randomUUID(),
        robloxId: `google:${profile.id}`,
        username: profile.email,
        displayName: profile.name,
        email: profile.email,
        avatarUrl: profile.picture,
        isAdmin,
        createdAt: new Date(),
      });
    } else {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.robloxId, `google:${profile.id}`))
        .limit(1);
      let userId = existing[0]?.id;
      if (userId) {
        await db
          .update(users)
          .set({
            username: profile.email,
            displayName: profile.name,
            email: profile.email,
            avatarUrl: profile.picture,
            isAdmin: existing[0].isAdmin || isAdmin,
          })
          .where(eq(users.id, userId));
      } else {
        const inserted = await db
          .insert(users)
          .values({
            robloxId: `google:${profile.id}`,
            username: profile.email,
            displayName: profile.name,
            email: profile.email,
            avatarUrl: profile.picture,
            isAdmin,
          })
          .returning({ id: users.id });
        userId = inserted[0]?.id;
      }
      if (!userId) throw new Error("Google user could not be created");
      await createSession(userId, accessToken);
    }

    const next = store.get("auth_next")?.value;
    const target = next && next.startsWith("/") ? next : "/";
    const response = NextResponse.redirect(new URL(target, origin));
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("auth_next");
    return response;
  } catch (error) {
    console.error("[auth] Google callback failed:", error);
    return redirectToLogin(origin, "server");
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { robloxOAuthConfigured, buildAuthorizeUrl } from "@/lib/roblox";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

const TEMP_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 10,
};

function secureCookie(): boolean {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "").startsWith("https://");
}

/**
 * Starts the Roblox OAuth2 flow. The user authenticates on roblox.com —
 * this site never sees or stores a Roblox password.
 *
 * When OAuth credentials are not configured (local development / demo),
 * the flow short-circuits to an interactive demo consent screen instead.
 */
export async function GET(request: NextRequest) {
  const rl = rateLimit(`auth-start:${clientIp(request)}`, 20, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const nextParam = request.nextUrl.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  if (!robloxOAuthConfigured()) {
    const url = new URL("/auth/demo", request.nextUrl.origin);
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  response.cookies.set("roblox_oauth_state", state, {
    ...TEMP_COOKIE_OPTS,
    secure: secureCookie(),
  });
  response.cookies.set("auth_next", next, {
    ...TEMP_COOKIE_OPTS,
    secure: secureCookie(),
  });
  return response;
}

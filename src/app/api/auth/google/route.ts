import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildGoogleAuthorizeUrl, googleOAuthConfigured } from "@/lib/google";
import { clientIp } from "@/lib/session";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function secureCookie() {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "").startsWith("https://");
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(`auth-google:${clientIp(request)}`, 20, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  if (!googleOAuthConfigured()) {
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  const nextParam = request.nextUrl.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";
  const state = crypto.randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildGoogleAuthorizeUrl(state));
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("auth_next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 600,
  });
  return response;
}

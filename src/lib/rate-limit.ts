import "server-only";
import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & {
  __veloxRateLimit?: Map<string, Bucket>;
};

const buckets = (globalStore.__veloxRateLimit ??= new Map<string, Bucket>());

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function tooManyRequests(retryAfter?: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter ?? 60) },
    },
  );
}

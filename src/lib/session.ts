import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import type { SafeUser } from "./auth-types";

export type { SafeUser } from "./auth-types";

const COOKIE_NAME = "velox_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const DEMO_SECRET =
  process.env.SESSION_SECRET ?? "velox-local-demo-session-secret";

function shouldUseSecureCookies(): boolean {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return base.startsWith("https://");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createSession(
  userId: string,
  robloxAccessToken?: string | null,
): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    robloxAccessToken: robloxAccessToken ?? null,
    expiresAt,
  });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    expires: expiresAt,
  });
}

export async function createDemoSession(user: User): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ ...user, createdAt: user.createdAt.toISOString() }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", DEMO_SECRET)
    .update(payload)
    .digest("base64url");
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    expires: new Date(Date.now() + SESSION_TTL_MS),
  });
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (payload && signature) {
      const expected = crypto
        .createHmac("sha256", DEMO_SECRET)
        .update(payload)
        .digest("base64url");
      const valid =
        signature.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      if (valid) {
        const user = JSON.parse(
          Buffer.from(payload, "base64url").toString("utf8"),
        ) as User & { createdAt: string };
        return { ...user, createdAt: new Date(user.createdAt) };
      }
    }
    const rows = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    const session = rows[0];
    if (!session) return null;
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    return userRows[0] ?? null;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  store.delete(COOKIE_NAME);
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    robloxId: user.robloxId,
    username: user.username,
    displayName: user.displayName,
    email: user.email ?? null,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
  };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local"
  );
}

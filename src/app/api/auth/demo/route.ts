import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createDemoSession, createSession, clientIp } from "@/lib/session";
import { robloxOAuthConfigured, adminRobloxIds, adminEmails } from "@/lib/roblox";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  role: z.enum(["user", "admin"]),
  email: z.string().email().max(200).optional(),
});

/**
 * Demo sign-in. Only available while real Roblox OAuth credentials are NOT
 * configured (or explicitly allowed via ALLOW_DEMO_LOGIN=true) so production
 * deployments are always protected by official Roblox OAuth.
 *
 * The buyer identity is open for testing. The OWNER identity is locked:
 * claiming it requires confirming the owner's admin email (ADMIN_EMAILS,
 * default damon0wendt@gmail.com). Only that account can create, edit or
 * delete products.
 */
export async function POST(request: NextRequest) {
  const allowed =
    !robloxOAuthConfigured() || process.env.ALLOW_DEMO_LOGIN === "true";
  if (!allowed) {
    return NextResponse.json(
      { error: "Demo login is disabled. Use Roblox OAuth." },
      { status: 403 },
    );
  }

  const rl = rateLimit(`auth-demo:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const role = parsed.data.role;
  const owners = adminEmails();
  const email = parsed.data.email?.trim().toLowerCase() ?? null;

  // Owner lock — only the configured admin email may claim the admin account.
  if (role === "admin") {
    if (!email || !owners.includes(email)) {
      rateLimit(`auth-demo-owner-fail:${clientIp(request)}`, 5, 300_000);
      return NextResponse.json(
        {
          error:
            "Locked. The owner account can only be claimed with the store owner's admin email.",
        },
        { status: 403 },
      );
    }
  }

  const ownerEmail = owners[0] ?? "damon0wendt@gmail.com";
  const identity =
    role === "admin"
      ? {
          robloxId: "9214776602",
          username: "VeloxOwner",
          displayName: "VELOX Owner",
          email: email ?? ownerEmail,
          isAdmin: true,
        }
      : {
          robloxId: "4827103593",
          username: "DemoBuilder",
          displayName: "Demo Builder",
          email: null,
          isAdmin: false,
        };

  const isAdmin =
    identity.isAdmin || adminRobloxIds().includes(identity.robloxId);

  if (!process.env.DATABASE_URL) {
    await createDemoSession({
      id: crypto.randomUUID(),
      robloxId: identity.robloxId,
      username: identity.username,
      displayName: identity.displayName,
      email: identity.email,
      avatarUrl: null,
      isAdmin,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.robloxId, identity.robloxId))
    .limit(1);

  let userId: string;
  if (existing[0]) {
    await db
      .update(users)
      .set({
        username: identity.username,
        displayName: identity.displayName,
        email: identity.email,
        isAdmin,
      })
      .where(eq(users.id, existing[0].id));
    userId = existing[0].id;
  } else {
    const inserted = await db
      .insert(users)
      .values({
        robloxId: identity.robloxId,
        username: identity.username,
        displayName: identity.displayName,
        email: identity.email,
        avatarUrl: null,
        isAdmin,
      })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  await createSession(userId, null);
  return NextResponse.json({ ok: true });
}

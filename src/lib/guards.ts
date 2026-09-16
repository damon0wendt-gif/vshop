import "server-only";
import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { User } from "@/db/schema";

/** Returns the signed-in user or null (API routes decide the response). */
export async function requireUser(): Promise<User | null> {
  return getSessionUser();
}

/** Returns the signed-in admin user or null. */
export async function requireAdmin(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) return null;
  return user;
}

export function unauthorized(message = "Please login with Roblox to continue.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

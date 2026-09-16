import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "up" | "down" = "down";
  try {
    const { pool } = await import("@/db");
    await pool.query("select 1");
    database = "up";
  } catch {
    database = "down";
  }
  return NextResponse.json({
    status: "ok",
    service: "velox-studios",
    database,
    time: new Date().toISOString(),
  });
}

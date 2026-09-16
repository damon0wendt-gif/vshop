export async function register() {
  // Runs once per server start (never during build).
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (!process.env.DATABASE_URL) return;
  try {
    const { ensureDatabase } = await import("@/lib/bootstrap");
    await ensureDatabase();
  } catch (error) {
    console.error("[bootstrap] Database initialization failed:", error);
  }
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Crown, Loader2, TriangleAlert, ShieldCheck, MailWarning } from "lucide-react";
import { VeloxMark, RobloxIcon } from "@/components/icons";

type Role = "user" | "admin";

const IDENTITIES: {
  role: Role;
  icon: typeof User;
  name: string;
  handle: string;
  id: string;
  desc: string;
  locked?: boolean;
}[] = [
  {
    role: "user",
    icon: User,
    name: "Demo Builder",
    handle: "@DemoBuilder",
    id: "4827103593",
    desc: "Regular buyer account — shop, purchase & download.",
  },
  {
    role: "admin",
    icon: Crown,
    name: "VELOX Owner",
    handle: "damon0wendt@gmail.com",
    id: "9214776602",
    desc: "Store owner — full admin dashboard access.",
    locked: true,
  },
];

function DemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proceed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          ...(role === "admin" ? { email: email.trim() } : {}),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Demo login failed.");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="vx-container flex min-h-[85vh] items-center justify-center pb-10 pt-28">
      <div className="w-full max-w-md">
        <div className="panel-strong relative overflow-hidden rounded-3xl p-8 sm:p-9">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[70px]"
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <VeloxMark className="h-10 w-10" />
              <div>
                <p className="font-display text-lg font-bold leading-none text-white">
                  Authorize {`"VELOX Studios"`}
                </p>
                <p className="mt-1 text-xs text-zinc-500">Simulated Roblox OAuth consent</p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                <span className="font-semibold">Demo mode.</span> Roblox OAuth
                credentials are not configured, so this consent screen stands in
                for roblox.com. Set ROBLOX_CLIENT_ID and ROBLOX_CLIENT_SECRET to
                enable the real flow — no passwords are ever involved either way.
              </p>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Choose a demo identity
            </p>
            <div className="mt-3 space-y-3">
              {IDENTITIES.map((identity) => (
                <button
                  key={identity.role}
                  type="button"
                  onClick={() => {
                    setRole(identity.role);
                    setError(null);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    role === identity.role
                      ? "border-violet-400/50 bg-violet-500/12 shadow-lg shadow-violet-950/40"
                      : "border-white/10 bg-white/4 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      role === identity.role
                        ? "border-violet-400/40 bg-violet-600/30"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <identity.icon className="h-5 w-5 text-violet-200" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-display text-sm font-bold text-white">
                        {identity.name}
                      </span>
                      <span className="truncate text-xs text-zinc-500">{identity.handle}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{identity.desc}</span>
                    <span className="mt-1 flex items-center gap-2 font-mono text-[10px] text-zinc-600">
                      ID {identity.id}
                      {identity.locked && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-sans font-bold uppercase tracking-wider text-amber-300">
                          owner locked
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                      role === identity.role
                        ? "border-violet-300 bg-violet-500"
                        : "border-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            {role === "admin" && (
              <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/8 px-4 py-3.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  <MailWarning className="h-3.5 w-3.5" />
                  Confirm owner admin email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="mt-2.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-400/60"
                  autoComplete="off"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                  Product management is locked to the store owner&apos;s admin
                  email. Buyer accounts can never access the dashboard.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-white/8 bg-black/25 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                This shares (exactly like real OAuth)
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                Username, display name, Roblox user ID &amp; avatar. Never your
                password, email or Robux.
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={proceed}
              disabled={loading || (role === "admin" && !email.trim())}
              className="btn-glow mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-violet-600 px-6 py-4 font-display text-base font-bold text-white transition-all hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RobloxIcon className="h-5 w-5" />
              )}
              {loading
                ? "Authorizing…"
                : `Continue as ${role === "admin" ? "VELOX Owner" : "Demo Builder"}`}
            </button>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
              Demo login auto-disables when real Roblox OAuth is configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center pt-20">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}

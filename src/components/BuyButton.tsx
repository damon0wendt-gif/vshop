"use client";

import Link from "next/link";
import { useState } from "react";
import {
  X,
  Loader2,
  ShieldCheck,
  ShoppingCart,
  BadgeCheck,
  ExternalLink,
  Lock,
  Download,
} from "lucide-react";
import { RobloxIcon } from "./icons";
import { formatRobux } from "@/lib/constants";

type Stage =
  | "summary"
  | "login-required"
  | "gamepass"
  | "processing"
  | "verifying"
  | "success"
  | "owned";

export default function BuyButton({
  productId,
  productName,
  priceRobux,
  version,
  loggedIn,
  purchaseStatus,
  gamePassUrl,
  next,
}: {
  productId: string;
  productName: string;
  priceRobux: number;
  version: string;
  loggedIn: boolean;
  purchaseStatus: "none" | "pending" | "completed";
  gamePassUrl?: string | null;
  next: string;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("summary");
  const [passUrl, setPassUrl] = useState<string | null>(gamePassUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  if (purchaseStatus === "completed") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
          <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">You own this product</p>
            <p className="text-xs text-zinc-500">Always includes the latest version.</p>
          </div>
        </div>
        <Link
          href="/purchases"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/6 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          Get Access — My Purchases
        </Link>
      </div>
    );
  }

  const openModal = () => {
    setError(null);
    if (!loggedIn) {
      setStage("login-required");
    } else if (purchaseStatus === "pending" && passUrl) {
      setStage("gamepass");
    } else {
      setStage("summary");
    }
    setOpen(true);
  };

  const startCheckout = async () => {
    setStage("processing");
    setError(null);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await res.json()) as {
        mode?: string;
        gamePassUrl?: string;
        alreadyOwned?: boolean;
        error?: string;
      };
      if (res.status === 401) {
        setStage("login-required");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setStage("summary");
        return;
      }
      if (data.mode === "owned" || data.alreadyOwned) {
        setStage("owned");
        return;
      }
      if (data.mode === "gamepass" && data.gamePassUrl) {
        setPassUrl(data.gamePassUrl);
        setStage("gamepass");
        return;
      }
      setStage("success");
    } catch {
      setError("Network error. Please try again.");
      setStage("summary");
    }
  };

  const verify = async () => {
    setStage("verifying");
    setError(null);
    try {
      const res = await fetch("/api/purchases/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await res.json()) as { verified?: boolean; error?: string };
      if (res.ok && data.verified) {
        setStage("success");
        return;
      }
      setError(data.error ?? "Purchase not detected yet. Try again in a few seconds.");
      setStage("gamepass");
    } catch {
      setError("Network error. Please try again.");
      setStage("gamepass");
    }
  };

  const busy = stage === "processing" || stage === "verifying";

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-display text-base font-bold text-white transition-all hover:bg-violet-500 active:scale-[0.99]"
      >
        <ShoppingCart className="h-5 w-5" />
        Buy for {formatRobux(priceRobux)}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
        <Lock className="h-3 w-3" />
        Payments are processed officially on roblox.com — never on this site.
      </p>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !busy && setOpen(false)}
          />
          <div className="panel-strong relative w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-violet-950/40 sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ---------- login required ---------- */}
            {stage === "login-required" && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <RobloxIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  Login required
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Please login with Roblox to continue. We never see or store
                  your Roblox password — authentication happens on roblox.com.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="btn-glow mt-6 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  <RobloxIcon className="h-4 w-4" />
                  Login with Roblox
                </Link>
              </div>
            )}

            {/* ---------- summary ---------- */}
            {(stage === "summary" || stage === "processing") && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                  Checkout
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">
                  {productName}
                </h3>
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3.5">
                  <span className="text-sm text-zinc-400">Version {version}</span>
                  <span className="font-display text-xl font-bold text-white">
                    {formatRobux(priceRobux)}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-violet-400" />
                    Official Roblox payment — no Robux handled here
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-violet-400" />
                    Lifetime access with free updates
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-violet-400" />
                    Discord buyer support included
                  </li>
                </ul>
                {error && (
                  <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={busy}
                  className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
                >
                  {stage === "processing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {stage === "processing" ? "Preparing checkout…" : "Continue to Purchase"}
                </button>
              </div>
            )}

            {/* ---------- game pass flow ---------- */}
            {(stage === "gamepass" || stage === "verifying") && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                  Official Roblox Payment
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">
                  Complete on roblox.com
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  This product is sold through an official Roblox game pass.
                  Buy it on roblox.com, then come back and verify — access is
                  granted instantly.
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={passUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/6 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <RobloxIcon className="h-4 w-4" />
                      1. Buy Game Pass — {formatRobux(priceRobux)}
                    </span>
                    <ExternalLink className="h-4 w-4 text-zinc-500" />
                  </a>
                  <button
                    type="button"
                    onClick={verify}
                    disabled={busy}
                    className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
                  >
                    {stage === "verifying" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {stage === "verifying" ? "Verifying with Roblox…" : "2. Verify my purchase"}
                  </button>
                </div>
                {error && (
                  <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* ---------- success / owned ---------- */}
            {(stage === "success" || stage === "owned") && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 shadow-lg shadow-emerald-900/40">
                  <BadgeCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white">
                  {stage === "owned" ? "Already owned" : "Purchase complete!"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {productName} is now unlocked on your account. You will
                  automatically receive every future update.
                </p>
                <Link
                  href="/purchases"
                  className="btn-glow mt-6 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  <Download className="h-4 w-4" />
                  Go to My Purchases
                </Link>
              </div>
            )}

            <p className="mt-6 border-t border-white/8 pt-4 text-center text-[11px] leading-relaxed text-zinc-600">
              VELOX Studios never sells, transfers or manipulates Robux. All
              payments use official Roblox systems.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

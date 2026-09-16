"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Copy,
  Check,
} from "lucide-react";
import { DiscordIcon } from "./icons";
import { SITE } from "@/lib/constants";
import type { SafeUser } from "@/lib/auth-types";

function Avatar({ user, size = "md" }: { user: SafeUser; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dims = size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs";
  if (user.avatarUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        onError={() => setFailed(true)}
        className={`${dims} rounded-full border border-violet-400/30 object-cover`}
      />
    );
  }
  return (
    <div
      className={`${dims} flex items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500 to-indigo-700 font-display font-bold text-white`}
    >
      {user.displayName.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function UserMenu({ user }: { user: SafeUser }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.robloxId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 py-1.5 pl-1.5 pr-3 transition-colors hover:border-violet-400/40 hover:bg-white/8"
      >
        <Avatar user={user} />
        <span className="hidden max-w-28 truncate text-sm font-medium text-white lg:block">
          {user.displayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="panel-strong absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/8 p-4">
            <Avatar user={user} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-white">
                {user.displayName}
              </p>
              <p className="truncate text-sm text-zinc-500">@{user.username}</p>
              {user.email && (
                <p className="truncate text-xs text-zinc-600">{user.email}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={copyId}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-white/4"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Roblox User ID
              </p>
              <p className="font-mono text-sm text-zinc-300">{user.robloxId}</p>
            </div>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-500" />
            )}
          </button>

          <div className="border-t border-white/8 p-2">
            <Link
              href="/purchases"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag className="h-4 w-4 text-violet-400" />
              My Purchases
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4 text-violet-400" />
                Admin Dashboard
              </Link>
            )}
            <a
              href={SITE.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <DiscordIcon className="h-4 w-4 text-blurple" />
              Support Discord
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

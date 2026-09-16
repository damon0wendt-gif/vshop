"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { VeloxMark, DiscordIcon } from "./icons";
import UserMenu from "./UserMenu";
import { SITE } from "@/lib/constants";
import type { SafeUser } from "@/lib/auth-types";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/purchases", label: "My Purchases" },
];

export default function Navbar({ user }: { user: SafeUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/8 bg-void/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="vx-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <VeloxMark className="h-8 w-8 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-wide text-white">
              {SITE.name}
            </span>
            <span className="text-[9px] font-semibold tracking-[0.35em] text-violet-400">
              {SITE.suffix}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-white/8 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <DiscordIcon className="h-4 w-4 text-blurple" />
            Discord
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="btn-glow hidden items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 sm:flex"
            >
              Login with Roblox
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/8 bg-void/95 px-5 pb-6 pt-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  isActive(link.href) ? "bg-white/8 text-white" : "text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400"
            >
              <DiscordIcon className="h-4 w-4 text-blurple" />
              Join Discord
            </a>
            {!user && (
              <Link
                href="/login"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Login with Roblox
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

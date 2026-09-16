import Link from "next/link";
import { VeloxMark, DiscordIcon } from "./icons";
import { SITE, CATEGORIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/6 bg-black/40">
      <div className="vx-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <VeloxMark className="h-8 w-8" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-wide text-white">
                {SITE.name}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.35em] text-violet-400">
                {SITE.suffix}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            Premium Roblox maps, gameplay systems, scripts and UI kits — built
            by developers, for developers.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Marketplace
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="text-zinc-400 transition-colors hover:text-white">Home</Link></li>
            <li><Link href="/shop" className="text-zinc-400 transition-colors hover:text-white">Shop</Link></li>
            <li><Link href="/purchases" className="text-zinc-400 transition-colors hover:text-white">My Purchases</Link></li>
            <li><Link href="/login" className="text-zinc-400 transition-colors hover:text-white">Login</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Categories
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Community & Support
          </p>
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blurple/40 bg-blurple/15 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition-all hover:bg-blurple/25 hover:text-white"
          >
            <DiscordIcon className="h-4 w-4" />
            Join our Discord
          </a>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            Need help? Join our Discord and chat with us — buyers get priority
            support.
          </p>
        </div>
      </div>

      <div className="border-t border-white/6">
        <div className="vx-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-zinc-600 sm:flex-row">
          <p>© 2026 {SITE.fullName}. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Not affiliated with, sponsored by, or endorsed by Roblox Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}

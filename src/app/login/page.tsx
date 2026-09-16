import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Lock, Fingerprint, CircleAlert } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { VeloxMark, RobloxIcon } from "@/components/icons";
import { SITE } from "@/lib/constants";
import { DiscordIcon } from "@/components/icons";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Login" };

const ERRORS: Record<string, string> = {
  oauth: "Roblox sign-in failed. Please try again.",
  state: "Your sign-in session expired. Please try again.",
  server: "Something went wrong on our side. Please try again.",
  access_denied: "You declined the Roblox authorization.",
  oauth_not_configured: "Roblox OAuth is not configured yet — use the demo login instead.",
};

const ASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Official Roblox OAuth2",
    text: "You sign in on roblox.com and are redirected back here.",
  },
  {
    icon: Lock,
    title: "No passwords, ever",
    text: "We never ask for, see, or store your Roblox password.",
  },
  {
    icon: Fingerprint,
    title: "Public profile only",
    text: "Only your username, display name, avatar and user ID are shared.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const user = await getSessionUser();
  const target = next && next.startsWith("/") ? next : "/";
  if (user) redirect(target);

  const authorizeUrl = `/api/auth/roblox${target !== "/" ? `?next=${encodeURIComponent(target)}` : ""}`;

  return (
    <div className="vx-container flex min-h-[85vh] items-center justify-center pb-10 pt-28">
      <div className="w-full max-w-md">
        <div className="panel-strong relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[70px]"
          />
          <div className="relative">
            <VeloxMark className="mx-auto h-14 w-14" />
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-500">
              Login with your Roblox account to buy products, access your
              downloads and receive automatic updates.
            </p>

            {error && ERRORS[error] && (
              <p className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                <CircleAlert className="h-4 w-4 shrink-0" />
                {ERRORS[error]}
              </p>
            )}

            <a
              href={authorizeUrl}
              className="btn-glow mt-7 flex items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-4 font-display text-base font-bold text-black transition-all hover:bg-zinc-200"
            >
              <RobloxIcon className="h-5 w-5" />
              Login with Roblox
            </a>

            <div className="mt-8 space-y-4 border-t border-white/8 pt-7 text-left">
              {ASSURANCES.map((item) => (
                <div key={item.title} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/12">
                    <item.icon className="h-4 w-4 text-violet-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Trouble signing in?{" "}
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            <DiscordIcon className="h-3.5 w-3.5" />
            Get help on Discord
          </a>
        </p>
      </div>
    </div>
  );
}

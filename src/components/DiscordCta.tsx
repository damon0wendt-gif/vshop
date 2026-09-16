import { ArrowRight, BellRing, Eye, LifeBuoy } from "lucide-react";
import { DiscordIcon } from "./icons";
import Reveal from "./Reveal";
import { SITE } from "@/lib/constants";

const PERKS = [
  { icon: LifeBuoy, label: "Priority buyer support" },
  { icon: BellRing, label: "Update announcements" },
  { icon: Eye, label: "Sneak peeks & polls" },
];

export default function DiscordCta() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-blurple/30 bg-gradient-to-br from-blurple/25 via-indigo-900/30 to-violet-900/25 p-8 sm:p-12">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blurple/30 blur-[100px]" aria-hidden />

        <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-blurple/30 shadow-lg shadow-blurple/30">
                <DiscordIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Join the {SITE.name} Discord
              </h3>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-indigo-200">
              Need help?
            </p>
            <p className="mt-2 leading-relaxed text-zinc-300">
              Join our Discord and chat with us. This is our official support
              community — buyers get help with setup, updates and
              troubleshooting directly from the developer.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {PERKS.map((perk) => (
                <span
                  key={perk.label}
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3.5 py-1.5 text-xs font-medium text-zinc-200"
                >
                  <perk.icon className="h-3.5 w-3.5 text-indigo-300" />
                  {perk.label}
                </span>
              ))}
            </div>
          </div>

          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-blurple px-8 py-4 font-display text-base font-bold text-white shadow-2xl shadow-blurple/40 transition-all duration-300 hover:scale-[1.03] hover:bg-indigo-500"
          >
            <DiscordIcon className="h-5 w-5" />
            Join Discord
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function ProductSupportBox() {
  return (
    <a
      href={SITE.discordInvite}
      target="_blank"
      rel="noopener noreferrer"
      className="panel card-hover group flex items-center gap-4 rounded-2xl p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blurple/40 bg-blurple/20">
        <DiscordIcon className="h-5 w-5 text-indigo-300" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          Need help with this product?
        </p>
        <p className="flex items-center gap-1 text-sm text-zinc-500 transition-colors group-hover:text-indigo-300">
          Chat with us on Discord
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </p>
      </div>
    </a>
  );
}

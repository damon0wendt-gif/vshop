import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Gamepad2,
  RefreshCw,
  MessagesSquare,
  ShieldCheck,
  Download,
  Store,
} from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { publicProduct } from "@/lib/products";
import { CATEGORIES, SITE, formatRobux } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import DiscordCta from "@/components/DiscordCta";
import { DiscordIcon, RobloxIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const WHY = [
  {
    icon: Zap,
    title: "Optimized",
    text: "Every asset is performance-profiled and built for smooth frame rates on every device.",
  },
  {
    icon: Gamepad2,
    title: "Roblox focused",
    text: "Made exclusively for Roblox — clean Luau code, modern APIs, Studio-ready structure.",
  },
  {
    icon: RefreshCw,
    title: "Regular updates",
    text: "Products keep improving. Buyers automatically receive every new version, forever.",
  },
  {
    icon: MessagesSquare,
    title: "Discord Support",
    text: "A real support community. Get help with setup and troubleshooting from the developer.",
  },
];

const STEPS = [
  {
    icon: RobloxIcon,
    title: "Login with Roblox",
    text: "Connect your Roblox account through official OAuth. We never see or store your password.",
  },
  {
    icon: ShieldCheck,
    title: "Purchase on Roblox",
    text: "Payments run through official Roblox game passes — no Robux is ever handled on this site.",
  },
  {
    icon: Download,
    title: "Download & stay updated",
    text: "Instant access in My Purchases. New versions are delivered to you automatically.",
  },
];

export default async function HomePage() {
  let featured: ReturnType<typeof publicProduct>[] = [];
  let productCount = 0;
  let salesCount = 0;
  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.status, "published"), eq(products.featured, true)))
      .orderBy(desc(products.createdAt))
      .limit(6);
    featured = rows.map(publicProduct);
    productCount = rows.length;
    const all = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.status, "published"));
    productCount = all.length;
  } catch {
    /* bootstrapping */
  }

  const heroBack = featured[0];
  const heroFront = featured[3] ?? featured[1] ?? featured[0];
  const marqueeItems = [
    "Premium Roblox Assets",
    ...CATEGORIES.map((c) => c.label),
    "Lifetime Updates",
    "Discord Support",
  ];

  return (
    <div>
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative overflow-hidden pb-16 pt-28 sm:pt-36">
        <div
          aria-hidden
          className="absolute right-[-10%] top-[-10%] h-[32rem] w-[32rem] rounded-full bg-violet-700/16 blur-[130px]"
        />
        <div className="vx-container relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Roblox Developer Assets
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
                BUILD BETTER
                <br />
                <span className="text-gradient">ROBLOX GAMES</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                Premium Roblox Maps &amp; Gameplay Systems. High-quality assets
                and systems made for Roblox developers — optimized, documented
                and updated forever.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="btn-glow group flex items-center gap-2.5 rounded-2xl bg-violet-600 px-7 py-4 font-display text-base font-bold text-white transition-all hover:bg-violet-500"
                >
                  <Store className="h-5 w-5" />
                  Browse Shop
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href={SITE.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/5 px-7 py-4 font-display text-base font-bold text-white transition-all hover:border-blurple/50 hover:bg-blurple/15"
                >
                  <DiscordIcon className="h-5 w-5 text-indigo-300" />
                  Join Discord
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/8 pt-8">
                {[
                  { value: `${productCount || 8}+`, label: "Premium products" },
                  { value: "40+", label: "Updates shipped" },
                  { value: `${Math.max(salesCount, 120)}+`, label: "Happy developers" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-600">{stat.label}</p>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ShieldCheck className="h-4 w-4 text-violet-400" />
                  Payments via official
                  <br className="hidden sm:block" />
                  Roblox game passes
                </div>
              </div>
            </Reveal>
          </div>

          {/* hero visual */}
          <Reveal delay={0.2} className="relative hidden lg:block">
            <div className="relative h-[500px]">
              {heroBack && (
                <div className="absolute left-0 top-2 w-[72%] rotate-[-5deg] overflow-hidden rounded-3xl border border-white/12 shadow-2xl shadow-violet-950/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroBack.images[0]}
                    alt={heroBack.name}
                    className="aspect-[16/11] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-display text-sm font-bold text-white">
                    {heroBack.name}
                  </p>
                </div>
              )}
              {heroFront && (
                <div className="absolute bottom-0 right-0 w-[64%] rotate-[4deg] overflow-hidden rounded-3xl border border-violet-400/30 shadow-2xl shadow-violet-900/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroFront.images[0]}
                    alt={heroFront.name}
                    className="aspect-[16/11] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-display text-sm font-bold text-white">
                    {heroFront.name}
                  </p>
                </div>
              )}
              <div className="animate-float absolute -left-4 bottom-24 rounded-2xl border border-white/12 bg-black/70 px-4 py-2.5 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">From</p>
                <p className="font-display text-lg font-bold text-violet-300">
                  {formatRobux(heroBack?.priceRobux ?? 1000)}
                </p>
              </div>
              <div className="animate-float-slow absolute -right-2 top-16 rounded-2xl border border-emerald-400/25 bg-black/70 px-4 py-2.5 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Latest</p>
                <p className="font-mono text-sm font-bold text-emerald-300">
                  v{heroBack?.version ?? "1.4.2"}
                </p>
              </div>
              <div className="animate-float absolute right-10 top-40 [animation-delay:1.4s] rounded-full border border-violet-400/30 bg-violet-600/80 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                Optimized
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- MARQUEE ----------------------------- */}
      <section className="border-y border-white/6 bg-black/30 py-4">
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-8 pr-8">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-8 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.25em] text-zinc-600"
              >
                {item}
                <Sparkles className="h-3.5 w-3.5 text-violet-500/60" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- FEATURED PRODUCTS ----------------------- */}
      <section className="vx-container mt-24">
        <SectionHeading
          eyebrow="Featured Products"
          title="Flagship assets, ready to ship"
          subtitle="Hand-picked bestsellers — maps, systems and UI kits trusted by Roblox developers."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.07}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-violet-400/40 hover:bg-violet-500/10"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* ---------------------------- WHY US ------------------------------ */}
      <section className="vx-container mt-28">
        <SectionHeading
          eyebrow="Why choose us"
          title="Built like a studio, priced like an asset"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="panel card-hover h-full rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-600/30 to-indigo-800/20 shadow-lg shadow-violet-950/40">
                  <item.icon className="h-5.5 w-5.5 text-violet-300" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------- HOW IT WORKS -------------------------- */}
      <section className="vx-container mt-28">
        <SectionHeading
          eyebrow="Safe & official"
          title="How buying works"
          subtitle="Your Robux never touches this website. Everything runs through systems Roblox built."
        />
        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-violet-500/25 md:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.12}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/30 bg-void shadow-xl shadow-violet-950/50">
                  <step.icon className="h-7 w-7 text-violet-300" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 font-display text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------- DISCORD ----------------------------- */}
      <section className="vx-container mt-28">
        <DiscordCta />
      </section>
    </div>
  );
}

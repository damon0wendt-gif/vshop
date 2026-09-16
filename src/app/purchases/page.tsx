import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { BadgeCheck, Download, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { products, purchases } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { categoryLabel } from "@/lib/constants";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";
import DiscordCta from "@/components/DiscordCta";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Purchases",
};

export default async function PurchasesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/purchases");

  const rows = await db
    .select({ purchase: purchases, product: products })
    .from(purchases)
    .innerJoin(products, eq(products.id, purchases.productId))
    .where(and(eq(purchases.userId, user.id), eq(purchases.status, "completed")))
    .orderBy(desc(purchases.createdAt));

  return (
    <div className="vx-container pt-28 sm:pt-32">
      <Reveal>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-400">
          Library
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          My Purchases
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-500">
          Everything you own, always up to date. Signed in as{" "}
          <span className="font-semibold text-zinc-300">
            {user.displayName}
            <span className="text-zinc-600"> (@{user.username})</span>
          </span>
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="panel mt-8 flex items-start gap-3.5 rounded-2xl p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/12">
            <RefreshCw className="h-4.5 w-4.5 text-violet-300" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Automatic updates enabled</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              When I publish a new version of a product you own, your download
              below automatically serves the latest release — no re-purchase,
              no extra cost.
            </p>
          </div>
        </div>
      </Reveal>

      {rows.length > 0 ? (
        <div className="mt-8 space-y-4">
          {rows.map(({ purchase, product }, i) => (
            <Reveal key={purchase.id} delay={Math.min(i, 6) * 0.05}>
              <div className="panel card-hover flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center">
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative block h-32 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-40"
                >
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-950/40">
                      <CategoryIcon slug={product.category} className="h-7 w-7 text-violet-400/60" />
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="font-display text-lg font-semibold text-white transition-colors hover:text-violet-200"
                    >
                      {product.name}
                    </Link>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <BadgeCheck className="h-3 w-3" />
                      Purchased
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <CategoryIcon slug={product.category} className="h-3 w-3 text-violet-400" />
                      {categoryLabel(product.category)}
                    </span>
                    <span>
                      Bought{" "}
                      {purchase.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      Version {product.version}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2.5 sm:w-48">
                  <a
                    href={`/api/downloads/${product.id}`}
                    className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                  >
                    <Download className="h-4 w-4" />
                    Download / Get Access
                  </a>
                  <Link
                    href={`/shop/${product.slug}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={0.1}>
          <div className="panel mt-8 flex flex-col items-center gap-4 rounded-3xl px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ShoppingBag className="h-7 w-7 text-zinc-500" />
            </span>
            <p className="font-display text-xl font-semibold text-white">No purchases yet</p>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              When you buy a product it appears here with instant access — and
              every future update, automatically.
            </p>
            <Link
              href="/shop"
              className="btn-glow group mt-2 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Browse the Shop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      )}

      <div className="mt-20">
        <DiscordCta />
      </div>
    </div>
  );
}

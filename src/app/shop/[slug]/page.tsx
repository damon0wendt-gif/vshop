import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import {
  ChevronRight,
  Check,
  Tag,
  MonitorCog,
  FolderOpen,
  History,
  Sparkles,
} from "lucide-react";
import { db } from "@/db";
import { products, productUpdates, purchases } from "@/db/schema";
import { publicProduct } from "@/lib/products";
import { categoryLabel, formatRobux } from "@/lib/constants";
import { getSessionUser } from "@/lib/session";
import ProductCard from "@/components/ProductCard";
import BuyButton from "@/components/BuyButton";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";
import { ProductSupportBox } from "@/components/DiscordCta";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Ctx) {
  const { slug } = await params;

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);
  const product = rows[0];
  if (!product) notFound();

  const user = await getSessionUser();

  let purchaseStatus: "none" | "pending" | "completed" = "none";
  if (user) {
    const owned = await db
      .select({ status: purchases.status })
      .from(purchases)
      .where(and(eq(purchases.userId, user.id), eq(purchases.productId, product.id)))
      .limit(1);
    if (owned[0]) purchaseStatus = owned[0].status === "completed" ? "completed" : "pending";
  }

  const updates = await db
    .select()
    .from(productUpdates)
    .where(eq(productUpdates.productId, product.id))
    .orderBy(desc(productUpdates.createdAt))
    .limit(8);

  const relatedRows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        eq(products.category, product.category),
        ne(products.id, product.id),
      ),
    )
    .limit(3);
  const related = relatedRows.map(publicProduct);

  const gamePassUrl = product.gamePassId
    ? `https://www.roblox.com/game-pass/${product.gamePassId}`
    : null;

  return (
    <div className="vx-container pt-24 sm:pt-28">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/shop" className="transition-colors hover:text-white">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${product.category}`}
          className="transition-colors hover:text-white"
        >
          {categoryLabel(product.category)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.55fr_1fr]">
        {/* ------------------------- left column ------------------------- */}
        <div>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-violet-950/30">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-950/40">
                  <CategoryIcon slug={product.category} className="h-16 w-16 text-violet-400/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/12 bg-black/55 px-3 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                <CategoryIcon slug={product.category} className="h-3.5 w-3.5 text-violet-300" />
                {categoryLabel(product.category)}
              </div>
              {product.featured && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </div>
              )}
            </div>
          </Reveal>

          {/* description */}
          <Reveal delay={0.05}>
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-white">
                About this product
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-zinc-400">
                {product.description.split(/\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </Reveal>

          {/* features */}
          {product.features.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-white">Features</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <div
                      key={feature}
                      className="panel flex items-start gap-3 rounded-xl p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/25">
                        <Check className="h-3 w-3 text-violet-300" />
                      </span>
                      <p className="text-sm leading-relaxed text-zinc-300">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* update history */}
          {updates.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-10">
                <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold text-white">
                  <History className="h-5 w-5 text-violet-400" />
                  Update history
                </h2>
                <div className="mt-5 space-y-0.5 border-l border-white/10 pl-6">
                  {updates.map((update) => (
                    <div key={update.id} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-violet-500 bg-void" />
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-md border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-violet-300">
                          v{update.version}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {update.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {update.notes}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-zinc-600">
                  Owners receive every future update automatically — no extra
                  charge, ever.
                </p>
              </div>
            </Reveal>
          )}
        </div>

        {/* ------------------------- right column ------------------------ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.1}>
            <div className="panel-strong rounded-3xl p-6 sm:p-7">
              <h1 className="font-display text-3xl font-bold leading-tight text-white">
                {product.name}
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-500">
                {product.shortDescription}
              </p>

              <div className="mt-6 flex items-end justify-between border-y border-white/8 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Price
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-gradient">
                    {formatRobux(product.priceRobux)}
                  </p>
                </div>
                <p className="pb-1 text-xs text-zinc-600">one-time purchase</p>
              </div>

              <div className="mt-6">
                <BuyButton
                  productId={product.id}
                  productName={product.name}
                  priceRobux={product.priceRobux}
                  version={product.version}
                  loggedIn={Boolean(user)}
                  purchaseStatus={purchaseStatus}
                  gamePassUrl={gamePassUrl}
                  next={`/shop/${product.slug}`}
                />
              </div>

              <dl className="mt-7 space-y-3.5 border-t border-white/8 pt-6 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <Tag className="h-4 w-4 text-violet-400" />
                    Version
                  </dt>
                  <dd className="font-mono font-semibold text-white">
                    {product.version}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <MonitorCog className="h-4 w-4 text-violet-400" />
                    Compatibility
                  </dt>
                  <dd className="text-right font-medium text-zinc-200">
                    {product.studioVersion}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <FolderOpen className="h-4 w-4 text-violet-400" />
                    Category
                  </dt>
                  <dd className="font-medium text-zinc-200">
                    {categoryLabel(product.category)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <History className="h-4 w-4 text-violet-400" />
                    Last updated
                  </dt>
                  <dd className="font-medium text-zinc-200">
                    {product.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-5">
            <ProductSupportBox />
          </Reveal>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-white">
              More {categoryLabel(product.category)}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

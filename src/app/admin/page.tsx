import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  Package,
  ShoppingCart,
  Users,
  Coins,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { pool, db } from "@/db";
import { products, purchases, users } from "@/db/schema";
import { formatRobux } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin" };

interface OverviewStats {
  products: number;
  published: number;
  sales: number;
  pending: number;
  revenue: number;
  buyers: number;
}

async function getStats(): Promise<OverviewStats> {
  const result = await pool.query<OverviewStats>(`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM products WHERE status = 'published') AS published,
      (SELECT COUNT(*)::int FROM purchases WHERE status = 'completed') AS sales,
      (SELECT COUNT(*)::int FROM purchases WHERE status = 'pending') AS pending,
      (SELECT COALESCE(SUM(price_paid), 0)::int FROM purchases WHERE status = 'completed') AS revenue,
      (SELECT COUNT(DISTINCT user_id)::int FROM purchases WHERE status = 'completed') AS buyers
  `);
  return result.rows[0] ?? { products: 0, published: 0, sales: 0, pending: 0, revenue: 0, buyers: 0 };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const recent = await db
    .select({
      id: purchases.id,
      status: purchases.status,
      pricePaid: purchases.pricePaid,
      createdAt: purchases.createdAt,
      username: users.username,
      displayName: users.displayName,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(purchases)
    .innerJoin(users, eq(users.id, purchases.userId))
    .innerJoin(products, eq(products.id, purchases.productId))
    .orderBy(desc(purchases.createdAt))
    .limit(12);

  const topResult = await pool.query<{ name: string; slug: string; sales: number; revenue: number }>(`
    SELECT p.name, p.slug, COUNT(*)::int AS sales, COALESCE(SUM(pr.price_paid), 0)::int AS revenue
    FROM purchases pr
    JOIN products p ON p.id = pr.product_id
    WHERE pr.status = 'completed'
    GROUP BY p.id, p.name, p.slug
    ORDER BY sales DESC
    LIMIT 5
  `);
  const top = topResult.rows;
  const maxSales = Math.max(1, ...top.map((t) => t.sales));

  const cards = [
    { icon: Coins, label: "Total revenue", value: formatRobux(stats.revenue), accent: "text-violet-300" },
    { icon: ShoppingCart, label: "Completed sales", value: String(stats.sales), accent: "text-emerald-300" },
    { icon: Users, label: "Unique buyers", value: String(stats.buyers), accent: "text-indigo-300" },
    { icon: Package, label: "Products", value: `${stats.published} / ${stats.products}`, accent: "text-fuchsia-300" },
  ];

  return (
    <div className="space-y-8">
      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {card.label}
              </p>
              <card.icon className={`h-4.5 w-4.5 ${card.accent}`} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {stats.pending > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4">
          <TrendingUp className="h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-sm text-amber-200">
            {stats.pending} purchase{stats.pending === 1 ? "" : "s"} pending
            verification — buyers are mid-checkout on roblox.com.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* recent sales */}
        <div className="panel overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-white">Recent sales</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
            >
              Manage products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recent.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {sale.displayName}
                      <span className="text-zinc-500"> @{sale.username}</span>
                    </p>
                    <p className="truncate text-xs text-zinc-500">{sale.productName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        sale.status === "completed"
                          ? "bg-emerald-500/12 text-emerald-300"
                          : "bg-amber-500/12 text-amber-300"
                      }`}
                    >
                      {sale.status}
                    </span>
                    <span className="w-20 text-right font-mono text-xs text-zinc-400">
                      {formatRobux(sale.pricePaid)}
                    </span>
                    <span className="hidden w-24 text-right text-xs text-zinc-600 sm:block">
                      {sale.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-zinc-500">
              No sales yet — share your shop link to get started.
            </p>
          )}
        </div>

        {/* top products */}
        <div className="panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">Top products</h2>
          {top.length > 0 ? (
            <div className="mt-5 space-y-4">
              {top.map((item) => (
                <div key={item.slug}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="truncate font-medium text-zinc-200">{item.name}</p>
                    <p className="shrink-0 text-xs text-zinc-500">
                      {item.sales} sale{item.sales === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${(item.sales / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-500">
              Sales data will appear here once buyers start purchasing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

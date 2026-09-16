import Link from "next/link";
import { desc } from "drizzle-orm";
import { PlusCircle } from "lucide-react";
import { pool, db } from "@/db";
import { products } from "@/db/schema";
import ProductsTable, { type AdminProductRow } from "@/components/admin/ProductsTable";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products · Admin" };

export default async function AdminProductsPage() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));

  const salesResult = await pool.query<{ id: string; sales: number }>(`
    SELECT product_id AS id, COUNT(*)::int AS sales
    FROM purchases
    WHERE status = 'completed'
    GROUP BY product_id
  `);
  const salesMap = new Map(salesResult.rows.map((r) => [r.id, r.sales]));

  const tableRows: AdminProductRow[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceRobux: p.priceRobux,
    version: p.version,
    status: p.status,
    featured: p.featured,
    image: p.images[0] ?? null,
    sales: salesMap.get(p.id) ?? 0,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {rows.length} product{rows.length === 1 ? "" : "s"} ·{" "}
          {rows.filter((p) => p.status === "published").length} published
        </p>
        <Link
          href="/admin/products/new"
          className="btn-glow flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          <PlusCircle className="h-4 w-4" />
          New Product
        </Link>
      </div>
      <ProductsTable rows={tableRows} />
    </div>
  );
}

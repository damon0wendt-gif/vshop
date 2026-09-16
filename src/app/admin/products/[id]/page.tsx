import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import ProductForm, { type EditableProduct } from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Product · Admin" };

type Ctx = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Ctx) {
  const { id } = await params;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = rows[0];
  if (!product) notFound();

  const editable: EditableProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    priceRobux: product.priceRobux,
    version: product.version,
    studioVersion: product.studioVersion,
    images: product.images,
    fileUrl: product.fileUrl,
    fileName: product.fileName,
    gamePassId: product.gamePassId,
    status: product.status,
    featured: product.featured,
  };

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-white">
        Edit <span className="text-gradient">{product.name}</span>
      </h2>
      <ProductForm initial={editable} />
    </div>
  );
}

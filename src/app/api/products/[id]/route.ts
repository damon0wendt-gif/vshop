import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, productUpdates } from "@/db/schema";
import { publicProduct, adminProduct, productInputSchema } from "@/lib/products";
import { requireAdmin, badRequest, forbidden, notFound } from "@/lib/guards";
import { getSessionUser } from "@/lib/session";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const partialUpdateSchema = z
  .object({
    status: z.enum(["draft", "published"]).optional(),
    featured: z.boolean().optional(),
  })
  .strict()
  .refine((d) => d.status !== undefined || d.featured !== undefined);

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = rows[0];
  if (!product) return notFound("Product not found.");

  const user = await getSessionUser();
  if (user?.isAdmin) return NextResponse.json({ product: adminProduct(product) });
  if (product.status !== "published") return notFound("Product not found.");
  return NextResponse.json({ product: publicProduct(product) });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const rl = rateLimit(`admin-products:${admin.id}`, 40, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { id } = await ctx.params;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const existing = rows[0];
  if (!existing) return notFound("Product not found.");

  const rawBody: unknown = await request.json().catch(() => null);

  // Lightweight toggle path (status / featured) used by the products table.
  const partialParsed = partialUpdateSchema.safeParse(rawBody);
  if (partialParsed.success) {
    const updated = await db
      .update(products)
      .set({ ...partialParsed.data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return NextResponse.json({ product: adminProduct(updated[0]) });
  }

  const parsed = productInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }
  const input = parsed.data;
  const slug = input.slug?.trim() || existing.slug;

  if (slug !== existing.slug) {
    const taken = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (taken[0]) return badRequest("A product with this slug already exists.");
  }

  const updated = await db
    .update(products)
    .set({
      slug,
      name: input.name,
      category: input.category,
      shortDescription: input.shortDescription,
      description: input.description,
      features: input.features,
      priceRobux: input.priceRobux,
      version: input.version,
      studioVersion: input.studioVersion,
      images: input.images,
      fileUrl: input.fileUrl || null,
      fileName: input.fileName || null,
      gamePassId: input.gamePassId || null,
      status: input.status,
      featured: input.featured,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  // Publishing a new version automatically notifies every owner — purchases
  // always serve the latest version through the download endpoint.
  if (input.version !== existing.version && input.changelogNotes?.trim()) {
    await db.insert(productUpdates).values({
      productId: id,
      version: input.version,
      notes: input.changelogNotes.trim(),
    });
  }

  return NextResponse.json({ product: adminProduct(updated[0]) });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const rl = rateLimit(`admin-products:${admin.id}`, 20, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { id } = await ctx.params;
  const rows = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
  if (!rows[0]) return notFound("Product not found.");
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}

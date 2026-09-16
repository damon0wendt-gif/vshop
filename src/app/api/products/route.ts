import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productUpdates } from "@/db/schema";
import { publicProduct, adminProduct, productInputSchema } from "@/lib/products";
import { requireAdmin, badRequest, forbidden } from "@/lib/guards";
import { slugify } from "@/lib/constants";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const conditions = [eq(products.status, "published")];
  if (category) conditions.push(eq(products.category, category));
  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.featured), desc(products.createdAt));
  return NextResponse.json({ products: rows.map(publicProduct) });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return forbidden();

  const rl = rateLimit(`admin-products:${admin.id}`, 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = productInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid product data.");
  }
  const input = parsed.data;
  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) return badRequest("Could not derive a valid slug.");

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (existing[0]) return badRequest("A product with this slug already exists.");

  const inserted = await db
    .insert(products)
    .values({
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
    })
    .returning();

  const created = inserted[0];
  if (input.changelogNotes?.trim()) {
    await db.insert(productUpdates).values({
      productId: created.id,
      version: created.version,
      notes: input.changelogNotes.trim(),
    });
  }
  return NextResponse.json({ product: adminProduct(created) }, { status: 201 });
}

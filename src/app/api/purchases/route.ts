import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, purchases } from "@/db/schema";
import { publicProduct } from "@/lib/products";
import { requireUser, unauthorized, badRequest } from "@/lib/guards";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({ productId: z.string().uuid() });

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const rows = await db
    .select({ purchase: purchases, product: products })
    .from(purchases)
    .innerJoin(products, eq(products.id, purchases.productId))
    .where(and(eq(purchases.userId, user.id), eq(purchases.status, "completed")))
    .orderBy(desc(purchases.createdAt));

  return NextResponse.json({
    purchases: rows.map((r) => ({
      id: r.purchase.id,
      status: r.purchase.status,
      pricePaid: r.purchase.pricePaid,
      createdAt: r.purchase.createdAt.toISOString(),
      product: publicProduct(r.product),
    })),
  });
}

/**
 * Starts a purchase. Money never touches this site: when a product has an
 * official Roblox Game Pass configured, the buyer is sent to roblox.com to
 * complete the purchase and then verifies ownership here. In demo mode (no
 * game pass configured) the order completes instantly so the full flow can
 * be explored.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const rl = rateLimit(`checkout:${user.id}:${clientIp(request)}`, 12, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid product.");
  const { productId } = parsed.data;

  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = productRows[0];
  if (!product || product.status !== "published") {
    return NextResponse.json({ error: "Product unavailable." }, { status: 404 });
  }

  const existingRows = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, user.id), eq(purchases.productId, productId)))
    .limit(1);
  const existing = existingRows[0];

  if (existing?.status === "completed") {
    return NextResponse.json({ mode: "owned", alreadyOwned: true });
  }

  if (product.gamePassId) {
    if (!existing) {
      await db.insert(purchases).values({
        userId: user.id,
        productId,
        status: "pending",
        pricePaid: product.priceRobux,
      });
    }
    return NextResponse.json({
      mode: "gamepass",
      gamePassUrl: `https://www.roblox.com/game-pass/${product.gamePassId}`,
      gamePassId: product.gamePassId,
    });
  }

  // Demo checkout — no real Robux involved.
  if (existing) {
    await db
      .update(purchases)
      .set({ status: "completed", pricePaid: product.priceRobux })
      .where(eq(purchases.id, existing.id));
  } else {
    await db.insert(purchases).values({
      userId: user.id,
      productId,
      status: "completed",
      pricePaid: product.priceRobux,
    });
  }
  return NextResponse.json({ mode: "complete", demo: true });
}

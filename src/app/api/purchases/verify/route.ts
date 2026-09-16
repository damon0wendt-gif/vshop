import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, purchases } from "@/db/schema";
import { requireUser, unauthorized, badRequest } from "@/lib/guards";
import { userOwnsGamePass } from "@/lib/roblox";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/session";

export const dynamic = "force-dynamic";

const verifySchema = z.object({ productId: z.string().uuid() });

/**
 * Verifies ownership of the official Roblox Game Pass through the public
 * Roblox inventory API and unlocks the product on success.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const rl = rateLimit(`verify:${user.id}:${clientIp(request)}`, 12, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = verifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid product.");
  const { productId } = parsed.data;

  const productRows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  const product = productRows[0];
  if (!product) return badRequest("Product unavailable.");

  if (!product.gamePassId) {
    return NextResponse.json({ mode: "complete", verified: true });
  }

  const owned = await userOwnsGamePass(user.robloxId, product.gamePassId);
  if (!owned) {
    return NextResponse.json(
      {
        verified: false,
        error:
          "Game pass purchase not detected yet. If you just bought it, wait a few seconds and try again — or make sure your Roblox inventory is public.",
      },
      { status: 402 },
    );
  }

  const existingRows = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, user.id), eq(purchases.productId, productId)))
    .limit(1);

  if (existingRows[0]) {
    await db
      .update(purchases)
      .set({ status: "completed", pricePaid: product.priceRobux })
      .where(eq(purchases.id, existingRows[0].id));
  } else {
    await db.insert(purchases).values({
      userId: user.id,
      productId,
      status: "completed",
      pricePaid: product.priceRobux,
    });
  }

  return NextResponse.json({ verified: true });
}

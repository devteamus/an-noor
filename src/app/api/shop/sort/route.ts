import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const sortSchema = z.object({
  // Array of { id, sortOrder } — admin batch reorder
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int(),
      })
    )
    .min(1, "কমপক্ষে একটি আইটেম দিন।"),
});

/**
 * PUT /api/shop/sort (admin only)
 *
 * Body: { items: [{ id, sortOrder }, ...] }
 *
 * Batch-updates the sortOrder of multiple products. Used by the admin
 * "sort up/down" buttons (and would support drag-and-drop).
 */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "অমান্য JSON।" }, { status: 400 });
  }
  const parsed = sortSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "অমান্য তথ্য।" },
      { status: 400 }
    );
  }
  const { items } = parsed.data;

  // Run as a single transaction for atomicity.
  await db.$transaction(
    items.map((it) =>
      db.shopProduct.update({
        where: { id: it.id },
        data: { sortOrder: it.sortOrder },
      })
    )
  );

  return NextResponse.json({ ok: true, updated: items.length });
}

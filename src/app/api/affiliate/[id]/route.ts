import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * DELETE /api/affiliate/[id] (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.affiliateProduct.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "প্রোডাক্ট পাওয়া যায়নি।" },
      { status: 404 }
    );
  }
  await db.affiliateProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

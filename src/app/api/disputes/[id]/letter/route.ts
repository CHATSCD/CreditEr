import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAiStrategy } from "@/lib/ai-strategy";
import { generateLetter } from "@/lib/letter-templates";
import type { ItemType } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      select: { letterContent: true },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ letterContent: dispute.letterContent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { creditItem: true },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "AI regeneration requires DEEPSEEK_API_KEY" },
        { status: 503 }
      );
    }

    const item = dispute.creditItem;
    const aiResult = await getAiStrategy({
      itemType: item.itemType as ItemType,
      creditorName: item.creditorName,
      amount: item.amount,
      dateReported: item.dateReported,
      notes: item.notes,
    });

    const letterContent = generateLetter(aiResult.strategy, dispute.bureau, {
      creditorName: item.creditorName,
      accountNumber: item.accountNumber || "N/A",
      lawCitation: aiResult.lawCitation,
      outline: aiResult.letterOutline,
      amount: item.amount ? `$${item.amount.toFixed(2)}` : undefined,
      dateReported: item.dateReported
        ? new Date(item.dateReported).toLocaleDateString()
        : undefined,
    });

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        strategy: aiResult.strategy,
        strategySource: "ai",
        lawCitation: aiResult.lawCitation,
        letterContent,
      },
    });

    return NextResponse.json({
      letterContent: updated.letterContent,
      strategy: updated.strategy,
      lawCitation: updated.lawCitation,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

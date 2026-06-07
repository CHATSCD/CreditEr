import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { selectStrategy } from "@/lib/strategy-engine";
import { getAiStrategy } from "@/lib/ai-strategy";
import { generateLetter } from "@/lib/letter-templates";
import type { ItemType } from "@/types";
import { z } from "zod";

const CreateItemSchema = z.object({
  creditorName: z.string().min(1),
  accountNumber: z.string().optional(),
  itemType: z.string(),
  amount: z.number().optional().nullable(),
  dateReported: z.string().optional().nullable(),
  dateOpened: z.string().optional().nullable(),
  bureaus: z.array(z.string()).min(1),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateItemSchema.parse(body);

    // Run strategy engine
    let strategyResult = selectStrategy({
      itemType: data.itemType as ItemType,
      amount: data.amount,
      dateReported: data.dateReported ? new Date(data.dateReported) : null,
      notes: data.notes,
    });

    // Fall back to AI if no rule matched
    if (!strategyResult && process.env.ANTHROPIC_API_KEY) {
      strategyResult = await getAiStrategy({
        itemType: data.itemType as ItemType,
        creditorName: data.creditorName,
        amount: data.amount,
        dateReported: data.dateReported ? new Date(data.dateReported) : null,
        notes: data.notes,
      });
    }

    if (!strategyResult) {
      strategyResult = {
        strategy: "FCRA_611_GENERAL",
        lawCitation: "15 U.S.C. § 1681i (FCRA § 611)",
        letterOutline:
          "Dispute this item as inaccurate or unverifiable under FCRA § 611.",
        source: "rules",
      };
    }

    // Create the credit item
    const creditItem = await prisma.creditItem.create({
      data: {
        creditorName: data.creditorName,
        accountNumber: data.accountNumber ?? null,
        itemType: data.itemType,
        amount: data.amount ?? null,
        dateReported: data.dateReported ? new Date(data.dateReported) : null,
        dateOpened: data.dateOpened ? new Date(data.dateOpened) : null,
        bureaus: JSON.stringify(data.bureaus),
        notes: data.notes ?? null,
      },
    });

    // Create one dispute per bureau
    const disputes = await Promise.all(
      data.bureaus.map((bureau) => {
        const letterContent = generateLetter(strategyResult!.strategy, bureau, {
          creditorName: data.creditorName,
          accountNumber: data.accountNumber || "N/A",
          lawCitation: strategyResult!.lawCitation,
          outline: strategyResult!.letterOutline,
          amount: data.amount ? `$${data.amount.toFixed(2)}` : undefined,
          dateReported: data.dateReported
            ? new Date(data.dateReported).toLocaleDateString()
            : undefined,
        });

        return prisma.dispute.create({
          data: {
            creditItemId: creditItem.id,
            bureau,
            strategy: strategyResult!.strategy,
            strategySource: strategyResult!.source,
            lawCitation: strategyResult!.lawCitation,
            letterContent,
          },
        });
      })
    );

    return NextResponse.json({ creditItem, disputes }, { status: 201 });
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

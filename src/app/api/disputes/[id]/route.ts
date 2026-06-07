import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const PatchSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
  outcome: z.string().optional().nullable(),
  sentAt: z.string().optional().nullable(),
  responseAt: z.string().optional().nullable(),
  resolvedAt: z.string().optional().nullable(),
});

export async function GET(
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

    return NextResponse.json({
      ...dispute,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
      sentAt: dispute.sentAt?.toISOString() ?? null,
      responseAt: dispute.responseAt?.toISOString() ?? null,
      resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
      creditItem: {
        ...dispute.creditItem,
        bureaus: JSON.parse(dispute.creditItem.bureaus as string),
        createdAt: dispute.creditItem.createdAt.toISOString(),
        dateReported: dispute.creditItem.dateReported?.toISOString() ?? null,
        dateOpened: dispute.creditItem.dateOpened?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = PatchSchema.parse(body);

    const update: Record<string, unknown> = {};
    if (data.status !== undefined) update.status = data.status;
    if (data.outcome !== undefined) update.outcome = data.outcome;
    if (data.sentAt !== undefined)
      update.sentAt = data.sentAt ? new Date(data.sentAt) : null;
    if (data.responseAt !== undefined)
      update.responseAt = data.responseAt ? new Date(data.responseAt) : null;
    if (data.resolvedAt !== undefined)
      update.resolvedAt = data.resolvedAt ? new Date(data.resolvedAt) : null;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: update,
    });

    return NextResponse.json({
      ...dispute,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
      sentAt: dispute.sentAt?.toISOString() ?? null,
      responseAt: dispute.responseAt?.toISOString() ?? null,
      resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

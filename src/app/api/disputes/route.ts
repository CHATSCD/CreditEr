import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      include: { creditItem: true },
      orderBy: { createdAt: "desc" },
    });

    const serialized = disputes.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      sentAt: d.sentAt?.toISOString() ?? null,
      responseAt: d.responseAt?.toISOString() ?? null,
      resolvedAt: d.resolvedAt?.toISOString() ?? null,
      creditItem: {
        ...d.creditItem,
        bureaus: JSON.parse(d.creditItem.bureaus as string),
        createdAt: d.creditItem.createdAt.toISOString(),
        dateReported: d.creditItem.dateReported?.toISOString() ?? null,
        dateOpened: d.creditItem.dateOpened?.toISOString() ?? null,
      },
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

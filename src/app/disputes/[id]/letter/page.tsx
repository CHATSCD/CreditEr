import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import LetterClient from "./LetterClient";

export default async function LetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: { creditItem: true },
  });

  if (!dispute) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Link
          href={`/disputes/${dispute.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispute
        </Link>
        <div className="text-gray-300">|</div>
        <div>
          <span className="text-sm font-medium text-gray-900">
            {dispute.creditItem.creditorName}
          </span>
          <span className="text-sm text-gray-400 ml-2">→ {dispute.bureau}</span>
        </div>
      </div>

      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Letter</h1>
        <p className="text-sm text-gray-500 mt-1">
          Strategy:{" "}
          <span className="font-mono text-blue-700">{dispute.strategy}</span>
          {dispute.lawCitation && (
            <span className="ml-2 text-gray-400">— {dispute.lawCitation}</span>
          )}
        </p>
      </div>

      <LetterClient disputeId={dispute.id} initialLetter={dispute.letterContent} />
    </div>
  );
}

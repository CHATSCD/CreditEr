import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ITEM_TYPE_LABELS, STATUS_LABELS } from "@/types";
import type { ItemType, DisputeStatus } from "@/types";
import StatusControls from "./StatusControls";
import {
  ArrowLeft,
  FileText,
  Scale,
  Calendar,
  DollarSign,
  Building2,
  Bot,
  Wrench,
} from "lucide-react";

const STATUS_COLORS: Record<DisputeStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const TIMELINE_STEPS: { status: DisputeStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft Created" },
  { status: "SENT", label: "Letter Sent" },
  { status: "IN_REVIEW", label: "Bureau Responded" },
  { status: "RESOLVED", label: "Resolved" },
];

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  SENT: 1,
  IN_REVIEW: 2,
  RESOLVED: 3,
  REJECTED: 2,
};

export default async function DisputePage({
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

  const item = dispute.creditItem;
  const bureaus = JSON.parse(item.bureaus as string) as string[];
  const currentStep = STATUS_ORDER[dispute.status] ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {item.creditorName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  STATUS_COLORS[dispute.status as DisputeStatus] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {STATUS_LABELS[dispute.status as DisputeStatus] ??
                  dispute.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {ITEM_TYPE_LABELS[item.itemType as ItemType] ?? item.itemType}
              {item.accountNumber && (
                <span className="ml-2 font-mono text-xs text-gray-400">
                  #{item.accountNumber}
                </span>
              )}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
            {dispute.bureau}
          </span>
        </div>

        {/* Detail chips */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {item.amount != null && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-gray-400" />
              ${item.amount.toFixed(2)}
            </span>
          )}
          {item.dateReported && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Reported {new Date(item.dateReported).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-400" />
            {bureaus.join(", ")}
          </span>
        </div>
      </div>

      {/* Strategy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Dispute Strategy</h2>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 ml-auto">
            {dispute.strategySource === "ai" ? (
              <>
                <Bot className="w-3 h-3" /> AI
              </>
            ) : (
              <>
                <Wrench className="w-3 h-3" /> Rules
              </>
            )}
          </span>
        </div>
        <div className="text-sm font-mono text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
          {dispute.strategy}
        </div>
        {dispute.lawCitation && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Legal basis:</span>{" "}
            {dispute.lawCitation}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="flex items-center gap-0">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i <= currentStep && dispute.status !== "REJECTED";
            const rejected = dispute.status === "REJECTED" && i === currentStep;
            return (
              <div key={step.status} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      rejected
                        ? "border-red-400 bg-red-50 text-red-600"
                        : done
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {rejected ? "✗" : done ? "✓" : i + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs text-center leading-tight ${
                      done ? "text-gray-900 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 mx-1 ${
                      i < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/disputes/${dispute.id}/letter`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Letter
          </Link>
          <StatusControls
            disputeId={dispute.id}
            currentStatus={dispute.status as DisputeStatus}
          />
        </div>
      </div>

      {item.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}
    </div>
  );
}

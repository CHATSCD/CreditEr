import Link from "next/link";
import { prisma } from "@/lib/db";
import { ITEM_TYPE_LABELS, STATUS_LABELS } from "@/types";
import type { ItemType, DisputeStatus } from "@/types";
import { FileText, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";

const STATUS_COLORS: Record<DisputeStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const BUREAU_COLORS: Record<string, string> = {
  Equifax: "bg-red-50 text-red-700 border border-red-200",
  Experian: "bg-blue-50 text-blue-700 border border-blue-200",
  TransUnion: "bg-purple-50 text-purple-700 border border-purple-200",
};

export default async function DashboardPage() {
  const disputes = await prisma.dispute.findMany({
    include: { creditItem: true },
    orderBy: { createdAt: "desc" },
  });

  const total = disputes.length;
  const active = disputes.filter((d) =>
    ["SENT", "IN_REVIEW"].includes(d.status)
  ).length;
  const resolved = disputes.filter((d) => d.status === "RESOLVED").length;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your credit report disputes
          </p>
        </div>
        <Link
          href="/items/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Dispute
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-gray-500" />}
          label="Total Disputes"
          value={total}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          label="Active"
          value={active}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          label="Resolved"
          value={resolved}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-purple-500" />}
          label="Success Rate"
          value={`${successRate}%`}
        />
      </div>

      {disputes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">All Disputes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {disputes.map((dispute) => (
              <Link
                key={dispute.id}
                href={`/disputes/${dispute.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">
                      {dispute.creditItem.creditorName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        BUREAU_COLORS[dispute.bureau] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {dispute.bureau}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {ITEM_TYPE_LABELS[dispute.creditItem.itemType as ItemType] ??
                      dispute.creditItem.itemType}
                    {dispute.creditItem.accountNumber && (
                      <span className="ml-2 font-mono text-xs text-gray-400">
                        #{dispute.creditItem.accountNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </span>
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
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
        <FileText className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No disputes yet
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        Add an item from your credit report and we&apos;ll automatically pick
        the best dispute strategy based on current U.S. credit laws.
      </p>
      <Link
        href="/items/new"
        className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Your First Item
      </Link>
    </div>
  );
}

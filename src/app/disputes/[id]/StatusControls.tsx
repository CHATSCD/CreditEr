"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { DisputeStatus } from "@/types";

const NEXT_STATUS: Partial<Record<DisputeStatus, { next: DisputeStatus; label: string }>> = {
  DRAFT: { next: "SENT", label: "Mark as Sent" },
  SENT: { next: "IN_REVIEW", label: "Mark In Review" },
  IN_REVIEW: { next: "RESOLVED", label: "Mark Resolved" },
};

export default function StatusControls({
  disputeId,
  currentStatus,
}: {
  disputeId: string;
  currentStatus: DisputeStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const transition = NEXT_STATUS[currentStatus];

  async function advance() {
    if (!transition) return;
    setLoading(true);
    const now = new Date().toISOString();
    const body: Record<string, string> = { status: transition.next };
    if (transition.next === "SENT") body.sentAt = now;
    if (transition.next === "IN_REVIEW") body.responseAt = now;
    if (transition.next === "RESOLVED") body.resolvedAt = now;

    await fetch(`/api/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    router.refresh();
  }

  async function markRejected() {
    setLoading(true);
    await fetch(`/api/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transition && (
        <button
          onClick={advance}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {transition.label}
        </button>
      )}
      {(currentStatus === "SENT" || currentStatus === "IN_REVIEW") && (
        <button
          onClick={markRejected}
          disabled={loading}
          className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Mark Rejected
        </button>
      )}
    </div>
  );
}

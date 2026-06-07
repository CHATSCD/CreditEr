"use client";

import { useState } from "react";
import { Download, RefreshCw, Printer, Loader2 } from "lucide-react";

export default function LetterClient({
  disputeId,
  initialLetter,
}: {
  disputeId: string;
  initialLetter: string;
}) {
  const [letter, setLetter] = useState(initialLetter);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/letter`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Regeneration failed");
      }
      const data = await res.json();
      setLetter(data.letterContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRegenerating(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit-dispute-${disputeId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function print() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          onClick={downloadTxt}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download (.txt)
        </button>
        <button
          onClick={print}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="flex items-center gap-2 border border-purple-300 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {regenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Regenerate with AI
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 print:hidden">
          {error}
        </div>
      )}

      {/* Letter paper */}
      <div
        id="letter-paper"
        className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 shadow-sm print:shadow-none print:border-none print:rounded-none print:p-0"
      >
        <pre className="whitespace-pre-wrap font-serif text-sm text-gray-900 leading-relaxed">
          {letter}
        </pre>
      </div>

      <style>{`
        @media print {
          body > *:not(#print-root) { display: none; }
          #letter-paper { display: block !important; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

import AddItemForm from "./AddItemForm";
import { BookOpen } from "lucide-react";

export default function NewItemPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Credit Report Item</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter the details of the negative item. We&apos;ll automatically select
          the best dispute strategy under current U.S. credit laws.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">How it works</p>
          <p className="mt-1 text-blue-700">
            Our engine checks FCRA §§ 604, 605, 609, 611, FDCPA § 809, and CFPB
            rules to pick the strongest dispute approach. For edge cases it falls
            back to AI analysis.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <AddItemForm />
      </div>
    </div>
  );
}

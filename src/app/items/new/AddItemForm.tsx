"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ITEM_TYPE_LABELS, BUREAUS } from "@/types";
import { Loader2 } from "lucide-react";

const schema = z.object({
  creditorName: z.string().min(1, "Creditor name is required"),
  accountNumber: z.string().optional(),
  itemType: z.string().min(1, "Item type is required"),
  amount: z.string().optional(),
  dateReported: z.string().optional(),
  dateOpened: z.string().optional(),
  bureaus: z.array(z.string()).min(1, "Select at least one bureau"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddItemForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bureaus: [] },
  });

  const selectedBureaus = watch("bureaus") ?? [];

  function toggleBureau(bureau: string) {
    if (selectedBureaus.includes(bureau)) {
      setValue(
        "bureaus",
        selectedBureaus.filter((b) => b !== bureau),
        { shouldValidate: true }
      );
    } else {
      setValue("bureaus", [...selectedBureaus, bureau], {
        shouldValidate: true,
      });
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: data.amount ? parseFloat(data.amount) : null,
          dateReported: data.dateReported || null,
          dateOpened: data.dateOpened || null,
          accountNumber: data.accountNumber || null,
          notes: data.notes || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create dispute");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Creditor */}
      <Field label="Creditor / Furnisher Name" error={errors.creditorName?.message} required>
        <input
          {...register("creditorName")}
          className={inputCls(!!errors.creditorName)}
          placeholder="e.g. Portfolio Recovery Associates"
        />
      </Field>

      {/* Account Number */}
      <Field label="Account Number" hint="Last 4 digits is fine">
        <input
          {...register("accountNumber")}
          className={inputCls(false)}
          placeholder="e.g. ****1234"
        />
      </Field>

      {/* Item Type */}
      <Field label="Item Type" error={errors.itemType?.message} required>
        <select {...register("itemType")} className={inputCls(!!errors.itemType)}>
          <option value="">Select item type...</option>
          {Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Amount */}
        <Field label="Reported Amount ($)">
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            min="0"
            className={inputCls(false)}
            placeholder="0.00"
          />
        </Field>

        {/* Date Reported */}
        <Field label="Date First Reported">
          <input {...register("dateReported")} type="date" className={inputCls(false)} />
        </Field>

        {/* Date Opened */}
        <Field label="Date Opened">
          <input {...register("dateOpened")} type="date" className={inputCls(false)} />
        </Field>
      </div>

      {/* Bureaus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Credit Bureau(s) <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {BUREAUS.map((bureau) => {
            const selected = selectedBureaus.includes(bureau);
            return (
              <button
                key={bureau}
                type="button"
                onClick={() => toggleBureau(bureau)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
                }`}
              >
                {bureau}
              </button>
            );
          })}
        </div>
        {errors.bureaus && (
          <p className="mt-1 text-xs text-red-600">{errors.bureaus.message}</p>
        )}
      </div>

      {/* Notes */}
      <Field label="Additional Notes" hint="Any context that may help determine the best strategy">
        <textarea
          {...register("notes")}
          rows={3}
          className={inputCls(false)}
          placeholder="e.g. This account is not mine. The balance is wrong. This is from a car accident..."
        />
      </Field>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Analyzing & Creating..." : "Create Dispute"}
        </button>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
    hasError ? "border-red-400" : "border-gray-300"
  }`;
}

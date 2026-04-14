"use client";

import { useActionState } from "react";
import { duplicateHumorFlavor } from "@/lib/actions/humor-flavors";
import type { DuplicateHumorFlavorResult } from "@/lib/actions/humor-flavors";

type DuplicateFlavorHeaderActionProps = {
  humorFlavorId: number;
};

export default function DuplicateFlavorHeaderAction({
  humorFlavorId,
}: DuplicateFlavorHeaderActionProps) {
  const [duplicateState, duplicateAction, duplicatePending] = useActionState<
    DuplicateHumorFlavorResult | null,
    FormData
  >(duplicateHumorFlavor, null);

  return (
    <form action={duplicateAction} className="space-y-2">
      <input type="hidden" name="id" value={humorFlavorId} />
      {duplicateState?.ok === false ? (
        <p className="text-left text-sm text-rose-700 dark:text-rose-300" role="status" aria-live="polite">
          {duplicateState.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={duplicatePending}
        aria-busy={duplicatePending}
        className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)] dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
      >
        {duplicatePending ? "Duplicating..." : "Duplicate Flavor"}
      </button>
    </form>
  );
}

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
        className="admin-button-primary px-3 py-2 text-xs uppercase tracking-[0.08em] disabled:opacity-70"
      >
        {duplicatePending ? "Duplicating..." : "Duplicate Flavor"}
      </button>
    </form>
  );
}

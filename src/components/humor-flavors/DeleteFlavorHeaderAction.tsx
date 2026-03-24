"use client";

import { useActionState } from "react";
import { deleteHumorFlavor } from "@/lib/actions/humor-flavors";
import type { DeleteHumorFlavorResult } from "@/lib/actions/humor-flavors";

type DeleteFlavorHeaderActionProps = {
  humorFlavorId: number;
};

export default function DeleteFlavorHeaderAction({
  humorFlavorId,
}: DeleteFlavorHeaderActionProps) {
  const [deleteState, deleteAction, deletePending] = useActionState<
    DeleteHumorFlavorResult | null,
    FormData
  >(deleteHumorFlavor, null);

  return (
    <form
      action={deleteAction}
      className="space-y-2"
      onSubmit={(event) => {
        if (
          !window.confirm("Delete this flavor and all of its steps? This action cannot be undone.")
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={humorFlavorId} />
      {deleteState?.ok === false ? (
        <p className="text-left text-sm text-rose-700" role="status" aria-live="polite">
          {deleteState.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={deletePending}
        className="inline-flex items-center rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Delete Flavor
      </button>
    </form>
  );
}

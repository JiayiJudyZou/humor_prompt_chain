"use client";

import { useActionState } from "react";
import { deleteHumorFlavor, updateHumorFlavor } from "@/lib/actions/humor-flavors";
import type { DeleteHumorFlavorResult } from "@/lib/actions/humor-flavors";
import type { humor_flavors } from "@/lib/types/humor-flavor";

type FlavorDetailsFormProps = {
  flavor: humor_flavors;
  className?: string;
};

export default function FlavorDetailsForm({
  flavor,
  className,
}: FlavorDetailsFormProps) {
  const [deleteState, deleteAction, deletePending] = useActionState<
    DeleteHumorFlavorResult | null,
    FormData
  >(deleteHumorFlavor, null);

  return (
    <section
      className={
        className ??
        "rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:p-6"
      }
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
          Flavor Details
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Edit Selected Flavor</h3>
        <p className="mt-1 text-sm text-slate-600">
          Update schema fields for the selected humor flavor.
        </p>
      </div>

      <form action={updateHumorFlavor} className="space-y-4">
        <input type="hidden" name="id" value={flavor.id} />

        <div className="space-y-1.5">
          <label
            htmlFor={`update-humor-flavor-slug-${flavor.id}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            slug
          </label>
          <input
            id={`update-humor-flavor-slug-${flavor.id}`}
            name="slug"
            type="text"
            required
            defaultValue={flavor.slug}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`update-humor-flavor-description-${flavor.id}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            description
          </label>
          <textarea
            id={`update-humor-flavor-description-${flavor.id}`}
            name="description"
            rows={5}
            defaultValue={flavor.description ?? ""}
            placeholder="Optional flavor description"
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100"
          >
            Save Changes
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-rose-100 pt-4">
        <form action={deleteAction} className="space-y-2">
          <input type="hidden" name="id" value={flavor.id} />
          {deleteState?.ok === false ? (
            <p className="text-sm text-rose-700" role="status" aria-live="polite">
              {deleteState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={deletePending}
            className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
          >
            Delete Flavor
          </button>
        </form>
      </div>
    </section>
  );
}

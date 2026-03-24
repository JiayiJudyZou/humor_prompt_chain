"use client";

import { useActionState } from "react";
import {
  createHumorFlavor,
  type CreateHumorFlavorResult,
} from "@/lib/actions/humor-flavors";

type CreateFlavorFormProps = {
  className?: string;
};

export default function CreateFlavorForm({ className }: CreateFlavorFormProps) {
  const [state, formAction, pending] = useActionState<CreateHumorFlavorResult | null, FormData>(
    createHumorFlavor,
    null,
  );
  const showDuplicateSlugError = state?.ok === false && state.errorCode === "duplicate_slug";

  return (
    <section
      className={
        className ??
        "rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:p-6"
      }
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
          Add Flavor
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Create Humor Flavor</h3>
        <p className="mt-1 text-sm text-slate-600">
          Add a new read-only flavor record to the premium workspace.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="create-humor-flavor-slug"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            slug
          </label>
          <input
            id="create-humor-flavor-slug"
            name="slug"
            type="text"
            required
            placeholder="dry-wit"
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-humor-flavor-description"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            description
          </label>
          <textarea
            id="create-humor-flavor-description"
            name="description"
            rows={4}
            placeholder="Optional flavor description"
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        {showDuplicateSlugError ? (
          <p className="text-sm text-rose-700" role="status" aria-live="polite">
            A humor flavor with this slug already exists. Please choose a different name.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create Flavor
        </button>
      </form>
    </section>
  );
}

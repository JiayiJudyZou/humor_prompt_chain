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
        "admin-surface p-5 sm:p-6"
      }
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
          Add Flavor
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Create Humor Flavor
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Add a new read-only flavor record to the premium workspace.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="create-humor-flavor-slug"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
          >
            slug
          </label>
          <input
            id="create-humor-flavor-slug"
            name="slug"
            type="text"
            required
            placeholder="dry-wit"
            className="admin-input"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="create-humor-flavor-description"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
          >
            description
          </label>
          <textarea
            id="create-humor-flavor-description"
            name="description"
            rows={4}
            placeholder="Optional flavor description"
            className="admin-input"
          />
        </div>

        {showDuplicateSlugError ? (
          <p className="text-sm text-rose-700 dark:text-rose-300" role="status" aria-live="polite">
            A humor flavor with this slug already exists. Please choose a different name.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="admin-button-primary"
        >
          Create Flavor
        </button>
      </form>
    </section>
  );
}

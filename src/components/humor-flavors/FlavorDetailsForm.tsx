"use client";

import { useActionState } from "react";
import { updateHumorFlavor } from "@/lib/actions/humor-flavors";
import type { humor_flavors } from "@/lib/types/humor-flavor";

type FlavorDetailsFormProps = {
  flavor: humor_flavors;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  className?: string;
};

export default function FlavorDetailsForm({
  flavor,
  onCancel,
  onSubmitSuccess,
  className,
}: FlavorDetailsFormProps) {
  const [, formAction] = useActionState(async (_prevState: null, formData: FormData) => {
    await updateHumorFlavor(formData);
    onSubmitSuccess?.();
    return null;
  }, null);

  return (
    <section
      className={
        className ??
        "admin-surface p-5 sm:p-6"
      }
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
          Flavor Details
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Selected Flavor</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Update schema fields for the selected humor flavor.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={flavor.id} />

        <div className="space-y-1.5">
          <label
            htmlFor={`update-humor-flavor-slug-${flavor.id}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
          >
            slug
          </label>
          <input
            id={`update-humor-flavor-slug-${flavor.id}`}
            name="slug"
            type="text"
            required
            defaultValue={flavor.slug}
            className="admin-input"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`update-humor-flavor-description-${flavor.id}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
          >
            description
          </label>
          <textarea
            id={`update-humor-flavor-description-${flavor.id}`}
            name="description"
            rows={5}
            defaultValue={flavor.description ?? ""}
            placeholder="Optional flavor description"
            className="admin-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="admin-button-primary"
          >
            Save Changes
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="admin-button-secondary px-4 py-2.5"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

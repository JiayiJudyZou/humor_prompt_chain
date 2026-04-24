import type { humor_flavors } from "@/lib/types/humor-flavor";

type HumorFlavorTestPanelProps = {
  selectedFlavor: humor_flavors | null;
};

export default function HumorFlavorTestPanel({
  selectedFlavor,
}: HumorFlavorTestPanelProps) {
  if (!selectedFlavor) {
    return (
      <div className="admin-empty sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
          No Flavor Selected
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Select a humor flavor to start testing
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Pick a flavor from the left panel to prepare a caption test run.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
            Selected Flavor
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {selectedFlavor.slug}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {selectedFlavor.description ?? "No description"}
          </p>
        </div>
        <span className="admin-pill">
          Flavor ID {selectedFlavor.id}
        </span>
      </div>

      <div className="admin-surface-subtle mt-5 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Test Runner
        </p>
        <div className="mt-3 grid gap-4">
          <div>
            <label
              htmlFor="humor-flavor-test-image-url"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300"
            >
              Image URL
            </label>
            <input
              id="humor-flavor-test-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              className="admin-input mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
              Output Preview
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-rose-200/80 bg-white/80 p-4 text-sm text-slate-500 dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-slate-300">
              Caption generation API is not wired yet.
            </div>
          </div>

          <button
            type="button"
            disabled
            className="admin-button-primary w-fit opacity-70"
          >
            Generate captions (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}

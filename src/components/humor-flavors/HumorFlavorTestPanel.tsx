import type { humor_flavors } from "@/lib/types/humor-flavor";

type HumorFlavorTestPanelProps = {
  selectedFlavor: humor_flavors | null;
};

export default function HumorFlavorTestPanel({
  selectedFlavor,
}: HumorFlavorTestPanelProps) {
  if (!selectedFlavor) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-gradient-to-br from-rose-50 via-amber-50 to-white p-6 dark:border-rose-300/35 dark:bg-gradient-to-br dark:from-[#15151f] dark:via-[#1d1721] dark:to-[#181620] sm:p-8">
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
    <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
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
        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700 dark:border-rose-300/35 dark:bg-rose-500/15 dark:text-rose-100">
          Flavor ID {selectedFlavor.id}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-amber-50/70 to-white p-4 dark:border-rose-300/30 dark:bg-gradient-to-br dark:from-[#191521] dark:via-[#221821] dark:to-[#15151e] sm:p-5">
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
              className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus:border-rose-300 focus:outline-none dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-slate-100 dark:focus:border-rose-300/55"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
              Output Preview
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-rose-200 bg-white/80 p-4 text-sm text-slate-500 dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-slate-300">
              Caption generation API is not wired yet.
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex w-fit items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(190,24,93,0.10)] opacity-70 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)]"
          >
            Generate captions (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}

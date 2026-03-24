import type { humor_flavors } from "@/lib/types/humor-flavor";

type HumorFlavorTestPanelProps = {
  selectedFlavor: humor_flavors | null;
};

export default function HumorFlavorTestPanel({
  selectedFlavor,
}: HumorFlavorTestPanelProps) {
  if (!selectedFlavor) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-gradient-to-br from-rose-50 via-amber-50 to-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
          No Flavor Selected
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          Select a humor flavor to start testing
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pick a flavor from the left panel to prepare a caption test run.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
            Selected Flavor
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {selectedFlavor.slug}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedFlavor.description ?? "No description"}
          </p>
        </div>
        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700">
          Flavor ID {selectedFlavor.id}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-amber-50/70 to-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Test Runner
        </p>
        <div className="mt-3 grid gap-4">
          <div>
            <label
              htmlFor="humor-flavor-test-image-url"
              className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600"
            >
              Image URL
            </label>
            <input
              id="humor-flavor-test-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus:border-rose-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Output Preview
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-rose-200 bg-white/80 p-4 text-sm text-slate-500">
              Caption generation API is not wired yet.
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex w-fit items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(190,24,93,0.10)] opacity-70"
          >
            Generate captions (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}

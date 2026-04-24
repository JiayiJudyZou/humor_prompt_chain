import type {
  humor_flavor_steps,
  humor_flavors,
} from "@/lib/types/humor-flavor";

type FlavorStepComparisonSectionProps = {
  selectedFlavor: humor_flavors;
  selectedSteps: humor_flavor_steps[];
  compareFlavor: humor_flavors | null;
  compareSteps: humor_flavor_steps[];
};

type StepPair = {
  orderBy: number;
  rowIndex: number;
  selectedStep: humor_flavor_steps | null;
  compareStep: humor_flavor_steps | null;
};

const STEP_FIELDS = [
  "order_by",
  "description",
  "llm_model_id",
  "llm_input_type_id",
  "llm_output_type_id",
  "humor_flavor_step_type_id",
  "llm_system_prompt",
  "llm_user_prompt",
] as const;

type StepField = (typeof STEP_FIELDS)[number];

function normalizeStepValue(step: humor_flavor_steps | null, field: StepField): string {
  if (!step) return "Missing step";

  const value = step[field];
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "string" && value.length === 0) return "(empty string)";

  return String(value);
}

function buildStepPairs(
  selectedSteps: humor_flavor_steps[],
  compareSteps: humor_flavor_steps[]
): StepPair[] {
  const selectedByOrder = new Map<number, humor_flavor_steps[]>();
  const compareByOrder = new Map<number, humor_flavor_steps[]>();

  for (const step of selectedSteps) {
    const bucket = selectedByOrder.get(step.order_by) ?? [];
    bucket.push(step);
    selectedByOrder.set(step.order_by, bucket);
  }

  for (const step of compareSteps) {
    const bucket = compareByOrder.get(step.order_by) ?? [];
    bucket.push(step);
    compareByOrder.set(step.order_by, bucket);
  }

  const allOrders = Array.from(
    new Set([...selectedByOrder.keys(), ...compareByOrder.keys()])
  ).sort((a, b) => a - b);

  const pairs: StepPair[] = [];

  for (const orderBy of allOrders) {
    const selectedBucket = (selectedByOrder.get(orderBy) ?? []).sort(
      (a, b) => a.id - b.id
    );
    const compareBucket = (compareByOrder.get(orderBy) ?? []).sort(
      (a, b) => a.id - b.id
    );
    const rowCount = Math.max(selectedBucket.length, compareBucket.length);

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      pairs.push({
        orderBy,
        rowIndex,
        selectedStep: selectedBucket[rowIndex] ?? null,
        compareStep: compareBucket[rowIndex] ?? null,
      });
    }
  }

  return pairs;
}

function renderFieldValue(value: string, isChanged: boolean) {
  return (
    <pre
      className={`max-w-none whitespace-pre-wrap break-words rounded-lg border px-2.5 py-2 text-xs font-sans leading-5 ${
        isChanged
          ? "border-amber-200 bg-amber-50/70 text-slate-800 dark:border-rose-300/35 dark:bg-rose-500/12 dark:text-slate-100"
          : "border-rose-100 bg-rose-50/40 text-slate-700 dark:border-rose-300/25 dark:bg-[#11111a] dark:text-slate-200"
      }`}
    >
      {value}
    </pre>
  );
}

export default function FlavorStepComparisonSection({
  selectedFlavor,
  selectedSteps,
  compareFlavor,
  compareSteps,
}: FlavorStepComparisonSectionProps) {
  const orderedSelectedSteps = [...selectedSteps].sort((a, b) => {
    if (a.order_by !== b.order_by) return a.order_by - b.order_by;
    return a.id - b.id;
  });

  if (!compareFlavor) {
    return (
      <section className="admin-surface space-y-3 p-4 sm:p-5">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Debug Step View</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Full step fields for <span className="font-semibold">{selectedFlavor.slug}</span>.
          </p>
        </div>

        {orderedSelectedSteps.length === 0 ? (
          <p className="admin-empty px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            This flavor has no steps configured.
          </p>
        ) : (
          <ul className="space-y-3">
            {orderedSelectedSteps.map((step) => (
              <li
                key={step.id}
                className="admin-surface-subtle p-3 sm:p-4"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Step {step.order_by} (id: {step.id})
                </p>
                <dl className="mt-3 grid gap-2">
                  {STEP_FIELDS.map((fieldName) => (
                    <div key={fieldName}>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                        {fieldName}
                      </dt>
                      <dd className="mt-1">
                        {renderFieldValue(normalizeStepValue(step, fieldName), false)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const pairs = buildStepPairs(orderedSelectedSteps, compareSteps);

  return (
    <section className="admin-surface space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Comparison Debug View</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Comparing <span className="font-semibold">{selectedFlavor.slug}</span> against{" "}
            <span className="font-semibold">{compareFlavor.slug}</span>.
          </p>
        </div>
      </div>

      {pairs.length === 0 ? (
        <p className="admin-empty px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          Neither flavor has steps configured.
        </p>
      ) : (
        <ul className="space-y-4">
          {pairs.map((pair) => (
            <li
              key={`${pair.orderBy}-${pair.rowIndex}`}
              className="admin-surface-subtle p-3 sm:p-4"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Step {pair.orderBy}
                {pair.rowIndex > 0 ? ` (duplicate #${pair.rowIndex + 1})` : ""}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {selectedFlavor.slug} step id: {pair.selectedStep?.id ?? "missing"} |{" "}
                {compareFlavor.slug} step id: {pair.compareStep?.id ?? "missing"}
              </p>

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                      <th className="border-b border-rose-100 px-2 py-2 font-semibold dark:border-rose-400/20">Field</th>
                      <th className="border-b border-rose-100 px-2 py-2 font-semibold dark:border-rose-400/20">
                        {selectedFlavor.slug}
                      </th>
                      <th className="border-b border-rose-100 px-2 py-2 font-semibold dark:border-rose-400/20">
                        {compareFlavor.slug}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {STEP_FIELDS.map((fieldName) => {
                      const selectedValue = normalizeStepValue(
                        pair.selectedStep,
                        fieldName
                      );
                      const compareValue = normalizeStepValue(pair.compareStep, fieldName);
                      const isChanged = selectedValue !== compareValue;

                      return (
                        <tr key={fieldName} className="align-top">
                          <th className="w-44 border-b border-rose-100 px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-rose-400/20 dark:text-slate-200">
                            {fieldName}
                          </th>
                          <td className="border-b border-rose-100 px-2 py-2 dark:border-rose-400/20">
                            {renderFieldValue(selectedValue, isChanged)}
                          </td>
                          <td className="border-b border-rose-100 px-2 py-2 dark:border-rose-400/20">
                            {renderFieldValue(compareValue, isChanged)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import Link from "next/link";
import DeleteFlavorHeaderAction from "./DeleteFlavorHeaderAction";
import StepForm from "./StepForm";
import StepList from "./StepList";
import type {
  humor_flavor_step_types,
  humor_flavor_steps,
  humor_flavors,
  llm_input_types,
  llm_models,
  llm_output_types,
} from "@/lib/types/humor-flavor";

type ExpandedFlavorWorkspaceProps = {
  flavor: humor_flavors;
  humorFlavorId: number;
  steps: humor_flavor_steps[];
  humorFlavorStepTypes: humor_flavor_step_types[];
  llmInputTypes: llm_input_types[];
  llmOutputTypes: llm_output_types[];
  llmModels: llm_models[];
};

function formatDateTime(value: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ExpandedFlavorWorkspace({
  flavor,
  humorFlavorId,
  steps,
  humorFlavorStepTypes,
  llmInputTypes,
  llmOutputTypes,
  llmModels,
}: ExpandedFlavorWorkspaceProps) {
  return (
    <div className="mt-3 rounded-2xl border border-rose-200 bg-gradient-to-b from-white via-rose-50/35 to-amber-50/40 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-rose-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
            Flavor Workspace
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            {flavor.slug}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {flavor.description ?? "No description"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-[0.1em] text-slate-700">
              Updated
            </span>{" "}
            {formatDateTime(flavor.modified_datetime_utc)}
          </p>
          <div className="mt-2 flex items-start justify-end gap-2">
            <DeleteFlavorHeaderAction humorFlavorId={humorFlavorId} />
            <Link
              href="/admin/humor-flavors"
              className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              Collapse
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <StepForm
          mode="create"
          humorFlavorId={humorFlavorId}
          humorFlavorStepTypes={humorFlavorStepTypes}
          llmInputTypes={llmInputTypes}
          llmOutputTypes={llmOutputTypes}
          llmModels={llmModels}
          className="rounded-xl border border-rose-100 bg-white/95 p-4 shadow-none"
        />

        <StepList
          steps={steps}
          humorFlavorId={humorFlavorId}
          humorFlavorStepTypes={humorFlavorStepTypes}
          llmInputTypes={llmInputTypes}
          llmOutputTypes={llmOutputTypes}
          llmModels={llmModels}
        />
      </div>
    </div>
  );
}

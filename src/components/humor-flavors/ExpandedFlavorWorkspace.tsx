"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteFlavorHeaderAction from "./DeleteFlavorHeaderAction";
import DuplicateFlavorHeaderAction from "./DuplicateFlavorHeaderAction";
import FlavorDetailsForm from "./FlavorDetailsForm";
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
  const [showCreateStepForm, setShowCreateStepForm] = useState(false);
  const [showEditFlavorForm, setShowEditFlavorForm] = useState(false);

  return (
    <div className="admin-surface-subtle mt-3 p-4 sm:p-5">
      <div className="admin-divider mb-4 flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
            Flavor Workspace
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {flavor.slug}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {flavor.description ?? "No description"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">
              Updated
            </span>{" "}
            {formatDateTime(flavor.modified_datetime_utc)}
          </p>
          <div className="mt-2 flex items-start justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateStepForm(true)}
              className="admin-button-primary px-3 py-2 text-xs uppercase tracking-[0.08em]"
            >
              Create Step
            </button>
            <button
              type="button"
              onClick={() => setShowEditFlavorForm(true)}
              className="admin-button-primary px-3 py-2 text-xs uppercase tracking-[0.08em]"
            >
              Edit Flavor
            </button>
            <DuplicateFlavorHeaderAction humorFlavorId={humorFlavorId} />
            <DeleteFlavorHeaderAction humorFlavorId={humorFlavorId} />
            <Link
              href="/admin/humor-flavors"
              className="admin-button-secondary px-3 py-2 text-xs uppercase tracking-[0.08em]"
            >
              Collapse
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {showEditFlavorForm ? (
          <FlavorDetailsForm
            flavor={flavor}
            onCancel={() => setShowEditFlavorForm(false)}
            onSubmitSuccess={() => setShowEditFlavorForm(false)}
            className="admin-surface p-4 shadow-none"
          />
        ) : null}

        {showCreateStepForm ? (
          <section className="admin-surface-subtle p-3 sm:p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateStepForm(false)}
                className="admin-button-secondary rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]"
              >
                Cancel
              </button>
            </div>
            <StepForm
              mode="create"
              humorFlavorId={humorFlavorId}
              humorFlavorStepTypes={humorFlavorStepTypes}
              llmInputTypes={llmInputTypes}
              llmOutputTypes={llmOutputTypes}
              llmModels={llmModels}
              onSubmitSuccess={() => setShowCreateStepForm(false)}
              className="admin-surface p-4 shadow-none"
            />
          </section>
        ) : null}

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

"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteFlavorHeaderAction from "./DeleteFlavorHeaderAction";
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
    <div className="mt-3 rounded-2xl border border-rose-200 bg-gradient-to-b from-white via-rose-50/35 to-amber-50/40 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-rose-300/30 dark:bg-gradient-to-b dark:from-[#13131c] dark:via-[#1a1521] dark:to-[#1d141f] dark:shadow-[0_14px_30px_rgba(0,0,0,0.5)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-rose-100 pb-4 dark:border-rose-400/20">
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
              className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)] dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
            >
              Create Step
            </button>
            <button
              type="button"
              onClick={() => setShowEditFlavorForm(true)}
              className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)] dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
            >
              Edit Flavor
            </button>
            <DeleteFlavorHeaderAction humorFlavorId={humorFlavorId} />
            <Link
              href="/admin/humor-flavors"
              className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-300/35 dark:bg-[#11111a] dark:text-rose-100 dark:hover:border-rose-300/45 dark:hover:bg-rose-500/15"
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
            className="rounded-xl border border-rose-100 bg-white/95 p-4 shadow-none dark:border-rose-400/25 dark:bg-[#171620]/95"
          />
        ) : null}

        {showCreateStepForm ? (
          <section className="rounded-xl border border-rose-100 bg-rose-50/35 p-3 dark:border-rose-400/20 dark:bg-rose-500/8 sm:p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateStepForm(false)}
                className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-300/30 dark:bg-[#10101a] dark:text-slate-200 dark:hover:border-rose-300/45 dark:hover:bg-rose-500/12"
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
              className="rounded-xl border border-rose-100 bg-white/95 p-4 shadow-none dark:border-rose-400/25 dark:bg-[#171620]/95"
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

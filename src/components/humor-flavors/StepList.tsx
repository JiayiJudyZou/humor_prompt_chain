"use client";

import { useState } from "react";
import {
  deleteHumorFlavorStep,
  moveHumorFlavorStepDown,
  moveHumorFlavorStepUp,
} from "@/lib/actions/humor-flavor-steps";
import type {
  humor_flavor_step_types,
  humor_flavor_steps,
  llm_input_types,
  llm_models,
  llm_output_types,
} from "@/lib/types/humor-flavor";
import StepForm from "./StepForm";

type StepListProps = {
  steps: humor_flavor_steps[];
  humorFlavorId: number;
  humorFlavorStepTypes: humor_flavor_step_types[];
  llmInputTypes: llm_input_types[];
  llmOutputTypes: llm_output_types[];
  llmModels: llm_models[];
  className?: string;
};

function getPromptPreview(value: string | null, maxLength = 220): string {
  if (!value) return "No prompt";

  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "No prompt";

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 1)}...`;
}

function friendlyLabel(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function getStepTitle(step: humor_flavor_steps): string {
  const trimmed = step.description?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Untitled step";
}

function getModelLabel(model: llm_models): string {
  const provider = model.provider_model_id?.trim();
  if (!provider) return model.name;
  return `${model.name} (${provider})`;
}

function getPrimaryPreview(step: humor_flavor_steps): string {
  if (step.llm_user_prompt?.trim()) {
    return getPromptPreview(step.llm_user_prompt, 180);
  }

  return getPromptPreview(step.llm_system_prompt, 180);
}

export default function StepList({
  steps,
  humorFlavorId,
  humorFlavorStepTypes,
  llmInputTypes,
  llmOutputTypes,
  llmModels,
  className,
}: StepListProps) {
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);

  const orderedSteps = [...steps].sort((a, b) => {
    if (a.order_by !== b.order_by) return a.order_by - b.order_by;
    return a.id - b.id;
  });

  const stepTypeById = new Map(
    humorFlavorStepTypes.map((item) => [
      item.id,
      friendlyLabel(item.description, item.slug),
    ])
  );
  const inputTypeById = new Map(
    llmInputTypes.map((item) => [item.id, friendlyLabel(item.description, item.slug)])
  );
  const outputTypeById = new Map(
    llmOutputTypes.map((item) => [item.id, friendlyLabel(item.description, item.slug)])
  );
  const modelById = new Map(llmModels.map((item) => [item.id, getModelLabel(item)]));

  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pipeline Steps</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
          reorder-enabled
        </p>
      </div>

      {orderedSteps.length === 0 ? (
        <div className="admin-empty sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
            Pipeline Empty
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">No steps configured</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Add a step above to begin defining the flavor sequence.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orderedSteps.map((step, index) => {
            const stepType =
              stepTypeById.get(step.humor_flavor_step_type_id) ?? "Unknown type";
            const inputType = inputTypeById.get(step.llm_input_type_id) ?? "Unknown";
            const outputType = outputTypeById.get(step.llm_output_type_id) ?? "Unknown";
            const model = modelById.get(step.llm_model_id) ?? "Unknown model";
            const isEditing = editingStepId === step.id;
            const isExpanded = expandedStepId === step.id;

            return (
              <li
                key={step.id}
                className="admin-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-700 dark:border-rose-300/35 dark:bg-rose-500/15 dark:text-rose-100">
                        Step {step.order_by}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500 dark:text-slate-400">
                        Prompt Step
                      </p>
                    </div>
                    <h4 className="mt-2 truncate text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                      {getStepTitle(step)}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedStepId((current) =>
                          current === step.id ? null : step.id
                        )
                      }
                      className="admin-button-secondary cursor-pointer rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]"
                    >
                      {isExpanded ? "Hide" : "View"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStepId((current) => (current === step.id ? null : step.id))
                      }
                      className="admin-button-secondary cursor-pointer rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]"
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>

                    <form action={deleteHumorFlavorStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <button
                        type="submit"
                        className="admin-button-danger rounded-lg px-3 py-1.5"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                <div className="admin-divider mt-3 flex flex-wrap items-center gap-2 border-y py-3">
                  <p className="admin-pill normal-case tracking-normal">
                    Type: {stepType}
                  </p>
                  <p className="admin-pill normal-case tracking-normal">
                    Input: {inputType}
                  </p>
                  <p className="admin-pill normal-case tracking-normal">
                    Output: {outputType}
                  </p>
                  <p className="admin-pill normal-case tracking-normal">
                    Model: {model}
                  </p>
                  <p className="admin-pill normal-case tracking-normal">
                    Temp: {step.llm_temperature ?? "N/A"}
                  </p>
                </div>

                <div className="admin-surface-subtle mt-3 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                    Prompt Preview
                  </p>
                  <p className="mt-1 max-h-[3.2rem] overflow-hidden text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {getPrimaryPreview(step)}
                  </p>
                </div>

                <div
                  className={`grid max-w-full overflow-hidden transition-all duration-200 ease-out ${
                    isExpanded
                      ? "mt-3 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <section className="min-h-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50/35 p-4 dark:border-rose-400/20 dark:bg-rose-500/8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                      System Prompt
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-white/85 p-3 text-sm leading-6 text-slate-700 dark:bg-[#11111a] dark:text-slate-100">
                      {step.llm_system_prompt?.trim()
                        ? step.llm_system_prompt
                        : "No system prompt"}
                    </p>

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                      User Prompt
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-white/85 p-3 text-sm leading-6 text-slate-700 dark:bg-[#11111a] dark:text-slate-100">
                      {step.llm_user_prompt?.trim() ? step.llm_user_prompt : "No user prompt"}
                    </p>

                    {step.description?.trim() ? (
                      <>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                          Description / Notes
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-white/85 p-3 text-sm leading-6 text-slate-700 dark:bg-[#11111a] dark:text-slate-100">
                          {step.description}
                        </p>
                      </>
                    ) : null}
                  </section>
                </div>

                {isEditing ? (
                  <section className="admin-surface-subtle mt-3 p-3 sm:p-4">
                    <div className="mb-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingStepId(null)}
                        className="admin-button-secondary rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]"
                      >
                        Cancel
                      </button>
                    </div>

                    <StepForm
                      mode="edit"
                      step={step}
                      humorFlavorId={humorFlavorId}
                      humorFlavorStepTypes={humorFlavorStepTypes}
                      llmInputTypes={llmInputTypes}
                      llmOutputTypes={llmOutputTypes}
                      llmModels={llmModels}
                      className="admin-surface p-4 shadow-none"
                    />
                  </section>
                ) : null}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <form action={moveHumorFlavorStepUp}>
                    <input type="hidden" name="id" value={step.id} />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="admin-button-secondary rounded-lg px-2.5 py-1.5 text-[11px] uppercase tracking-[0.08em] disabled:opacity-50"
                    >
                      Up
                    </button>
                  </form>
                  <form action={moveHumorFlavorStepDown}>
                    <input type="hidden" name="id" value={step.id} />
                    <button
                      type="submit"
                      disabled={index === orderedSteps.length - 1}
                      className="admin-button-secondary rounded-lg px-2.5 py-1.5 text-[11px] uppercase tracking-[0.08em] disabled:opacity-50"
                    >
                      Down
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

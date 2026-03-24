"use client";

import {
  createHumorFlavorStep,
  updateHumorFlavorStep,
} from "@/lib/actions/humor-flavor-steps";
import type {
  humor_flavor_step_types,
  humor_flavor_steps,
  llm_input_types,
  llm_models,
  llm_output_types,
} from "@/lib/types/humor-flavor";

type StepFormProps = {
  mode: "create" | "edit";
  humorFlavorId: number;
  step?: humor_flavor_steps;
  humorFlavorStepTypes: humor_flavor_step_types[];
  llmInputTypes: llm_input_types[];
  llmOutputTypes: llm_output_types[];
  llmModels: llm_models[];
  className?: string;
};

const DEFAULTS = {
  humor_flavor_step_type_id: 3,
  llm_input_type_id: 2,
  llm_output_type_id: 1,
  llm_model_id: 6,
  llm_temperature: 0.7,
} as const;

function getStepTypeLabel(item: humor_flavor_step_types): string {
  return item.description?.trim() || item.slug;
}

function getInputTypeLabel(item: llm_input_types): string {
  return item.description?.trim() || item.slug;
}

function getOutputTypeLabel(item: llm_output_types): string {
  return item.description?.trim() || item.slug;
}

function getModelLabel(item: llm_models): string {
  return `${item.name} (${item.provider_model_id})`;
}

export default function StepForm({
  mode,
  humorFlavorId,
  step,
  humorFlavorStepTypes,
  llmInputTypes,
  llmOutputTypes,
  llmModels,
  className,
}: StepFormProps) {
  const isEdit = mode === "edit";
  const action = isEdit ? updateHumorFlavorStep : createHumorFlavorStep;

  const defaultDescription = isEdit ? (step?.description ?? "") : "";
  const defaultOrderBy = isEdit ? (step?.order_by ?? 1) : 1;
  const defaultStepTypeId = isEdit
    ? (step?.humor_flavor_step_type_id ?? DEFAULTS.humor_flavor_step_type_id)
    : DEFAULTS.humor_flavor_step_type_id;
  const defaultInputTypeId = isEdit
    ? (step?.llm_input_type_id ?? DEFAULTS.llm_input_type_id)
    : DEFAULTS.llm_input_type_id;
  const defaultOutputTypeId = isEdit
    ? (step?.llm_output_type_id ?? DEFAULTS.llm_output_type_id)
    : DEFAULTS.llm_output_type_id;
  const defaultModelId = isEdit
    ? (step?.llm_model_id ?? DEFAULTS.llm_model_id)
    : DEFAULTS.llm_model_id;
  const defaultTemperature = isEdit
    ? (step?.llm_temperature ?? DEFAULTS.llm_temperature)
    : DEFAULTS.llm_temperature;
  const defaultSystemPrompt = isEdit ? (step?.llm_system_prompt ?? "") : "";
  const defaultUserPrompt = isEdit ? (step?.llm_user_prompt ?? "") : "";

  return (
    <section
      className={
        className ??
        "rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:p-6"
      }
    >
      <form action={action} className="space-y-4">
        {isEdit && step ? <input type="hidden" name="id" value={step.id} /> : null}
        <input type="hidden" name="humor_flavor_id" value={humorFlavorId} />

        <div className="space-y-1.5">
          <label
            htmlFor={`step-description-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Description
          </label>
          <textarea
            id={`step-description-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="description"
            rows={3}
            defaultValue={defaultDescription}
            placeholder="Optional step description"
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-order-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Order
          </label>
          <input
            id={`step-order-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="order_by"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={defaultOrderBy}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Step Type
          </label>
          <select
            id={`step-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="humor_flavor_step_type_id"
            required
            defaultValue={defaultStepTypeId}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          >
            {humorFlavorStepTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {getStepTypeLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-input-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Input Type
          </label>
          <select
            id={`step-input-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_input_type_id"
            required
            defaultValue={defaultInputTypeId}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          >
            {llmInputTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {getInputTypeLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-output-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Output Type
          </label>
          <select
            id={`step-output-type-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_output_type_id"
            required
            defaultValue={defaultOutputTypeId}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          >
            {llmOutputTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {getOutputTypeLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-model-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Model
          </label>
          <select
            id={`step-model-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_model_id"
            required
            defaultValue={defaultModelId}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          >
            {llmModels.map((item) => (
              <option key={item.id} value={item.id}>
                {getModelLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-temperature-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            Temperature
          </label>
          <input
            id={`step-temperature-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_temperature"
            type="number"
            step="0.1"
            defaultValue={defaultTemperature}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-system-prompt-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            System Prompt
          </label>
          <textarea
            id={`step-system-prompt-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_system_prompt"
            rows={6}
            defaultValue={defaultSystemPrompt}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`step-user-prompt-${isEdit ? step?.id ?? "edit" : "create"}`}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            User Prompt
          </label>
          <textarea
            id={`step-user-prompt-${isEdit ? step?.id ?? "edit" : "create"}`}
            name="llm_user_prompt"
            rows={6}
            defaultValue={defaultUserPrompt}
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100"
        >
          {isEdit ? "Save Step" : "Create Step"}
        </button>
      </form>
    </section>
  );
}

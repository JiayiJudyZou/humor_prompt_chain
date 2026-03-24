"use server";

import { revalidatePath } from "next/cache";
import { requirePromptChainAdmin } from "@/lib/auth/requirePromptChainAdmin";
import { createClient } from "@/lib/supabase/server";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") {
    throw new Error(`Missing required field: ${key}`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing required field: ${key}`);
  }

  return trimmed;
}

function getNullableString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getRequiredInteger(formData: FormData, key: string): number {
  const raw = getRequiredString(formData, key);
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}`);
  }

  return value;
}

function getNullableNumber(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${key}`);
  }

  return parsed;
}

export async function createHumorFlavorStep(formData: FormData) {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();

  const humor_flavor_id = getRequiredInteger(formData, "humor_flavor_id");
  const llm_temperature = getNullableNumber(formData, "llm_temperature");
  const order_by = getRequiredInteger(formData, "order_by");
  const llm_input_type_id = getRequiredInteger(formData, "llm_input_type_id");
  const llm_output_type_id = getRequiredInteger(formData, "llm_output_type_id");
  const llm_model_id = getRequiredInteger(formData, "llm_model_id");
  const humor_flavor_step_type_id = getRequiredInteger(
    formData,
    "humor_flavor_step_type_id"
  );
  const llm_system_prompt = getNullableString(formData, "llm_system_prompt");
  const llm_user_prompt = getNullableString(formData, "llm_user_prompt");
  const description = getNullableString(formData, "description");

  const { error } = await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id,
    llm_temperature,
    order_by,
    llm_input_type_id,
    llm_output_type_id,
    llm_model_id,
    humor_flavor_step_type_id,
    llm_system_prompt,
    llm_user_prompt,
    description,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });

  if (error) {
    throw new Error(`Failed to create humor flavor step: ${error.message}`);
  }

  revalidatePath("/admin/humor-flavors");
}

export async function updateHumorFlavorStep(formData: FormData) {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();

  const id = getRequiredInteger(formData, "id");
  const humor_flavor_id = getRequiredInteger(formData, "humor_flavor_id");
  const llm_temperature = getNullableNumber(formData, "llm_temperature");
  const order_by = getRequiredInteger(formData, "order_by");
  const llm_input_type_id = getRequiredInteger(formData, "llm_input_type_id");
  const llm_output_type_id = getRequiredInteger(formData, "llm_output_type_id");
  const llm_model_id = getRequiredInteger(formData, "llm_model_id");
  const humor_flavor_step_type_id = getRequiredInteger(
    formData,
    "humor_flavor_step_type_id"
  );
  const llm_system_prompt = getNullableString(formData, "llm_system_prompt");
  const llm_user_prompt = getNullableString(formData, "llm_user_prompt");
  const description = getNullableString(formData, "description");

  const { error } = await supabase
    .from("humor_flavor_steps")
    .update({
      humor_flavor_id,
      llm_temperature,
      order_by,
      llm_input_type_id,
      llm_output_type_id,
      llm_model_id,
      humor_flavor_step_type_id,
      llm_system_prompt,
      llm_user_prompt,
      description,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update humor flavor step ${id}: ${error.message}`);
  }

  revalidatePath("/admin/humor-flavors");
}

export async function deleteHumorFlavorStep(formData: FormData) {
  await requirePromptChainAdmin();
  const supabase = await createClient();

  const id = getRequiredInteger(formData, "id");

  const { error } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete humor flavor step ${id}: ${error.message}`);
  }

  revalidatePath("/admin/humor-flavors");
}

async function moveHumorFlavorStep(formData: FormData, direction: "up" | "down") {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();

  const id = getRequiredInteger(formData, "id");

  const { data: currentStep, error: currentStepError } = await supabase
    .from("humor_flavor_steps")
    .select("id, humor_flavor_id, order_by")
    .eq("id", id)
    .single();

  if (currentStepError) {
    throw new Error(`Failed to load humor flavor step ${id}: ${currentStepError.message}`);
  }

  const { data: steps, error: stepsError } = await supabase
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", currentStep.humor_flavor_id)
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  if (stepsError) {
    throw new Error(
      `Failed to load humor flavor steps for humor flavor ${currentStep.humor_flavor_id}: ${stepsError.message}`
    );
  }

  const currentIndex = steps.findIndex((step) => step.id === id);
  if (currentIndex < 0) {
    return;
  }

  const adjacentIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (adjacentIndex < 0 || adjacentIndex >= steps.length) {
    return;
  }

  const current = steps[currentIndex];
  const adjacent = steps[adjacentIndex];
  const maxOrderBy = steps.reduce((max, step) => Math.max(max, step.order_by), 0);
  const temporaryOrderBy = maxOrderBy + 1;
  const modified_datetime_utc = new Date().toISOString();

  const { error: firstSwapError } = await supabase
    .from("humor_flavor_steps")
    .update({
      order_by: temporaryOrderBy,
      modified_by_user_id: user.id,
      modified_datetime_utc,
    })
    .eq("id", current.id);

  if (firstSwapError) {
    throw new Error(
      `Failed to move humor flavor step ${current.id} (temporary swap): ${firstSwapError.message}`
    );
  }

  const { error: secondSwapError } = await supabase
    .from("humor_flavor_steps")
    .update({
      order_by: current.order_by,
      modified_by_user_id: user.id,
      modified_datetime_utc,
    })
    .eq("id", adjacent.id);

  if (secondSwapError) {
    throw new Error(
      `Failed to move humor flavor step ${adjacent.id} (adjacent swap): ${secondSwapError.message}`
    );
  }

  const { error: thirdSwapError } = await supabase
    .from("humor_flavor_steps")
    .update({
      order_by: adjacent.order_by,
      modified_by_user_id: user.id,
      modified_datetime_utc,
    })
    .eq("id", current.id);

  if (thirdSwapError) {
    throw new Error(
      `Failed to move humor flavor step ${current.id} (final swap): ${thirdSwapError.message}`
    );
  }

  revalidatePath("/admin/humor-flavors");
}

export async function moveHumorFlavorStepUp(formData: FormData) {
  await moveHumorFlavorStep(formData, "up");
}

export async function moveHumorFlavorStepDown(formData: FormData) {
  await moveHumorFlavorStep(formData, "down");
}

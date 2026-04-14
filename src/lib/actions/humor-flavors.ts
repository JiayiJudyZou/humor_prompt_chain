"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function getRequiredId(formData: FormData): number {
  const raw = getRequiredString(formData, "id");
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }

  return id;
}

export type CreateHumorFlavorResult =
  | { ok: true }
  | { ok: false; errorCode: "duplicate_slug" };

export async function createHumorFlavor(
  _prevState: CreateHumorFlavorResult | null,
  formData: FormData,
): Promise<CreateHumorFlavorResult> {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();

  const slug = getRequiredString(formData, "slug");
  const description = getNullableString(formData, "description");

  const { error } = await supabase.from("humor_flavors").insert({
    slug,
    description,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });

  if (error) {
    const isDuplicateSlug =
      error.code === "23505" &&
      (error.message.includes("humor_flavors_slug_key") ||
        error.details?.includes("(slug)"));

    if (isDuplicateSlug) {
      return { ok: false as const, errorCode: "duplicate_slug" as const };
    }

    throw new Error(`Failed to create humor flavor: ${error.message}`);
  }

  revalidatePath("/admin/humor-flavors");
  return { ok: true as const };
}

export async function updateHumorFlavor(formData: FormData) {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();

  const id = getRequiredId(formData);
  const slug = getRequiredString(formData, "slug");
  const description = getNullableString(formData, "description");

  const { error } = await supabase
    .from("humor_flavors")
    .update({
      slug,
      description,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update humor flavor ${id}: ${error.message}`);
  }

  revalidatePath("/admin/humor-flavors");
}

export type DeleteHumorFlavorResult = { ok: true } | { ok: false; message: string };

export async function deleteHumorFlavor(
  _prevState: DeleteHumorFlavorResult | null,
  formData: FormData,
): Promise<DeleteHumorFlavorResult> {
  await requirePromptChainAdmin();
  const supabase = await createClient();

  const id = getRequiredId(formData);

  const { error: deleteStepsError } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("humor_flavor_id", id);

  if (deleteStepsError) {
    return {
      ok: false,
      message: "Unable to delete this humor flavor right now. Please try again.",
    };
  }

  const { error: deleteFlavorError } = await supabase.from("humor_flavors").delete().eq("id", id);

  if (deleteFlavorError) {
    return {
      ok: false,
      message: "Unable to delete this humor flavor right now. Please try again.",
    };
  }

  revalidatePath("/admin/humor-flavors");
  redirect("/admin/humor-flavors");
}

type MinimalSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function isDuplicateSlugError(error: { code?: string; message: string; details?: string | null }) {
  return (
    error.code === "23505" &&
    (error.message.includes("humor_flavors_slug_key") || error.details?.includes("(slug)"))
  );
}

async function generateUniqueCopySlug(
  supabase: MinimalSupabaseClient,
  sourceSlug: string,
): Promise<string> {
  const baseSlug = `${sourceSlug}-copy`;

  for (let suffix = 1; suffix <= 200; suffix += 1) {
    const candidate = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
    const { data, error } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      throw new Error(`Failed to validate humor flavor slug "${candidate}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      return candidate;
    }
  }

  throw new Error(`Unable to generate a unique copy slug for "${sourceSlug}"`);
}

export type DuplicateHumorFlavorResult =
  | { ok: true }
  | { ok: false; message: string };

export async function duplicateHumorFlavor(
  _prevState: DuplicateHumorFlavorResult | null,
  formData: FormData,
): Promise<DuplicateHumorFlavorResult> {
  const { user } = await requirePromptChainAdmin();
  const supabase = await createClient();
  const modified_datetime_utc = new Date().toISOString();

  const sourceFlavorId = getRequiredId(formData);

  const { data: sourceFlavor, error: sourceFlavorError } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .eq("id", sourceFlavorId)
    .single();

  if (sourceFlavorError || !sourceFlavor) {
    return {
      ok: false,
      message: "Unable to duplicate this flavor right now. Please try again.",
    };
  }

  const { data: sourceSteps, error: sourceStepsError } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", sourceFlavorId)
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  if (sourceStepsError) {
    return {
      ok: false,
      message: "Unable to duplicate this flavor right now. Please try again.",
    };
  }

  let copiedFlavorId: number | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const copiedSlug = await generateUniqueCopySlug(supabase, sourceFlavor.slug);

    const { data: copiedFlavor, error: copiedFlavorError } = await supabase
      .from("humor_flavors")
      .insert({
        slug: copiedSlug,
        description: sourceFlavor.description,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
        modified_datetime_utc,
      })
      .select("id")
      .single();

    if (!copiedFlavorError && copiedFlavor) {
      copiedFlavorId = copiedFlavor.id;
      break;
    }

    if (!copiedFlavorError || !isDuplicateSlugError(copiedFlavorError)) {
      return {
        ok: false,
        message: "Unable to duplicate this flavor right now. Please try again.",
      };
    }
  }

  if (!copiedFlavorId) {
    return {
      ok: false,
      message: "Unable to duplicate this flavor right now. Please try again.",
    };
  }

  if (sourceSteps && sourceSteps.length > 0) {
    const { error: copiedStepsError } = await supabase.from("humor_flavor_steps").insert(
      sourceSteps.map((step) => ({
        humor_flavor_id: copiedFlavorId,
        llm_temperature: step.llm_temperature,
        order_by: step.order_by,
        llm_input_type_id: step.llm_input_type_id,
        llm_output_type_id: step.llm_output_type_id,
        llm_model_id: step.llm_model_id,
        humor_flavor_step_type_id: step.humor_flavor_step_type_id,
        llm_system_prompt: step.llm_system_prompt,
        llm_user_prompt: step.llm_user_prompt,
        description: step.description,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
        modified_datetime_utc,
      })),
    );

    if (copiedStepsError) {
      await supabase.from("humor_flavors").delete().eq("id", copiedFlavorId);
      return {
        ok: false,
        message: "Unable to duplicate this flavor right now. Please try again.",
      };
    }
  }

  revalidatePath("/admin/humor-flavors");
  return { ok: true };
}

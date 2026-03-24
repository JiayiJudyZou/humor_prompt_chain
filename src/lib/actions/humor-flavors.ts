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

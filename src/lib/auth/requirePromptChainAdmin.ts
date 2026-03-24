import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requirePromptChainAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    redirect("/unauthorized");
  }

  if (!profile) {
    redirect("/unauthorized");
  }

  if (!profile.is_superadmin && !profile.is_matrix_admin) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

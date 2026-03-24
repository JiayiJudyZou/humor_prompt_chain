import AdminShell from "@/components/humor-flavors/AdminShell";
import AdminSidebar from "@/components/humor-flavors/AdminSidebar";
import TestFlavorPanel from "@/components/humor-flavors/TestFlavorPanel";
import { requirePromptChainAdmin } from "@/lib/auth/requirePromptChainAdmin";
import { getHumorFlavors } from "@/lib/queries/humor-flavors";

type PageProps = {
  searchParams: Promise<{
    selectedFlavorId?: string | string[];
  }>;
};

function pickString(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function parseSelectedFlavorId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function HumorFlavorTestPage({ searchParams }: PageProps) {
  const { user, profile } = await requirePromptChainAdmin();
  const params = await searchParams;
  const flavors = await getHumorFlavors();

  const rawSelectedFlavorId = Array.isArray(params.selectedFlavorId)
    ? params.selectedFlavorId[0]
    : params.selectedFlavorId;
  const hasSelectedFlavorInQuery =
    typeof rawSelectedFlavorId === "string" && rawSelectedFlavorId.trim().length > 0;

  const selectedFlavorIdFromQuery = parseSelectedFlavorId(params.selectedFlavorId);
  const selectedFlavorId = hasSelectedFlavorInQuery
    ? selectedFlavorIdFromQuery
    : (flavors[0]?.id ?? null);
  const selectedFlavor =
    selectedFlavorId === null
      ? null
      : flavors.find((flavor) => flavor.id === selectedFlavorId) ?? null;

  const adminEmail = user.email ?? "unknown-admin";
  const userMetadata =
    user.user_metadata && typeof user.user_metadata === "object"
      ? (user.user_metadata as Record<string, unknown>)
      : {};
  const firstName = pickString(
    userMetadata.first_name,
    userMetadata.given_name,
    typeof userMetadata.full_name === "string"
      ? userMetadata.full_name.split(" ")[0]
      : null,
    typeof userMetadata.name === "string" ? userMetadata.name.split(" ")[0] : null
  );
  const displayName = pickString(
    userMetadata.full_name,
    userMetadata.name,
    firstName
  ) ?? adminEmail;
  const adminProfile = {
    email: adminEmail,
    displayName,
    avatarSeed: firstName ?? adminEmail,
    isSuperAdmin: Boolean(profile.is_superadmin),
    isMatrixAdmin: Boolean(profile.is_matrix_admin),
  };

  return (
    <AdminShell
      title="Humor Flavor Test"
      subtitle="Generate five short funny captions using the selected humor flavor and an image"
      adminProfile={adminProfile}
      activeItem="humor-flavor-test"
      sidebar={
        <AdminSidebar
          activeItem="humor-flavor-test"
          adminProfile={adminProfile}
        />
      }
      topBar={null}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
        <section className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Humor Flavor Test
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Generate five short funny captions using the selected humor flavor
            and an image URL or upload.
          </p>
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-5 xl:flex-row">
          <div className="min-h-0 xl:w-80 xl:shrink-0">
            <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Flavors</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select a humor flavor to run tests.
                </p>
              </div>

              {flavors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 p-5 text-center dark:border-rose-300/35 dark:bg-rose-500/10">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    No humor flavors yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Create flavors first in the Humor Flavors admin page.
                  </p>
                </div>
              ) : (
                <div className="mt-1 pr-1">
                  <ul className="space-y-2.5">
                    {flavors.map((flavor) => {
                      const isActive = flavor.id === selectedFlavorId;

                      return (
                        <li key={flavor.id}>
                          <a
                            href={`/admin/humor-flavor-test?selectedFlavorId=${flavor.id}`}
                            className={`block rounded-xl border p-3 transition ${
                              isActive
                                ? "border-rose-200 bg-rose-100/75 shadow-[0_8px_20px_rgba(190,24,93,0.10)] dark:border-rose-300/45 dark:bg-rose-500/20 dark:shadow-[0_8px_22px_rgba(244,63,94,0.24)]"
                                : "border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/70 dark:border-rose-400/20 dark:bg-[#11111a] dark:hover:border-rose-300/35 dark:hover:bg-rose-500/10"
                            }`}
                          >
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{flavor.slug}</p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              {flavor.description ?? "No description"}
                            </p>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1">
            <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
              <TestFlavorPanel
                selectedFlavorId={selectedFlavor?.id ?? null}
                selectedFlavorSlug={selectedFlavor?.slug ?? null}
              />
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

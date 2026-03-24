import Link from "next/link";
import AdminShell from "@/components/humor-flavors/AdminShell";
import AdminSidebar from "@/components/humor-flavors/AdminSidebar";
import CreateFlavorSection from "@/components/humor-flavors/CreateFlavorSection";
import ExpandedFlavorWorkspace from "@/components/humor-flavors/ExpandedFlavorWorkspace";
import { requirePromptChainAdmin } from "@/lib/auth/requirePromptChainAdmin";
import {
  getHumorFlavorSteps,
  getHumorFlavors,
} from "@/lib/queries/humor-flavors";
import {
  getHumorFlavorStepTypes,
  getLlmInputTypes,
  getLlmModels,
  getLlmOutputTypes,
} from "@/lib/queries/lookup";

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

function parseSelectedFlavorId(
  value: string | string[] | undefined
): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseFlavorId(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") return null;
  if (value.trim().length === 0) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function HumorFlavorsPage({ searchParams }: PageProps) {
  const { user, profile } = await requirePromptChainAdmin();

  const params = await searchParams;
  const selectedFlavorId = parseSelectedFlavorId(params.selectedFlavorId);

  const flavors = await getHumorFlavors();
  const selectedFlavor =
    selectedFlavorId === null
      ? null
      : flavors.find((flavor) => parseFlavorId(flavor.id) === selectedFlavorId) ??
        null;
  const selectedFlavorNumericId = selectedFlavor
    ? parseFlavorId(selectedFlavor.id)
    : null;

  const steps = selectedFlavorNumericId
    ? await getHumorFlavorSteps(selectedFlavorNumericId)
    : [];
  const [humorFlavorStepTypes, llmInputTypes, llmOutputTypes, llmModels] =
    selectedFlavor
      ? await Promise.all([
          getHumorFlavorStepTypes(),
          getLlmInputTypes(),
          getLlmOutputTypes(),
          getLlmModels(),
        ])
      : [[], [], [], []];

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
  const displayName =
    pickString(userMetadata.full_name, userMetadata.name, firstName) ?? adminEmail;

  const adminProfile = {
    email: adminEmail,
    displayName,
    avatarSeed: firstName ?? adminEmail,
    isSuperAdmin: Boolean(profile.is_superadmin),
    isMatrixAdmin: Boolean(profile.is_matrix_admin),
  };

  return (
    <AdminShell
      title="Humor Flavor Admin"
      subtitle="Manage humor flavors and prompt chain steps"
      adminProfile={adminProfile}
      activeItem="humor-flavors"
      sidebar={
        <AdminSidebar
          activeItem="humor-flavors"
          adminProfile={adminProfile}
        />
      }
      topBar={null}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <CreateFlavorSection />

        <section className="rounded-2xl border border-rose-100 bg-white/92 p-4 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-rose-100 pb-4 dark:border-rose-400/20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
                Library
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
                Humor Flavors
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Select a flavor to open its step workspace.
              </p>
            </div>
            <p className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:border-rose-300/30 dark:bg-rose-500/15 dark:text-rose-100">
              {flavors.length} total
            </p>
          </div>

          {flavors.length > 0 && selectedFlavorId && !selectedFlavor ? (
            <div className="mb-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-4 dark:border-rose-300/35 dark:bg-rose-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
                Selection Missing
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                The selected flavor no longer exists. Pick one from the list below.
              </p>
            </div>
          ) : null}

          {flavors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 p-6 text-center dark:border-rose-300/35 dark:bg-rose-500/10">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No humor flavors yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Create your first flavor to begin building a prompt-step pipeline.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {flavors.map((flavor) => {
                const flavorId = parseFlavorId(flavor.id);
                const isActive =
                  flavorId !== null &&
                  selectedFlavorNumericId !== null &&
                  flavorId === selectedFlavorNumericId;
                const flavorHref = isActive
                  ? "/admin/humor-flavors"
                  : `/admin/humor-flavors?selectedFlavorId=${flavor.id}`;

                return (
                  <li key={flavor.id} className="rounded-2xl">
                    <Link
                      href={flavorHref}
                      className={`block rounded-xl border p-3 transition sm:p-3.5 ${
                        isActive
                          ? "border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 shadow-[0_10px_22px_rgba(190,24,93,0.12)] dark:border-rose-300/45 dark:bg-gradient-to-r dark:from-rose-500/20 dark:to-pink-500/14 dark:shadow-[0_10px_24px_rgba(244,63,94,0.24)]"
                          : "border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/70 dark:border-rose-400/20 dark:bg-[#11111a] dark:hover:border-rose-300/35 dark:hover:bg-rose-500/10"
                      }`}
                      aria-expanded={isActive}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                            {flavor.slug}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {flavor.description ?? "No description"}
                          </p>
                        </div>
                        <span
                          className={`mt-0.5 inline-flex shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                            isActive
                              ? "border-rose-300 bg-white/80 text-slate-700 dark:border-rose-300/45 dark:bg-rose-500/15 dark:text-rose-100"
                              : "border-rose-200 bg-white text-slate-500 dark:border-rose-400/30 dark:bg-[#181821] dark:text-slate-300"
                          }`}
                        >
                          {isActive ? "Collapse" : "Open"}
                        </span>
                      </div>
                    </Link>

                    {isActive && selectedFlavor && selectedFlavorNumericId ? (
                      <ExpandedFlavorWorkspace
                        flavor={selectedFlavor}
                        humorFlavorId={selectedFlavorNumericId}
                        steps={steps}
                        humorFlavorStepTypes={humorFlavorStepTypes}
                        llmInputTypes={llmInputTypes}
                        llmOutputTypes={llmOutputTypes}
                        llmModels={llmModels}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

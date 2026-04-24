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
    page?: string | string[];
    q?: string | string[];
  }>;
};

const FLAVORS_PER_PAGE = 8;

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

function parsePageNumber(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
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

function flavorMatchesQuery(
  flavor: { slug: string | null; description: string | null },
  query: string
): boolean {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  const slug = flavor.slug?.toLowerCase() ?? "";
  const description = flavor.description?.toLowerCase() ?? "";
  return slug.includes(normalizedQuery) || description.includes(normalizedQuery);
}

function buildHumorFlavorsHref({
  page,
  selectedFlavorId,
  q,
}: {
  page?: number;
  selectedFlavorId?: number | string | null;
  q?: string;
}): string {
  const search = new URLSearchParams();

  if (page && page > 1) {
    search.set("page", String(page));
  }

  if (selectedFlavorId !== null && selectedFlavorId !== undefined) {
    search.set("selectedFlavorId", String(selectedFlavorId));
  }

  if (q) {
    search.set("q", q);
  }

  const queryString = search.toString();
  return queryString
    ? `/admin/humor-flavors?${queryString}`
    : "/admin/humor-flavors";
}

export default async function HumorFlavorsPage({ searchParams }: PageProps) {
  const { user, profile } = await requirePromptChainAdmin();

  const params = await searchParams;
  const selectedFlavorId = parseSelectedFlavorId(params.selectedFlavorId);
  const requestedPage = parsePageNumber(params.page);
  const searchQuery = parseSearchQuery(params.q);

  const flavors = await getHumorFlavors();
  const selectedFlavor =
    selectedFlavorId === null
      ? null
      : flavors.find((flavor) => parseFlavorId(flavor.id) === selectedFlavorId) ??
        null;
  const selectedFlavorNumericId = selectedFlavor
    ? parseFlavorId(selectedFlavor.id)
    : null;
  const filteredFlavors = flavors.filter((flavor) =>
    flavorMatchesQuery(flavor, searchQuery)
  );
  const displayFlavors =
    selectedFlavor &&
    !filteredFlavors.some(
      (flavor) => parseFlavorId(flavor.id) === selectedFlavorNumericId
    )
      ? [selectedFlavor, ...filteredFlavors]
      : filteredFlavors;
  const totalPages = Math.max(1, Math.ceil(displayFlavors.length / FLAVORS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStartIndex = (currentPage - 1) * FLAVORS_PER_PAGE;
  const paginatedFlavors = displayFlavors.slice(
    pageStartIndex,
    pageStartIndex + FLAVORS_PER_PAGE
  );
  const selectedFlavorPage =
    selectedFlavorNumericId === null
      ? null
      : (() => {
          const selectedIndex = displayFlavors.findIndex(
            (flavor) => parseFlavorId(flavor.id) === selectedFlavorNumericId
          );
          return selectedIndex >= 0
            ? Math.floor(selectedIndex / FLAVORS_PER_PAGE) + 1
            : null;
        })();

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
      <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
        <CreateFlavorSection />

        <section className="admin-surface p-4 sm:p-5">
          <div className="admin-divider mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
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
            <p className="admin-pill">
              {displayFlavors.length} shown
            </p>
          </div>

          <form action="/admin/humor-flavors" method="get" className="mb-4">
            {selectedFlavorNumericId ? (
              <input
                type="hidden"
                name="selectedFlavorId"
                value={selectedFlavorNumericId}
              />
            ) : null}
            <div className="admin-surface-subtle flex items-center gap-2 p-2">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search humor flavors..."
                className="admin-input h-10 rounded-lg"
              />
              {searchQuery ? (
                <Link
                  href={buildHumorFlavorsHref({
                    page: selectedFlavorPage ?? undefined,
                    selectedFlavorId: selectedFlavorNumericId,
                  })}
                  className="admin-button-secondary h-10 shrink-0 rounded-lg px-3 text-xs uppercase tracking-[0.08em]"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          {flavors.length > 0 && selectedFlavorId && !selectedFlavor ? (
            <div className="admin-empty mb-3 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500 dark:text-rose-300">
                Selection Missing
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                The selected flavor no longer exists. Pick one from the list below.
              </p>
            </div>
          ) : null}

          {flavors.length === 0 ? (
            <div className="admin-empty">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No humor flavors yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Create your first flavor to begin building a prompt-step pipeline.
              </p>
            </div>
          ) : displayFlavors.length === 0 ? (
            <div className="admin-empty">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                No matching humor flavors
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Try another keyword for slug or description.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {paginatedFlavors.map((flavor) => {
                const flavorId = parseFlavorId(flavor.id);
                const isActive =
                  flavorId !== null &&
                  selectedFlavorNumericId !== null &&
                  flavorId === selectedFlavorNumericId;
                const flavorHref = isActive
                  ? buildHumorFlavorsHref({
                      page: currentPage,
                      q: searchQuery || undefined,
                    })
                  : buildHumorFlavorsHref({
                      page: currentPage,
                      selectedFlavorId: flavor.id,
                      q: searchQuery || undefined,
                    });

                return (
                  <li key={flavor.id} className="rounded-2xl">
                    <Link
                      href={flavorHref}
                      className={`block rounded-xl p-3 transition duration-200 sm:p-3.5 ${
                        isActive
                          ? "bg-gradient-to-r from-rose-100/90 to-amber-50/80 shadow-lg shadow-rose-900/15 dark:from-rose-500/24 dark:to-pink-500/16 dark:shadow-rose-900/35"
                          : "bg-white/85 hover:-translate-y-0.5 hover:bg-rose-50/70 hover:shadow-md hover:shadow-rose-900/10 dark:bg-[#11111a] dark:hover:bg-rose-500/10 dark:hover:shadow-rose-900/30"
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
                              ? "border-rose-300 bg-white/85 text-slate-700 dark:border-rose-300/45 dark:bg-rose-500/15 dark:text-rose-100"
                              : "border-rose-200/80 bg-white/85 text-slate-500 dark:border-rose-400/30 dark:bg-[#181821] dark:text-slate-300"
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

              {totalPages > 1 ? (
                <div className="admin-divider mt-4 flex items-center justify-center gap-2 border-t pt-4">
                  {currentPage > 1 ? (
                    <Link
                      href={buildHumorFlavorsHref({
                        page: currentPage - 1,
                        selectedFlavorId:
                          selectedFlavorPage === currentPage - 1
                            ? selectedFlavorNumericId
                            : null,
                        q: searchQuery || undefined,
                      })}
                      className="admin-button-secondary min-w-[90px] rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex min-w-[90px] items-center justify-center rounded-full border border-rose-100/70 bg-rose-50/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-slate-400">
                      Previous
                    </span>
                  )}

                  <p className="admin-pill px-3 py-1.5 tracking-[0.12em]">
                    Page {currentPage} / {totalPages}
                  </p>

                  {currentPage < totalPages ? (
                    <Link
                      href={buildHumorFlavorsHref({
                        page: currentPage + 1,
                        selectedFlavorId:
                          selectedFlavorPage === currentPage + 1
                            ? selectedFlavorNumericId
                            : null,
                        q: searchQuery || undefined,
                      })}
                      className="admin-button-secondary min-w-[90px] rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex min-w-[90px] items-center justify-center rounded-full border border-rose-100/70 bg-rose-50/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-slate-400">
                      Next
                    </span>
                  )}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

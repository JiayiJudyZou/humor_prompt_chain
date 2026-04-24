import Link from "next/link";
import AdminShell from "@/components/humor-flavors/AdminShell";
import AdminSidebar from "@/components/humor-flavors/AdminSidebar";
import TestFlavorPanel from "@/components/humor-flavors/TestFlavorPanel";
import { requirePromptChainAdmin } from "@/lib/auth/requirePromptChainAdmin";
import { getHumorFlavors } from "@/lib/queries/humor-flavors";

type PageProps = {
  searchParams: Promise<{
    selectedFlavorId?: string | string[];
    q?: string | string[];
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

function parseSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
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

function buildFlavorTestHref({
  selectedFlavorId,
  q,
}: {
  selectedFlavorId?: number | string | null;
  q?: string;
}): string {
  const search = new URLSearchParams();

  if (selectedFlavorId !== null && selectedFlavorId !== undefined) {
    search.set("selectedFlavorId", String(selectedFlavorId));
  }

  if (q) {
    search.set("q", q);
  }

  const queryString = search.toString();
  return queryString
    ? `/admin/humor-flavor-test?${queryString}`
    : "/admin/humor-flavor-test";
}

export default async function HumorFlavorTestPage({ searchParams }: PageProps) {
  const { user, profile } = await requirePromptChainAdmin();
  const params = await searchParams;
  const flavors = await getHumorFlavors();
  const searchQuery = parseSearchQuery(params.q);
  const filteredFlavors = flavors.filter((flavor) =>
    flavorMatchesQuery(flavor, searchQuery)
  );

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
        <section className="admin-surface p-5 sm:p-6">
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
            <div className="admin-surface flex h-full min-h-0 flex-col overflow-y-auto p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Flavors</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select a humor flavor to run tests.
                </p>
              </div>

              <form action="/admin/humor-flavor-test" method="get" className="mb-4">
                {selectedFlavorId ? (
                  <input
                    type="hidden"
                    name="selectedFlavorId"
                    value={selectedFlavorId}
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
                      href={buildFlavorTestHref({
                        selectedFlavorId,
                      })}
                      className="admin-button-secondary h-10 shrink-0 rounded-lg px-3 text-xs uppercase tracking-[0.08em]"
                    >
                      Clear
                    </Link>
                  ) : null}
                </div>
              </form>

              {flavors.length === 0 ? (
                <div className="admin-empty p-5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    No humor flavors yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Create flavors first in the Humor Flavors admin page.
                  </p>
                </div>
              ) : filteredFlavors.length === 0 ? (
                <div className="admin-empty p-5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    No matching humor flavors
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Try another keyword for slug or description.
                  </p>
                </div>
              ) : (
                <div className="mt-1 pr-1">
                  <ul className="space-y-2.5">
                    {filteredFlavors.map((flavor) => {
                      const isActive = flavor.id === selectedFlavorId;

                      return (
                        <li key={flavor.id}>
                          <a
                            href={buildFlavorTestHref({
                              selectedFlavorId: flavor.id,
                              q: searchQuery || undefined,
                            })}
                            className={`block rounded-xl p-3 transition duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-rose-100/90 to-amber-50/80 shadow-lg shadow-rose-900/15 dark:from-rose-500/24 dark:to-pink-500/16 dark:shadow-rose-900/35"
                                : "bg-white/85 hover:-translate-y-0.5 hover:bg-rose-50/70 hover:shadow-md hover:shadow-rose-900/10 dark:bg-[#11111a] dark:hover:bg-rose-500/10 dark:hover:shadow-rose-900/30"
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
            <div className="admin-surface flex h-full min-h-0 flex-col overflow-y-auto p-5 sm:p-6">
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

import Link from "next/link";
import AdminShell from "@/components/humor-flavors/AdminShell";
import AdminSidebar from "@/components/humor-flavors/AdminSidebar";
import { requirePromptChainAdmin } from "@/lib/auth/requirePromptChainAdmin";
import { getCaptionsByHumorFlavorId } from "@/lib/queries/captions";
import { getHumorFlavors } from "@/lib/queries/humor-flavors";

type PageProps = {
  searchParams: Promise<{
    selectedFlavorId?: string | string[];
  }>;
};

type CaptionRow = Awaited<
  ReturnType<typeof getCaptionsByHumorFlavorId>
>[number];

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

function readCaptionText(row: CaptionRow): string | null {
  const preferredKeys = [
    "caption",
    "content",
    "text",
    "final_caption",
    "generated_caption",
    "value",
  ];

  for (const key of preferredKeys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function formatUtcDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function readVisibilityStatus(row: CaptionRow): "Public" | "Private" | null {
  const publicKeys = ["is_public", "public", "isPublic"];
  for (const key of publicKeys) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value ? "Public" : "Private";
    }
  }

  const privateKeys = ["is_private", "private", "isPrivate"];
  for (const key of privateKeys) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value ? "Private" : "Public";
    }
  }

  const statusKeys = ["visibility", "status", "privacy_status"];
  for (const key of statusKeys) {
    const value = row[key];
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "public") return "Public";
      if (normalized === "private") return "Private";
    }
  }

  return null;
}

export default async function HumorFlavorCaptionsPage({ searchParams }: PageProps) {
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
  const selectedFlavorNumericId = selectedFlavor?.id ?? null;

  const captions =
    selectedFlavorNumericId === null
      ? []
      : await getCaptionsByHumorFlavorId(selectedFlavorNumericId);

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
      title="Flavor Captions"
      subtitle="Read captions produced by a specific humor flavor"
      adminProfile={adminProfile}
      activeItem="humor-flavor-captions"
      sidebar={
        <AdminSidebar
          activeItem="humor-flavor-captions"
          adminProfile={adminProfile}
        />
      }
      topBar={null}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
        <section className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Flavor Captions
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Read captions produced by a specific humor flavor.
          </p>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-rose-400/25 dark:bg-[#171620]/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-rose-100 pb-4 dark:border-rose-400/20">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">Flavors</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Click a humor flavor to read its generated captions.
              </p>
            </div>
            <p className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:border-rose-300/30 dark:bg-rose-500/15 dark:text-rose-100">
              {flavors.length} total
            </p>
          </div>

          {flavors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 p-6 text-center dark:border-rose-300/35 dark:bg-rose-500/10">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No humor flavors yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Create flavors first in the Humor Flavors admin page.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {flavors.map((flavor) => {
                const isActive = flavor.id === selectedFlavorNumericId;

                return (
                  <li key={flavor.id} className="rounded-2xl">
                    <Link
                      href={`/admin/humor-flavor-captions?selectedFlavorId=${flavor.id}`}
                      className={`block rounded-xl border p-4 transition ${
                        isActive
                          ? "border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 shadow-[0_10px_22px_rgba(190,24,93,0.12)] dark:border-rose-300/45 dark:bg-gradient-to-r dark:from-rose-500/20 dark:to-pink-500/14 dark:shadow-[0_10px_24px_rgba(244,63,94,0.24)]"
                          : "border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/70 dark:border-rose-400/20 dark:bg-[#11111a] dark:hover:border-rose-300/35 dark:hover:bg-rose-500/10"
                      }`}
                      aria-current={isActive ? "page" : undefined}
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
                          {isActive ? "Selected" : "Open"}
                        </span>
                      </div>
                    </Link>

                    {isActive ? (
                      <div className="mt-2 rounded-xl border border-rose-200 bg-white/85 p-4 dark:border-rose-300/30 dark:bg-[#11111a]/90 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Captions for {flavor.slug}
                          </p>
                          <p className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:border-rose-300/30 dark:bg-rose-500/15 dark:text-rose-100">
                            {captions.length} captions
                          </p>
                        </div>

                        {captions.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/70 p-5 text-center dark:border-rose-300/35 dark:bg-rose-500/10">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              No captions found for this humor flavor yet.
                            </p>
                          </div>
                        ) : (
                          <ul className="space-y-2.5">
                            {captions.map((captionRow, index) => {
                              const captionText = readCaptionText(captionRow);
                              const formattedCreatedDate = formatUtcDate(
                                captionRow.created_datetime_utc
                              );
                              const visibilityStatus = readVisibilityStatus(captionRow);

                              return (
                                <li
                                  key={captionRow.id}
                                  className="rounded-xl border border-rose-100 bg-gradient-to-r from-white to-rose-50/40 p-4 shadow-[0_6px_16px_rgba(15,23,42,0.04)] dark:border-rose-400/20 dark:bg-gradient-to-r dark:from-[#13131c] dark:to-[#1f1622] dark:shadow-[0_8px_20px_rgba(0,0,0,0.38)]"
                                >
                                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-500 dark:text-rose-300">
                                    Caption {index + 1}
                                  </p>
                                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-900 dark:text-slate-100">
                                    {captionText ?? "No readable caption text field found."}
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                                    {formattedCreatedDate ? (
                                      <span className="rounded-full border border-rose-100 bg-white px-2 py-1 dark:border-rose-300/30 dark:bg-[#0f0f17]">
                                        {formattedCreatedDate}
                                      </span>
                                    ) : null}
                                    <span className="rounded-full border border-rose-100 bg-white px-2 py-1 dark:border-rose-300/30 dark:bg-[#0f0f17]">
                                      id {captionRow.id}
                                    </span>
                                    {visibilityStatus ? (
                                      <span className="rounded-full border border-rose-100 bg-white px-2 py-1 dark:border-rose-300/30 dark:bg-[#0f0f17]">
                                        {visibilityStatus}
                                      </span>
                                    ) : null}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
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

import Link from "next/link";
import { signOutAdmin } from "@/lib/actions/auth";
import ThemeToggle from "./ThemeToggle";
import type { SidebarItemKey } from "./sidebar-types";

type SidebarItem = {
  key: SidebarItemKey;
  label: string;
  href: string;
};

type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

const sections: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      {
        key: "humor-flavors",
        label: "Humor Flavors",
        href: "/admin/humor-flavors",
      },
      {
        key: "humor-flavor-test",
        label: "Humor Flavor Test",
        href: "/admin/humor-flavor-test",
      },
      {
        key: "humor-flavor-captions",
        label: "Flavor Captions",
        href: "/admin/humor-flavor-captions",
      },
    ],
  },
];

export type AdminSidebarProps = {
  activeItem?: SidebarItemKey;
  adminProfile: {
    email: string;
    displayName: string;
    avatarSeed: string;
    isSuperAdmin: boolean;
    isMatrixAdmin: boolean;
  };
};

export default function AdminSidebar({
  activeItem,
  adminProfile,
}: AdminSidebarProps) {
  const roleLabel = adminProfile.isSuperAdmin
    ? "Super admin workspace"
    : adminProfile.isMatrixAdmin
      ? "Matrix admin workspace"
      : null;
  const avatarSource = adminProfile.avatarSeed || adminProfile.email;
  const avatarInitial = avatarSource.trim().charAt(0).toUpperCase() || "A";

  return (
    <aside className="admin-surface relative flex h-full min-h-0 flex-col overflow-y-auto p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent dark:via-rose-300/25"
      />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Admin Workspace
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Humor Flavor Admin
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage humor flavors and prompt chain steps
        </p>
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Theme
          </p>
          <ThemeToggle />
        </div>
      </div>

      <nav className="mt-7 space-y-6" aria-label="Admin sections">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = item.key === activeItem;

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative block rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-rose-100/90 to-amber-50/75 text-slate-900 shadow-lg shadow-rose-900/15 dark:from-rose-500/28 dark:to-pink-500/20 dark:text-rose-50 dark:shadow-rose-900/35"
                          : "text-slate-700 hover:bg-rose-50/70 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-50"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-1 left-1 w-1 rounded-full transition ${
                          isActive
                            ? "bg-rose-400/90 dark:bg-rose-300/90"
                            : "bg-transparent group-hover:bg-rose-200/80 dark:group-hover:bg-rose-400/35"
                        }`}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-divider mt-8 border-t pt-4 md:mt-auto">
        <div className="admin-surface-subtle rounded-3xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Account
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rose-200/80 bg-white/95 text-base font-semibold text-rose-500 shadow-md shadow-rose-900/10 dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-rose-300 dark:shadow-black/40">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {adminProfile.displayName}
              </p>
              <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                {adminProfile.email}
              </p>
            </div>
          </div>

          {roleLabel ? (
            <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
              {roleLabel}
            </p>
          ) : null}

          <form action={signOutAdmin} className="mt-4">
            <button
              type="submit"
              className="admin-button-secondary w-full rounded-2xl py-3"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

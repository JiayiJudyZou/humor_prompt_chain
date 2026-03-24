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
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto rounded-2xl border border-rose-100 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-rose-400/25 dark:bg-[#15141c]/88 dark:shadow-[0_16px_34px_rgba(0,0,0,0.45)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
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

      <nav className="mt-6 space-y-5" aria-label="Admin sections">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const isActive = item.key === activeItem;

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "border-rose-200 bg-rose-100/80 text-slate-900 shadow-[0_6px_18px_rgba(190,24,93,0.10)] dark:border-rose-300/35 dark:bg-rose-500/20 dark:text-rose-50 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)]"
                          : "border-rose-100 bg-white/80 text-slate-700 hover:border-rose-200 hover:bg-rose-50/80 dark:border-rose-400/20 dark:bg-[#11111a]/90 dark:text-slate-200 dark:hover:border-rose-300/35 dark:hover:bg-rose-500/12"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 border-t border-rose-100/90 pt-4 dark:border-rose-400/20 md:mt-auto">
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-b from-rose-50/90 to-orange-50/80 p-4 shadow-[0_14px_30px_rgba(190,24,93,0.10)] dark:border-rose-300/25 dark:bg-gradient-to-b dark:from-[#211723] dark:to-[#17151f] dark:shadow-[0_16px_32px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Account
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-base font-semibold text-rose-500 shadow-[0_6px_16px_rgba(15,23,42,0.07)] dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-rose-300 dark:shadow-[0_8px_18px_rgba(0,0,0,0.5)]">
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
              className="w-full rounded-2xl border border-rose-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 dark:border-rose-300/35 dark:bg-[#0f0f17] dark:text-rose-100 dark:hover:bg-rose-500/15"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

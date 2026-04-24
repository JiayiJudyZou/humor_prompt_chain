import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import type { SidebarItemKey } from "./sidebar-types";

export type AdminShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  adminProfile: {
    email: string;
    displayName: string;
    avatarSeed: string;
    isSuperAdmin: boolean;
    isMatrixAdmin: boolean;
  };
  activeItem?: SidebarItemKey;
  topBarRight?: ReactNode;
  sidebar?: ReactNode;
  topBar?: ReactNode;
};

export default function AdminShell({
  children,
  title,
  subtitle,
  adminProfile,
  activeItem,
  topBarRight,
  sidebar,
  topBar,
}: AdminShellProps) {
  return (
    <main className="relative h-screen overflow-hidden px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rose-100/40 to-transparent dark:from-rose-500/10"
      />
      <div className="relative mx-auto flex h-full max-w-[1220px] min-h-0 flex-col gap-4 md:flex-row md:gap-5">
        <div className="md:h-full md:w-[17.25rem] md:shrink-0">
          <div className="h-full md:sticky md:top-0">
            {sidebar ?? (
              <AdminSidebar activeItem={activeItem} adminProfile={adminProfile} />
            )}
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col md:min-w-0">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2 pr-1 sm:gap-5">
            {topBar === undefined ? (
              <AdminTopBar title={title} subtitle={subtitle} rightSlot={topBarRight} />
            ) : topBar}

            <div className="flex min-h-0 flex-1 flex-col">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

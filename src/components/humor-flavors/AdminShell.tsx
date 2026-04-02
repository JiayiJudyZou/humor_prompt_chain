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
    <main className="h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex h-full max-w-7xl min-h-0 flex-col gap-4 md:flex-row md:gap-6">
        <div className="md:h-full md:w-64 md:shrink-0">
          <div className="h-full md:sticky md:top-0">
            {sidebar ?? (
              <AdminSidebar activeItem={activeItem} adminProfile={adminProfile} />
            )}
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col md:min-w-0">
          <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pb-1 pr-1 sm:space-y-5">
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

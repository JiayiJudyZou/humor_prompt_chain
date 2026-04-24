import type { ReactNode } from "react";

export type AdminTopBarProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export default function AdminTopBar({
  title,
  subtitle,
  rightSlot,
}: AdminTopBarProps) {
  return (
    <header className="admin-surface relative overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-8 top-0 h-24 w-36 rounded-full bg-rose-200/35 blur-3xl dark:bg-rose-500/20"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Admin Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="sm:pt-1">{rightSlot}</div> : null}
      </div>
    </header>
  );
}

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
    <header className="rounded-2xl border border-rose-100 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-rose-400/25 dark:bg-[#15141c]/88 dark:shadow-[0_16px_34px_rgba(0,0,0,0.45)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
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

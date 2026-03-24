"use client";

import { useTheme } from "next-themes";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "system";

  return (
    <div className="rounded-xl border border-rose-100/90 bg-white/80 p-1 dark:border-rose-400/25 dark:bg-[#16151c]/80">
      <div className="flex items-center gap-1">
        {OPTIONS.map((option) => {
          const isActive = activeTheme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                isActive
                  ? "border border-rose-200 bg-rose-100/90 text-slate-800 shadow-[0_5px_12px_rgba(190,24,93,0.10)] dark:border-rose-300/40 dark:bg-rose-500/20 dark:text-rose-100 dark:shadow-[0_6px_14px_rgba(244,63,94,0.28)]"
                  : "text-slate-500 hover:bg-rose-50/90 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-100"
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

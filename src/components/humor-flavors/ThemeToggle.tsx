"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-10 w-full" />;
  }

  const activeTheme = theme ?? "system";
  const activeIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex(({ value }) => value === activeTheme),
  );

  return (
    <div className="relative grid h-10 w-full grid-cols-3 rounded-xl border border-rose-200/80 bg-gradient-to-b from-rose-50/90 to-white/80 p-1 shadow-md shadow-rose-900/10 dark:border-rose-300/30 dark:from-[#241924] dark:to-[#17151f] dark:shadow-black/45">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-lg border border-rose-200/80 bg-white shadow-sm transition-transform duration-200 ease-out dark:border-rose-300/30 dark:bg-[#0f0f17] dark:shadow-black/50"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {THEME_OPTIONS.map(({ value, label }) => {
        const isActive = activeTheme === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            className={`relative z-10 rounded-lg px-2 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1 focus-visible:ring-offset-rose-50 dark:focus-visible:ring-rose-300/70 dark:focus-visible:ring-offset-[#17151f] ${
              isActive
                ? "text-slate-900 dark:text-rose-50"
                : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-rose-100"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

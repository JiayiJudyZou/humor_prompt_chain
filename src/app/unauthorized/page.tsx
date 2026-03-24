import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export default function UnauthorizedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,224,236,0.55),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(255,238,228,0.5),transparent_36%),linear-gradient(165deg,#fffaf7_0%,#fff4f7_48%,#fff2f6_100%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(244,63,94,0.22),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(236,72,153,0.2),transparent_36%),linear-gradient(165deg,#090a10_0%,#0f1018_52%,#14131c_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/35 to-transparent dark:from-rose-950/20" />

      <div className="relative w-full max-w-md rounded-3xl border border-rose-100/90 bg-white/90 p-8 shadow-[0_24px_64px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-rose-300/30 dark:bg-[#15141c]/92 dark:shadow-[0_24px_64px_rgba(0,0,0,0.55)] sm:p-9">
        <div className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 dark:border-rose-300/35 dark:bg-rose-500/15 dark:text-rose-200">
          Humor Prompt Chain
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          You are not superadmin, check your authorization then login again.
        </p>

        <div className="mt-7 grid gap-3">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-100 via-rose-50 to-orange-50 px-4 py-3 font-semibold text-slate-900 shadow-sm transition hover:from-rose-200 hover:to-orange-100 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:via-rose-400/18 dark:to-pink-500/14 dark:text-rose-100 dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
          >
            Back to Login
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-rose-50/80 dark:border-rose-300/30 dark:bg-[#0f0f17] dark:text-rose-100 dark:hover:bg-rose-500/15"
            >
              Sign out and try again
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

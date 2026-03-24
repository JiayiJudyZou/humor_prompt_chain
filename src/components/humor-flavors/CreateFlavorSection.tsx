'use client';

import { useState } from 'react';
import CreateFlavorForm from '@/components/humor-flavors/CreateFlavorForm';

export default function CreateFlavorSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <section>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center rounded-lg border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100 dark:border-rose-300/35 dark:bg-gradient-to-r dark:from-rose-500/25 dark:to-pink-500/14 dark:text-rose-100 dark:shadow-[0_8px_20px_rgba(244,63,94,0.24)] dark:hover:from-rose-500/35 dark:hover:to-pink-500/24"
          aria-expanded="false"
          aria-controls="create-flavor-panel"
        >
          Create Flavor
        </button>
      </section>
    );
  }

  return (
    <section id="create-flavor-panel" className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-300/30 dark:bg-[#11111a] dark:text-rose-100 dark:hover:border-rose-300/45 dark:hover:bg-rose-500/15"
      >
        Go Back
      </button>
      <CreateFlavorForm />
    </section>
  );
}

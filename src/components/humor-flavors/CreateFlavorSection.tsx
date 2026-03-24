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
          className="inline-flex items-center rounded-lg border border-rose-300 bg-gradient-to-r from-rose-100 to-amber-50 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-[0_8px_18px_rgba(190,24,93,0.10)] transition hover:from-rose-200 hover:to-amber-100"
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
        className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50"
      >
        Go Back
      </button>
      <CreateFlavorForm />
    </section>
  );
}

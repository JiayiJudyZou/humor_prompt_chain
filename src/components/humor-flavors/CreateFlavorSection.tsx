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
          className="admin-button-primary"
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
        className="admin-button-secondary"
      >
        Go Back
      </button>
      <CreateFlavorForm />
    </section>
  );
}

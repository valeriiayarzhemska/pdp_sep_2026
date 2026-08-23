'use client';

import { useState } from 'react';
import { Autocomplete } from '@/components/autocomplete';
import type { NavResult } from '@/lib/nav-mock-api';
import type { ProductResult } from '@/lib/product-mock-api';
import { categoryColor } from '@/lib/product-mock-api';
import type { TeamMember } from '@/lib/team-types';

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SelectedEcho({ label }: { label: string | null }) {
  if (!label) {
    return <p className="mt-2 text-xs text-neutral-500">Nothing selected yet.</p>;
  }

  return <p className="mt-2 text-xs text-neutral-400">Selected: {label}</p>;
}

export default function AutocompleteDemos() {
  const [navSelection, setNavSelection] = useState<string | null>(null);
  const [productSelection, setProductSelection] = useState<string | null>(null);
  const [userSelection, setUserSelection] = useState<string | null>(null);

  return (
    <div className="grid gap-8">
      <section>
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Header search — text-only results
        </p>
        <p className="mt-1.5 text-xs text-neutral-500">
          Try &quot;fac&quot;, pause, then quickly type &quot;ebook&quot; — the mock API deliberately answers
          shorter queries slower, so this reliably reproduces the out-of-order race the DFA describes.
        </p>
        <div className="mt-3">
          <Autocomplete<NavResult>
            ariaLabel="Search the app"
            placeholder="Search pages, e.g. facebook"
            fetcher={(query, signal) => fetchJson<NavResult[]>(`/api/autocomplete/nav?q=${encodeURIComponent(query)}`, signal)}
            getOptionId={(item) => item.id}
            getOptionLabel={(item) => item.label}
            onSelect={(item) => setNavSelection(`${item.label} (${item.path})`)}
            renderOption={(item, { highlighted }) => (
              <div className={`py-2 text-sm ${highlighted ? 'text-neutral-100' : 'text-neutral-300'}`}>
                <p>{item.label}</p>
                <p className="text-xs text-neutral-500">{item.path}</p>
              </div>
            )}
          />
        </div>
        <SelectedEcho label={navSelection} />
      </section>

      <section>
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Product search — image + subtitle, large result sets
        </p>
        <p className="mt-1.5 text-xs text-neutral-500">
          Try &quot;cat&quot; — it matches all 600 seeded products (every name is prefixed
          &quot;Catalog:&quot;), capped to the top 50 and rendered through a virtualizer either way.
        </p>
        <div className="mt-3">
          <Autocomplete<ProductResult>
            ariaLabel="Search products"
            placeholder="Search products, e.g. cat"
            fetcher={(query, signal) =>
              fetchJson<ProductResult[]>(`/api/autocomplete/products?q=${encodeURIComponent(query)}`, signal)
            }
            getOptionId={(item) => item.id}
            getOptionLabel={(item) => item.name}
            onSelect={(item) => setProductSelection(`${item.name} — $${item.price}`)}
            renderOption={(item, { highlighted }) => (
              <div className={`flex items-center gap-2.5 py-2 text-sm ${highlighted ? 'text-neutral-100' : 'text-neutral-300'}`}>
                <span
                  className="size-6 shrink-0 rounded"
                  style={{ background: categoryColor(item.category) }}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className="block text-xs text-neutral-500">
                    {item.category} · ${item.price}
                  </span>
                </span>
              </div>
            )}
          />
        </div>
        <SelectedEcho label={productSelection} />
      </section>

      <section>
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          User search — avatar + subtitle, reuses Task 5&apos;s data
        </p>
        <p className="mt-1.5 text-xs text-neutral-500">
          Backed by the same team-members mock API from the UI Component Libraries task — proving the
          component works against a completely unrelated backend without any changes to it.
        </p>
        <div className="mt-3">
          <Autocomplete<TeamMember>
            ariaLabel="Search team members"
            placeholder="Search people, e.g. a name"
            fetcher={(query, signal) =>
              fetchJson<TeamMember[]>(`/api/autocomplete/users?q=${encodeURIComponent(query)}`, signal)
            }
            getOptionId={(item) => item.id}
            getOptionLabel={(item) => item.name}
            onSelect={(item) => setUserSelection(`${item.name} — ${item.role}`)}
            renderOption={(item, { highlighted }) => (
              <div className={`flex items-center gap-2.5 py-2 text-sm ${highlighted ? 'text-neutral-100' : 'text-neutral-300'}`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-medium text-blue-300">
                  {initials(item.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {item.role} · {item.department}
                  </span>
                </span>
              </div>
            )}
          />
        </div>
        <SelectedEcho label={userSelection} />
      </section>
    </div>
  );
}

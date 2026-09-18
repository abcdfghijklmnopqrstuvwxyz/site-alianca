'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'vip', label: 'VIP' },
  { value: 'normal', label: 'Normais' },
];

export default function SearchFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const filter = searchParams.get('filter') ?? '';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => updateParam('filter', f.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              filter === f.value
                ? 'border-blood-bright bg-blood-bright/90 text-white shadow-glow'
                : 'border-blood-dark/50 text-bone-muted hover:border-blood-bright'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted/70" size={16} />
        <input
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('q', (e.target as HTMLInputElement).value);
          }}
          onBlur={(e) => updateParam('q', e.target.value)}
          placeholder="Procurar comunidade..."
          className="w-full rounded-full border border-blood-dark/50 bg-ash/80 py-2 pl-9 pr-3 text-sm text-bone outline-none transition focus:border-blood-bright"
        />
      </div>
    </div>
  );
}

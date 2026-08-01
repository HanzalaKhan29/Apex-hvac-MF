'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { INDEXABLE_ROUTES } from '@/lib/routes';

/**
 * A.17 section 4 — the /404 search.
 *
 * A CLIENT-SIDE FILTER OVER THE 23 INDEXABLE ROUTES. No search index, no
 * server route — "this is a route filter, not site search" (A.17). Building
 * real site search for a 23-page marketing site would be inventing scope the
 * blueprint does not specify.
 */
export default function RouteSearch() {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return INDEXABLE_ROUTES.filter(
      (route) =>
        route.label.toLowerCase().includes(q) || route.path.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="md:max-w-md">
      <label htmlFor="route-search" className="text-small font-semibold text-n-700">
        Search this site
      </label>
      <div className="relative mt-s1">
        <Search
          aria-hidden="true"
          strokeWidth={2}
          className="pointer-events-none absolute left-s3 top-1/2 size-5 -translate-y-1/2 text-n-400"
        />
        <input
          id="route-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="AC repair, Chandler, financing…"
          aria-describedby="route-search-status"
          className="min-h-12 w-full rounded-md border-[1.5px] border-n-400 bg-apex-paper py-[14px] pl-11 pr-s3 shadow-xs focus:border-apex-copper focus:bg-white"
        />
      </div>

      <p id="route-search-status" role="status" className="mt-s2 text-micro text-n-700">
        {query.trim()
          ? `${matches.length} page${matches.length === 1 ? '' : 's'} matched`
          : 'Start typing to filter every page on the site.'}
      </p>

      {matches.length > 0 ? (
        <ul className="mt-s2 flex list-none flex-col rounded-xl border border-n-200 bg-white shadow-sm">
          {matches.map((route) => (
            <li key={route.path} className="border-b border-n-200 last:border-b-0">
              <Link
                href={route.path}
                className="flex min-h-11 items-center justify-between gap-s3 px-s3 py-s2"
              >
                <span className="font-geist font-bold">{route.label}</span>
                <span className="text-micro text-n-700">{route.path}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

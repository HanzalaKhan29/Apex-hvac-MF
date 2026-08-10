'use client';

import dynamic from 'next/dynamic';

/**
 * Z.32 — `ssr: false` on next/dynamic is only legal inside a Client
 * Component (App Router rule); app/[locale]/layout.tsx is a Server
 * Component by design (no request state, fully static — see its own file
 * header), so the dynamic-with-ssr:false call has to live in this one-line
 * client wrapper instead of at the layout call site. Layout imports this
 * file directly, with no dynamic() of its own.
 */
export default dynamic(() => import('./EntranceMotion'), { ssr: false });

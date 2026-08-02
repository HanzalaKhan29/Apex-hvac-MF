'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * §6.2 / G.6 / I.9 — 3.3.7 Redundant Entry (Level A).
 *
 * "Name, phone and zip persist in sessionStorage and pre-populate any
 *  subsequent form in the same session. A visible 'Not you? Clear' control
 *  accompanies pre-populated fields. Never persist across sessions and never
 *  persist free-text message content."
 *
 * sessionStorage — not localStorage — is what makes "never across sessions"
 * true by construction rather than by discipline.
 *
 * Implemented with useSyncExternalStore rather than useEffect + setState.
 * sessionStorage IS an external store, which is exactly what that hook is for,
 * and it gets three things right that the effect version did not:
 *
 *   1. No cascading render. The effect version set state on mount, so every
 *      form rendered twice on load.
 *   2. Hydration-safe by contract. getServerSnapshot returns empty, so the
 *      server and the first client render agree, and React re-renders with the
 *      stored values without a mismatch warning.
 *   3. Both forms on a page stay in sync. Writing from the hero form now
 *      notifies the footer callback form, because they subscribe to the same
 *      store — previously each held its own snapshot taken at mount.
 */

const KEY = 'apex:lead-prefill';

export interface Prefill {
  name?: string;
  phone?: string;
  zip?: string;
  email?: string;
}

/* A minimal store around sessionStorage. The `storage` event only fires in
   OTHER tabs, so same-document writes are broadcast explicitly. */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot(): string {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    // Storage unavailable (private mode, blocked cookies) — start empty.
    return '';
  }
}

/** Server and first-paint snapshot: nothing is known yet. */
const getServerSnapshot = () => '';

const EMPTY: Prefill = {};

export function useSessionPrefill() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const prefill = useMemo<Prefill>(() => {
    if (!raw) return EMPTY;
    try {
      return JSON.parse(raw) as Prefill;
    } catch {
      return EMPTY;
    }
  }, [raw]);

  const remember = useCallback((values: Prefill) => {
    try {
      // Free-text message content is deliberately never included here.
      const next: Prefill = {
        name: values.name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        zip: values.zip?.trim() || undefined,
        email: values.email?.trim() || undefined,
      };
      sessionStorage.setItem(KEY, JSON.stringify(next));
      emit();
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY);
      emit();
    } catch {
      /* ignore */
    }
  }, []);

  const hasPrefill = Boolean(prefill.name || prefill.phone || prefill.zip);

  return { prefill, hasPrefill, remember, clear };
}

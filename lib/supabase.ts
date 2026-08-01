import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase admin client. ADDITION beyond the blueprint (Z.18) —
 * a persistent, queryable copy of every lead alongside G.3's Resend
 * transport, not a replacement for it.
 *
 * The `server-only` import makes it a build error to import this from a
 * Client Component, the same protection §9.3's Server Action boundary
 * already gives the Resend API key.
 *
 * Uses the SERVICE ROLE key, never the anon key: supabase/schema.sql enables
 * RLS with no policies, so only this key can read or write `leads`. It is
 * never exposed with a NEXT_PUBLIC_ prefix and is read once at module scope.
 *
 * Returns null when unconfigured rather than throwing, so a missing Supabase
 * project degrades to "no persistent copy" instead of breaking the lead
 * pipeline — the Resend email is still the thing that must never fail.
 */
function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const supabaseAdmin = createAdminClient();

export interface LeadRow {
  form_type: 'quote' | 'callback';
  form_location: string;
  name: string;
  phone: string;
  service?: string;
  zip?: string;
  out_of_area: boolean;
  best_time?: string;
  message?: string;
}

/**
 * Best-effort insert. Never throws — a Supabase outage must not touch the
 * G.3 pipeline, whose contract is "the Resend email is the thing that must
 * never fail." Logged, not surfaced, on failure.
 */
export async function recordLead(row: LeadRow): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin.from('leads').insert(row);
  if (error) {
    console.error('[supabase] failed to record lead (non-fatal):', error.message);
  }
}

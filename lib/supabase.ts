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
 * `createAdminClient()` still returns null when unconfigured, but as of Z.26
 * the CLIENT being unconfigured is no longer a silent no-op at the call site
 * in production — see `recordLead()` below. The database write is now the
 * step the pipeline requires; the emails are the ones allowed to fail.
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
  email?: string;
  service?: string;
  zip?: string;
  out_of_area: boolean;
  best_time?: string;
  message?: string;
}

/**
 * Z.26 — owner-specified pipeline order reverses G.3's original contract:
 * "agar email fail ho jaye to bhi lead database mein save honi chahiye. Aur
 * agar database save fail ho, to email bhi send na ho" — the database write
 * is now the step that must succeed; the emails are the best-effort ones.
 *
 * THROWS on failure (unlike the original best-effort version) so
 * submitLead() can gate the rest of the pipeline on it. In development with
 * no Supabase project configured, this still resolves (logs and returns) so
 * local form testing doesn't require a live project — mirrors how
 * sendToDispatch() already treats missing Resend config.
 */
export async function recordLead(row: LeadRow): Promise<void> {
  if (!supabaseAdmin) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase is not configured.');
    }
    console.info('[supabase] not configured; lead not persisted:', row);
    return;
  }

  const { error } = await supabaseAdmin.from('leads').insert(row);
  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

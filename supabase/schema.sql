-- Apex Comfort Systems — Supabase schema
--
-- ADDITION beyond Blueprint v1.1.1: G.3 specifies the transport as
-- Server Action -> transactional email (Resend) -> dispatch inbox, with no
-- database. This table is a PERSISTENT, QUERYABLE COPY of every submission
-- alongside that transport, not a replacement for it. If Supabase is
-- unreachable, the Resend email still sends and the lead is never dropped
-- (lib/actions/submit-lead.ts writes here best-effort, after the email).
--
-- Run this once in the Supabase SQL editor for a new project, or via the CLI:
--   supabase db push
--
-- Row Level Security is enabled with NO policies, which means: no anon-key
-- client can read, write, or even see that this table exists. Only the
-- service_role key (server-side only, never shipped to the browser) can
-- touch it. This is deliberate — leads carry name, phone and ZIP, and the
-- Server Action is the only thing that should ever write a row.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- G.0: which of the two forms this came from.
  form_type text not null check (form_type in ('quote', 'callback')),
  form_location text not null,

  -- G.1 fields. Nullable because the two forms don't share a field set —
  -- 'service' and 'zip' are quote-only, 'best_time' and 'message' are
  -- callback-only.
  name text not null,
  phone text not null,           -- E.164, matches lib/contact.ts's format
  service text,
  zip text,
  out_of_area boolean not null default false,  -- G.1: tagged, never blocked
  best_time text,
  message text,

  -- Dispatch workflow. Not written by the Server Action; a human (or the
  -- dispatch inbox integration) updates this after calling back.
  contacted_at timestamptz
);

comment on table public.leads is
  'Every quote/callback submission, mirrored alongside the Resend transport (G.3). Written best-effort by lib/actions/submit-lead.ts; never blocks the email send.';

alter table public.leads enable row level security;
-- No policies: only the service_role key can read or write. Intentional.

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_out_of_area_idx on public.leads (out_of_area) where out_of_area;

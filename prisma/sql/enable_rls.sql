-- =============================================================================
-- Enable Row Level Security on Prisma-managed tables
-- =============================================================================
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent: safe to re-run.
--
-- Why: Prisma connects to Postgres with its own credentials and bypasses RLS,
-- so all writes from our API routes work normally. But Supabase ALSO exposes
-- the same DB through a public REST API using the anon publishable key, which
-- ships in the browser bundle. Without RLS enabled, anyone could fetch every
-- row in `leads` from the client. Defense in depth: enable RLS with zero
-- policies for anon, so the REST API rejects any query.
-- =============================================================================

ALTER TABLE public.leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;

-- Drop any policy that might have been created accidentally from the dashboard.
-- We want ZERO policies for anon — meaning the REST API is fully blocked.
DROP POLICY IF EXISTS "leads_anon_select"          ON public.leads;
DROP POLICY IF EXISTS "leads_anon_insert"          ON public.leads;
DROP POLICY IF EXISTS "ab_assignments_anon_select" ON public.ab_assignments;
DROP POLICY IF EXISTS "ab_assignments_anon_insert" ON public.ab_assignments;

-- Sanity check — both rows should show rowsecurity = true
SELECT tablename, rowsecurity
FROM   pg_tables
WHERE  schemaname = 'public'
  AND  tablename IN ('leads', 'ab_assignments');

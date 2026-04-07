import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Two clients — different privileges, different use sites.
 *
 * - `supabaseBrowser`: anon key, safe to ship to the client. Read-only against
 *   tables protected by RLS. Use it from Client Components.
 * - `supabaseAdmin`: service role key, bypasses RLS. NEVER import this from a
 *   Client Component or it will leak the key to the bundle. Use it only from
 *   API routes / Server Actions / Server Components on the server.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseBrowser: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

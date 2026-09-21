import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase klijent za komponente na strani preglednika ("use client").
 * Koristi anonimni (public) ključ — sva stvarna zaštita podataka dolazi
 * od RLS politika definiranih u supabase/migrations, ne od ovog ključa.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

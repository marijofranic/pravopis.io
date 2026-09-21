import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Supabase klijent za poslužiteljske komponente, Server Actions i Route
 * Handlere. Čita/piše sesijske kolačiće preko Next.js `cookies()` API-ja
 * (Next 15: `cookies()` je asinkron, stoga je i ova funkcija asinkrona).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll je pozvan iz Server Componenta bez middleware osvježavanja
            // sesije — sigurno se zanemaruje ako middleware.ts obnavlja sesiju.
          }
        },
      },
    }
  );
}

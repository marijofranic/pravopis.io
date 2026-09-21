import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Osvježava Supabase sesiju na svakom zahtjevu (potrebno jer Server
 * Components ne mogu pisati kolačiće) i štiti /dokumenti i /d/* rute —
 * neprijavljen korisnik se preusmjerava na /prijava.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const zasticeno =
    request.nextUrl.pathname.startsWith("/dokumenti") ||
    request.nextUrl.pathname.startsWith("/d/");

  if (zasticeno && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dokumenti/:path*", "/d/:path*"],
};

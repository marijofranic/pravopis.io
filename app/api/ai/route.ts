import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Poslužiteljski proxy za AI funkcije (Preoblikuj, Ton, Jasnoća, Dijalekti —
 * F8-F11 specifikacije). Drži ANTHROPIC_API_KEY na poslužitelju i provjerava
 * da je pozivatelj prijavljen prije trošenja tokena.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ greska: "Niste prijavljeni." }, { status: 401 });
  }

  const { upit } = await request.json();
  if (!upit || typeof upit !== "string") {
    return NextResponse.json({ greska: "Nedostaje sadržaj upita." }, { status: 400 });
  }

  const apiKljuc = process.env.ANTHROPIC_API_KEY;
  if (!apiKljuc) {
    return NextResponse.json(
      { greska: "AI funkcije nisu konfigurirane na poslužitelju (nedostaje ANTHROPIC_API_KEY)." },
      { status: 500 }
    );
  }

  try {
    const odgovor = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKljuc,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: upit }],
      }),
    });

    const podaci = await odgovor.json();
    if (podaci.error) {
      return NextResponse.json({ greska: podaci.error.message ?? "Greška API-ja." }, { status: 502 });
    }

    const tekst = (podaci.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ tekst });
  } catch {
    return NextResponse.json(
      { greska: "Analizu trenutačno ne možemo dovršiti. Pokušajte ponovno." },
      { status: 502 }
    );
  }
}

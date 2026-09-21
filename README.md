# Pravopis.io

Hrvatski AI asistent za pisanje — Next.js 15 + Supabase + Claude API.
Ovo je prijelaz HTML/JS prototipa u strukturu spremnu za produkciju,
prema specifikaciji "Glagol" / Grammarly-style UX definiranoj ranije u
projektu.

## Struktura

```
src/
  app/
    page.tsx                 preusmjerava na /dokumenti ili /prijava
    prijava/page.tsx         prijava: magic link + Google OAuth
    auth/callback/route.ts   razmjena OAuth koda za sesiju
    auth/odjava/route.ts     odjava
    dokumenti/page.tsx       radna ploča "Moji dokumenti" (server)
    d/[id]/page.tsx          editor — dohvat dokumenta (server)
    api/ai/route.ts          proxy prema Anthropic API-ju (ključ na poslužitelju)
  components/
    DashboardKlijent.tsx     grid dokumenata, stvaranje/brisanje
    EditorKlijent.tsx        editor, ploča prijedloga, AI alati, ciljevi
    Toast.tsx                dijeljena toast komponenta s "Poništi"
  engine/
    pravila.ts               pravilni motor za hrvatski (bez ovisnosti)
  lib/
    supabase/client.ts       Supabase klijent za preglednik
    supabase/server.ts       Supabase klijent za Server Components/rute
    tipovi.ts                zajednički TypeScript tipovi
  middleware.ts              osvježava sesiju, štiti /dokumenti i /d/*
supabase/migrations/
  0001_pocetna_shema.sql     dokumenti, rječnik, zanemareno, telemetrija (RLS)
```

## Postavljanje

1. **Supabase projekt** — stvorite projekt na supabase.com, zatim primijenite
   migraciju:
   ```bash
   npx supabase db push --db-url "postgresql://..."
   # ili zalijepite sadržaj 0001_pocetna_shema.sql u SQL Editor na Supabase Dashboardu
   ```
   U **Authentication → Providers** uključite Email (magic link) i po želji Google.

2. **Varijable okoline** — kopirajte `.env.example` u `.env.local` i popunite:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ANTHROPIC_API_KEY=...
   ```

3. **Instalacija i pokretanje**:
   ```bash
   npm install
   npm run dev
   ```
   Aplikacija je na http://localhost:3000

## Napomene o arhitekturi

- **Pravilni motor** (`src/engine/pravila.ts`) je namjerno bez ovisnosti o
  Reactu ili Supabaseu — isti kod se može pozvati s klijenta (trenutna
  analiza dok korisnik tipka) i s poslužitelja (buduća autoritativna
  provjera prije izvoza/velikih dokumenata, F14 iz specifikacije).
- **RLS je uključen na svim tablicama** — svaki korisnik vidi i mijenja
  isključivo svoje retke. Ovo je preduvjet i za institucionalni plan.
- **ANTHROPIC_API_KEY nikad ne ide u klijent** — sve AI funkcije
  (Preoblikuj, Ton, Jasnoća, Dijalekti) prolaze kroz `/api/ai`.
- **Telemetrija prihvata/odbijanja** (`telemetrija_prijedloga`) tiho se
  bilježi pri svakom Prihvati/Odbaci — to je temelj budućeg vlastitog
  dijalektalnog modela (F11b iz specifikacije).

## Što nedostaje za pravu produkciju (sljedeći koraci)

- Morfološki rječnik (hunspell-hr ili ekvivalent) kao drugi sloj cjevovoda —
  trenutačno je aktivan samo pravilni sloj.
- Stripe naplata (Pro / jednokratna lektura / Ustanova, §6.5 specifikacije).
- Upload velikih dokumenata (.docx/.pdf) — F14.
- Testovi (Vitest/Playwright) i CI.

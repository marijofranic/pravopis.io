-- Pravopis.io — početna shema
-- Sve tablice imaju RLS uključen: korisnik smije čitati/pisati samo svoje
-- retke. Ovo je preduvjet i za pojedince i za institucionalni plan (§6.5
-- specifikacije) — čak i prije nego dodamo tablicu ustanova/timova.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- dokumenti
-- ---------------------------------------------------------------------
create table if not exists public.dokumenti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naslov text not null default 'Dokument bez naslova',
  sadrzaj text not null default '',
  cilj_publika text not null default 'Općenita',
  cilj_formalnost text not null default 'Neutralno',
  cilj_podrucje text not null default 'Poslovno',
  cilj_namjera text not null default 'Informirati',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dokumenti_user_id_idx on public.dokumenti (user_id, updated_at desc);

alter table public.dokumenti enable row level security;

create policy "Korisnik vidi svoje dokumente"
  on public.dokumenti for select
  using (auth.uid() = user_id);

create policy "Korisnik stvara svoje dokumente"
  on public.dokumenti for insert
  with check (auth.uid() = user_id);

create policy "Korisnik uređuje svoje dokumente"
  on public.dokumenti for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Korisnik briše svoje dokumente"
  on public.dokumenti for delete
  using (auth.uid() = user_id);

-- automatski updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists dokumenti_updated_at on public.dokumenti;
create trigger dokumenti_updated_at
  before update on public.dokumenti
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- osobni rječnik (F6 iz specifikacije)
-- ---------------------------------------------------------------------
create table if not exists public.rjecnik (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rijec text not null,
  created_at timestamptz not null default now(),
  unique (user_id, rijec)
);

alter table public.rjecnik enable row level security;

create policy "Korisnik upravlja svojim rječnikom"
  on public.rjecnik for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- zanemarene pogreške po dokumentu ("Zanemari u ovom dokumentu")
-- ---------------------------------------------------------------------
create table if not exists public.zanemareno (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dokument_id uuid not null references public.dokumenti(id) on delete cascade,
  kljuc text not null, -- "kategorija|riječ_malim_slovima"
  created_at timestamptz not null default now(),
  unique (dokument_id, kljuc)
);

alter table public.zanemareno enable row level security;

create policy "Korisnik upravlja zanemarenim stavkama svojih dokumenata"
  on public.zanemareno for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- telemetrija prihvata/odbijanja prijedloga (temelj budućeg vlastitog
-- modela — §8 specifikacije, "Ključne odluke")
-- ---------------------------------------------------------------------
create table if not exists public.telemetrija_prijedloga (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dokument_id uuid references public.dokumenti(id) on delete set null,
  kategorija text not null,
  pravilo text not null,
  original text not null,
  prijedlog text,
  odluka text not null check (odluka in ('prihvaceno', 'odbijeno')),
  created_at timestamptz not null default now()
);

alter table public.telemetrija_prijedloga enable row level security;

create policy "Korisnik piše svoju telemetriju"
  on public.telemetrija_prijedloga for insert
  with check (auth.uid() = user_id);

create policy "Korisnik vidi svoju telemetriju"
  on public.telemetrija_prijedloga for select
  using (auth.uid() = user_id);

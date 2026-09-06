# Pravopis.io — Produktna i dizajnerska specifikacija
**Verzija 1.1 · Lipanj 2026 · Radni dokument**

---

## 1. Vizija proizvoda

**Pravopis.io je hrvatski AI asistent za pisanje** — alat koji u stvarnom vremenu pomaže korisniku pisati točnije, jasnije, prirodnije i prikladnije kontekstu. Po dubini proizvoda usporediv je s Grammarlyjem, ali izgrađen na hrvatskoj jezičnoj normi, hrvatskim pravopisnim pravilima i kulturnoj specifičnosti hrvatskoga jezika — uključujući dijalekte i povijesne slojeve jezika kao jedinstvenu vrijednost koju nijedan globalni alat ne može ponuditi.

**Teza proizvoda:** *Pisanje na hrvatskom zaslužuje alat svjetske klase.* Hrvatski govornici danas pišu bez mreže — Word podcrtava nasumično, Grammarly hrvatski ne razumije, a ispravi.me staje na pravopisu. Pravopis.io pokriva cijeli raspon: od zareza do tona, od standarda do čakavskog.

**Pozicioniranje:** nije "spell checker", nego *partner u pisanju*. Korisnik ne dolazi ispraviti grešku — dolazi napisati bolji tekst.

### 1.1 Misija: nacionalna jezična infrastruktura

Dugoročni cilj nadilazi B2C proizvod: **Pravopis.io kao jezična infrastruktura Republike Hrvatske.** Integracija u akademske i znanstvene ustanove, školstvo i javnu upravu, gdje aplikacija postaje standardni alat za jezičnu kvalitetu službenih, znanstvenih i obrazovnih tekstova — čuvajući integritet hrvatskoga jezika i njegovih varijeteta kao kulturne baštine.

Tri stupa misije:
1. **Standard** — točan, normativno utemeljen hrvatski u javnoj i akademskoj komunikaciji.
2. **Baština** — dijalekti i povijesni slojevi jezika (čakavski, kajkavski, štokavski, starohrvatski) kao živi, digitalno dostupni oblici, ne muzejski eksponati.
3. **Suverenitet podataka** — hrvatski jezični korpus i model koji raste korištenjem ostaje u domaćem vlasništvu; preduvjet za povjerenje institucija (GDPR, NIS2, javna nabava).

Ova misija je ujedno i komercijalna strategija: institucionalni segment (B2G/B2B) ima najveći ugovorni potencijal i daje legitimitet B2C proizvodu. Veza s FER-om (prof. Bilas) je prvi korak — pilot na jednoj sastavnici Sveučilišta u Zagrebu kao referentni slučaj.

### 1.2 Ciljani segmenti

| Persona | Tko je | Što piše | Glavna bol |
|---|---|---|---|
| **Iva, novinarka** | 34, redakcija portala | Članci, naslovi, leadovi | Brzina + lektura pod deadlineom |
| **Marko, student** | 22, FER | Seminari, diplomski | Akademski registar, ije/je, zarezi |
| **Ana, office manager** | 41, srednje poduzeće | Mailovi, dopisi, ponude | Profesionalni ton, sigurnost u formalnoj komunikaciji |
| **Prof. Vukelić** | 58, lektorica | Recenzije, lektura | Volumen — treba alat koji predlaže, ona odlučuje |
| **Institucije** (B2B) | Fakulteti, mediji, državna uprava | Sve navedeno | Konzistentnost jezika na razini organizacije |

---

## 2. Ciljevi i ne-ciljevi

### Ciljevi (v1)
1. Korisnik dobiva prvi koristan prijedlog ispravka **unutar 60 sekundi** od registracije (aktivacija bez friction-a).
2. **≥ 85 % točnost** prijedloga pravopisnih ispravaka na evaluacijskom korpusu (ručno označen testni skup od min. 2.000 rečenica).
3. Stopa prihvaćanja prijedloga (accept rate) **≥ 55 %** — pokazatelj da prijedlozi imaju stvarnu vrijednost, ne šum.
4. Real-time osjećaj: vidljiva oznaka greške **< 1,5 s** nakon prestanka tipkanja.
5. Tjedna retencija (W1) **≥ 40 %** za korisnike koji su napisali ≥ 200 riječi prvog dana.

### Ne-ciljevi (v1)
- **Mobilna tipkovnica / mobilna aplikacija** — zaseban proizvod, prevelika investicija za v1. Web mora biti responzivan, ali editor je desktop-first.
- **Plagijarizam i AI-detekcija** — drugi problem, drugi proizvod. Ne razvodnjavati fokus.
- **Prijevod** — Pravopis.io poboljšava hrvatski tekst, ne prevodi. (Dijalektalna transformacija NIJE prijevod — to je transformacija unutar hrvatskog jezika i jest u opsegu.)
- **Kolaborativno uređivanje u stvarnom vremenu** (Google Docs-style multiplayer) — v2+, arhitekturu pripremiti, ali ne graditi.
- **Vlastiti LLM** — koristimo Claude API + vlastiti pravilni sloj; treniranje modela je faza koja dolazi tek s korpusom prihvaćenih/odbijenih ispravaka.

---

## 3. Identitet i design system: »Glagol«

Design system nosi ime **Glagol** — dvostruko značenje: glagol kao srce rečenice i glagoljica kao najstarije hrvatsko pismo. To nije dekoracija nego teza identiteta: **proizvod ukorijenjen u tisućljetnoj pisanoj tradiciji, izveden suvremenim alatima.**

### 3.1 Vizualni princip: »Papir i tinta«

Sučelje je metafora radnog stola lektora: topli papir, tamna tinta, a ispravci u **rubrici** — crvenoj boji kojom su srednjovjekovni pisari označavali inicijale i napomene u glagoljskim rukopisima. Time dobivamo crveni akcent koji je povijesno utemeljen i ni po čemu ne podsjeća na Grammarlyjevu zelenu.

**Pravilo restrikcije:** sučelje je gotovo monokromatsko. Boja postoji samo tamo gdje nosi značenje — kategorije ispravaka, primarne akcije, statusi. Sve ostalo je papir, tinta i sivi tonovi.

### 3.2 Boje (design tokeni)

```
Neutrali — »Papir i tinta«
--papir-0:    #FCFBF8   pozadina editora (topli bijeli, ne klinički)
--papir-50:   #F6F4EE   pozadina aplikacije, sidebar
--papir-100:  #ECE9E0   razdjelnici, hover
--tinta-300:  #9A958A   sekundarni tekst, placeholderi
--tinta-600:  #4D4A42   tekst sučelja
--tinta-900:  #1E1C18   tekst editora, naslovi (gotovo crna, topla)

Semantičke — kategorije ispravaka (svaka ima podcrtu + pozadinu)
--rubrika-600:  #C2362B   PRAVOPIS — crvena rubrika (greška, mora se ispraviti)
--rubrika-100:  #FBEAE8   pozadina označene riječi
--modra-600:    #2E5E8C   GRAMATIKA — tinta plava (struktura rečenice)
--modra-100:    #E8EFF6
--oker-600:     #B07D2B   STIL I JASNOĆA — oker (prijedlog, ne greška)
--oker-100:     #F8F0E0
--sljeza-600:   #7A4E8C   TON — sljeza/ljubičasta (registar i namjera)
--sljeza-100:   #F2EAF6

Status
--uspjeh-600:   #3D7A4E   potvrde, »tekst bez grešaka«
--uspjeh-100:   #E7F2EA
```

**Zašto ne zelena kao primarna:** zelena = Grammarly. Rubrika crvena + papir daje identitet koji se pamti i ima priču.

### 3.3 Tipografija

| Uloga | Font | Obrazloženje |
|---|---|---|
| **Editor (tekst korisnika)** | *Source Serif 4* (var.) | Serif optimiziran za dulje čitanje na ekranu; tekst korisnika je »rukopis«, zaslužuje knjišku tipografiju. Puna podrška za č ć đ š ž i dijakritike. |
| **Sučelje (UI)** | *Instrument Sans* (var.) | Suvremen, topao grotesk; jasno se razlikuje od sadržaja editora — korisnik nikad ne miješa »svoj tekst« i »tekst aplikacije«. |
| **Podaci i kod** | *Fragment Mono* | Brojači riječi, kratice, tehnički detalji. |
| **Display (marketing/onboarding naslovi)** | *Instrument Serif* | Karakteran serif za velike naslove; koristi se štedljivo. |

Tipografska skala (UI): 12 / 13 / 15 / 18 / 24 / 32 / 44 px. Editor: zadano 19 px / 1,65 line-height (podesivo).

### 3.4 Potpisni element (signature)

**»Inicijal«** — kada Pravopis.io analizira novi dokument, prvi vidljivi feedback je animirani inicijal prve riječi koji se na trenutak iscrta u stilu rubrike (potez tinte, 600 ms, poštuje `prefers-reduced-motion`). Suptilan, jedinstven, povezuje brand s funkcijom. Pojavljuje se samo pri prvom otvaranju dokumenta — nikad ne smeta pisanju.

### 3.5 Oblik i prostor

- Radijus: 6 px (kontrole), 10 px (kartice), 0 px (editor — papir nema zaobljene rubove).
- Sjene: jedna razina, vrlo blaga (`0 1px 3px rgba(30,28,24,.08)`); dubina se gradi pozadinama, ne sjenama.
- Grid: 8 px baza; sidebar 360 px; maksimalna širina retka u editoru 68 znakova (optimalna čitljivost).
- Ikone: linijske, 1,5 px stroke, vlastiti set za kategorije ispravaka (pero = pravopis, vitica = gramatika, lupa = jasnoća, kamerton = ton).

---

## 4. Informacijska arhitektura

```
Pravopis.io
├── Radna ploča (početni ekran)
│   ├── Novi dokument
│   ├── Nedavni dokumenti
│   └── Statistika pisanja (tjedni pregled)
├── Editor  ←  SRCE PROIZVODA
│   ├── Platno za pisanje (lijevo/centar)
│   ├── Ploča prijedloga (desni sidebar)
│   ├── Alatna traka dokumenta (gore)
│   └── Statusna traka (dolje)
├── Dijalekti i povijesni oblici  ← jedinstvena vrijednost
├── Osobni rječnik
├── Postavke
│   ├── Profil i pretplata
│   ├── Jezične postavke (norma, strogost, kategorije)
│   └── Izgled (tema, veličina teksta editora)
└── Pomoć i jezični savjeti (mini »jezični kutak«)
```

Navigacija: tanka lijeva traka s ikonama (64 px, proširiva), editor zauzima maksimum prostora. U editoru navigacija se može sažeti — pisanje je svetinja.

---

## 5. Editor — detaljna specifikacija

### 5.1 Anatomija ekrana

```
┌──────────────────────────────────────────────────────────────┐
│ ◧  Naslov dokumenta          Cilj teksta ▾   Ocjena 87  ⟳ ✓ │  ← alatna traka
├────┬─────────────────────────────────────────┬───────────────┤
│ N  │                                         │  PRIJEDLOZI   │
│ A  │   Platno za pisanje                     │  ┌──────────┐ │
│ V  │   (papir-0, Source Serif 4, 68 zn.)     │  │ kartica  │ │
│    │                                         │  │ ispravka │ │
│    │   Riječ s greškom ima podcrtu u boji    │  └──────────┘ │
│    │   kategorije; klik otvara karticu.      │  │ kartica  │ │
│    │                                         │  ⋮            │
├────┴─────────────────────────────────────────┴───────────────┤
│ 1.243 riječi · 6.810 znakova   ● 4 ▲ 2 ◆ 3   Sve spremljeno │  ← statusna traka
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Označavanje grešaka u tekstu

- **Podcrta** (2 px, valovita za pravopis, ravna za ostale kategorije) u boji kategorije. Pozadinski highlight (`-100` token) pojavljuje se tek na hover/fokus — tekst ostaje čitljiv.
- Klik ili `Tab`-fokus na označenu riječ → **inline kartica** (popover) uz riječ:

```
┌─────────────────────────────────────┐
│ ● PRAVOPIS                          │
│ neznam → ne znam                    │
│ Niječnica »ne« piše se odvojeno     │
│ od glagola.                         │
│ [ Prihvati ]   [ Zanemari ]  ⋯      │
└─────────────────────────────────────┘
```

- **Jedan klik = prihvat.** Tekst se zamjenjuje s mikro-animacijom (cross-fade 150 ms), kartica nestaje, fokus se vraća u tekst na isto mjesto.
- `⋯` izbornik: »Dodaj u osobni rječnik«, »Zanemari u ovom dokumentu«, »Prijavi pogrešan prijedlog«.
- Tipkovnica: `Ctrl/Cmd + .` skok na sljedeći prijedlog, `Enter` prihvat, `Esc` zatvori. Cijeli tok ispravljanja mora biti izvediv bez miša.

### 5.3 Ploča prijedloga (desni sidebar)

- **Zaglavlje:** Ocjena teksta (0–100) + sažetak: »4 pravopisne, 2 gramatičke, 3 stilska prijedloga«.
- **Filtar po kategorijama** (čipovi s točkicom u boji): Sve · Pravopis · Gramatika · Stil · Ton.
- **Kartice prijedloga**, sortirane po prioritetu (pravopis > gramatika > stil > ton), zatim po poziciji u tekstu. Svaka kartica: kategorija, izvorni → predloženi oblik, objašnjenje u jednoj rečenici, gumbi *Prihvati* / *Zanemari*.
- Klik na karticu → editor se pomakne i istakne odgovarajuće mjesto (scroll-sync u oba smjera).
- **Skupne akcije:** »Prihvati sve pravopisne ispravke« (samo za kategoriju pravopis — visoka pouzdanost; nikad »prihvati sve« preko svih kategorija).
- Sidebar se može sažeti (`Ctrl/Cmd + \`) → režim fokusa, ostaju samo podcrte.

### 5.4 Ocjena teksta i statistika

Statusna traka prikazuje: broj riječi, broj znakova, brojače po kategorijama (točkice u bojama kategorija + broj), status spremanja. Klik na ocjenu → panel s razradom: točnost, jasnoća, prikladnost tona cilju teksta, prosječna duljina rečenice, procjena čitljivosti (prilagođena hrvatskom — duljina riječi u slogovima, zavisne surečenice).

### 5.5 Cilj teksta (kontekst analize)

Padajući izbornik u alatnoj traci — korisnik postavlja namjenu, analiza se prilagođava:
**Opće pisanje · Poslovni e-mail · Akademski rad · Novinarski tekst · Objava za društvene mreže · Službeni dopis**
(Npr. »Vi« iz poštovanja velikim slovom provjerava se u dopisu, a ne forsira u objavi za mreže.)

---

## 6. Funkcionalni zahtjevi

### 6.1 P0 — bez ovoga proizvod ne postoji

| # | Zahtjev | Kriteriji prihvaćanja (sažeto) |
|---|---|---|
| F1 | Real-time provjera tijekom tipkanja | Debounce 800 ms nakon prestanka tipkanja; analiza po odlomku (ne cijeli dokument); oznake < 1,5 s; tipkanje NIKAD ne blokira (analiza u pozadini, optimistični UI). |
| F2 | Kategorije: pravopis, interpunkcija, velika/mala slova, česte pogreške (neznam, nebi, sumnjam→sumljam…), pobrkane riječi (jer/er, s/sa, gdje/kamo/kuda), razmaci i tipografija (dvostruki razmak, crtica/spojnica, navodnici »« vs ""), osnovna gramatika (sročnost, padeži uz prijedloge, glagolski oblici) | Svaka greška ima: kategoriju, objašnjenje (1–2 rečenice, hrvatski, bez žargona), ≥ 1 prijedlog. |
| F3 | Prihvat jednim klikom + poništavanje | `Ctrl/Cmd + Z` vraća i tekst i karticu prijedloga. |
| F4 | Dokument editor | Autosave (lokalno odmah, server ≤ 5 s); naslov; osnovno oblikovanje (podebljano, kurziv, naslovi H1–H3, liste); izvoz u .docx, .pdf, čisti tekst; uvoz .docx i lijepljenje iz Worda bez raspada formata. |
| F5 | Ploča prijedloga | Specifikacija §5.3. |
| F6 | Osobni rječnik | Dodavanje riječi (imena, brendovi, stručni termini); sinkronizacija po korisniku; uvoz/izvoz popisa. |
| F7 | Računi i pretplata | E-mail + Google prijava; besplatni sloj (pravopis/gramatika, 3 dokumenta) / Pro (sve funkcije). |

### 6.2 P0 — AI funkcije

| # | Funkcija | Specifikacija |
|---|---|---|
| F8 | **Preoblikuj** (Rewrite) | Selekcija rečenice/odlomka → akcija »Preoblikuj« (plutajuća mini-traka iznad selekcije). Vraća 2–3 varijante u sidebaru s oznakama (npr. »kraće«, »jasnije«, »formalnije«). Pregled razlika prije primjene. |
| F9 | **Ton** | Selekcija ili cijeli dokument → odabir tona: *formalno · profesionalno · prijateljski · akademski · sažeto · uvjerljivo*. Prikaz usporedbe staro/novo (diff s podcrtanim promjenama), primjena na klik. |
| F10 | **Jasnoća** | Pasivno: oker prijedlozi tijekom analize (preduge rečenice, nominalizacije, pleonazmi — »no međutim«, »čak štoviše«, »vremenski period«). Aktivno: »Pojednostavi« na selekciji. |

### 6.3 P1 — diferencijatori

| # | Funkcija | Specifikacija |
|---|---|---|
| F11 | **Dijalekti i povijesni oblici** | Transformacija bilo kojeg teksta u: **kajkavski/zagorski · čakavski · štokavski · splitski · zagrebački · starohrvatski** (glagoljaška tradicija 12.–16. st., kao povijesna tekstualna transformacija). Druga os: **refleksi jata** — ijekavica · ikavica · ekavica — kombinabilna s dijalektom gdje je jezično utemeljeno. Zaseban modul s vlastitim ekranom; jasna oznaka da je riječ o kreativnoj/kulturnoj transformaciji, ne o lekturi. Usporedni prikaz izvornik ↔ transformacija. |
| F11b | **Put do vlastitog dijalektalnog modela** | v1: Claude API s pažljivo izgrađenim few-shot korpusom po dijalektu (kurirani primjeri iz literature, dijalektološke građe i suradnje s katedrama za dijalektologiju). Paralelno: svaka transformacija + korisnička ocjena (»zvuči autentično / ne zvuči«) gradi paralelni korpus standard↔dijalekt. v2: fine-tuning otvorenog modela na tom korpusu → vlastiti model, neovisnost o trećim stranama, znanstvena vrijednost (objavljiv korpus = akademski partneri dobivaju razlog za suradnju). Ovo je istovremeno proizvod, istraživački projekt i jezgra misije očuvanja autentičnosti. |
| F11c | **AI pomoćnik za pisanje** | Generativna pomoć po uzoru na Grammarlyjev AI sloj, na hrvatskom: »Nastavi pisati«, »Sažmi«, »Proširi«, »Napiši prvi nacrt iz natuknica«, »Odgovori na ovaj e-mail«. Poziva se iz plutajuće trake na selekciji ili `/` naredbom u praznom retku. Sve generirano označeno je kao prijedlog (umetanje tek na potvrdu) — korisnik uvijek ostaje autor. Pro funkcija. |
| F12 | Jezični savjeti (»Jezični kutak«) | Uz svako objašnjenje link »Saznaj više« → kratki članak o pravilu. Gradi povjerenje i SEO. |
| F13 | Statistika pisanja | Tjedni pregled: napisane riječi, najčešće greške, napredak (greške/1000 riječi kroz vrijeme). |
| F14 | **Provjera velikih dokumenata (upload)** | Učitavanje cijelih radova (.docx, .pdf do 300 str.): diplomski, doktorati, znanstveni članci, pravilnici, natječajna dokumentacija. Asinkrona obrada s e-mail obavijesti; rezultat = interaktivni izvještaj (sve greške po kategorijama i stranicama) + izvoz lektoriranog .docx s vidljivim izmjenama (track changes). Ključna monetizacijska poluga — naplata po dokumentu ili u sklopu Pro/institucionalnog plana. |

### 6.4 P2 — ekosustav (arhitekturu pripremiti, ne graditi u v1)

- **Chrome ekstenzija** (provjera u Gmailu, društvenim mrežama, CMS-ovima) — najvažniji kanal rasta, fast-follow nakon v1.
- **macOS agent u traci izbornika** i **CLI alat** za programere i redakcije.
- **API za institucije** (fakulteti, mediji, uprava) — B2B/B2G sloj; veza s FER inicijativom.
- Timski prostori i dijeljeni rječnici organizacije.
- **Školski način rada** — pojednostavljeno sučelje za učenike, izvještaj o napretku za nastavnike, bez AI generiranja (samo provjera i objašnjenja) — preduvjet za ulazak u školstvo.

---

## 6.5 Monetizacija

| Plan | Tko | Sadržaj | Cijena (hipoteza za test) |
|---|---|---|---|
| **Besplatno** | Svi | Pravopis + gramatika, 3 dokumenta, do 10.000 riječi/dok. | 0 € — motor rasta i povjerenja |
| **Pro** | Pojedinci (studenti, novinari, profesionalci) | Sve kategorije, Preoblikuj/Ton/Jasnoća, AI pomoćnik, dijalekti, 5 velikih dokumenata mjesečno | ~9 €/mj (studentski popust 50 %) |
| **Lektura dokumenta** (jednokratno) | Povremeni korisnici | Upload jednog velikog dokumenta s punim izvještajem, bez pretplate | ~7–15 € po dokumentu, ovisno o opsegu — najniži prag ulaska u plaćanje |
| **Ustanova** | Fakulteti, škole, mediji, javna uprava | Neograničeni korisnici domene (@fer.hr…), dijeljeni rječnik i stilski vodič ustanove, administracija, API, ugovorna obrada podataka (DPA), podaci u EU | Godišnji ugovor po veličini ustanove |

**Logika lijevka:** besplatni plan gradi naviku → veliki dokument (diplomski u svibnju, izvještaj u prosincu) je prirodni trenutak prve naplate → ustanova kupuje ono što njezini ljudi već koriste. Institucionalni plan je dugoročno najveći prihod i najjača obrana od konkurencije.

---

## 7. UX tekstovi (svi na hrvatskom — referentni primjeri)

**Načela glasa:** jasan, smiren, stručan bez pokroviteljstva. Aplikacija nikad ne kori korisnika (»Pogriješili ste«), nego objašnjava pravilo. Aktivni glagoli, rečenični stil pisanja velikih slova (sentence case), bez uskličnika osim u uspjehu. Akcija zadržava isto ime kroz cijeli tok: gumb »Prihvati« → potvrda »Prihvaćeno«.

### 7.1 Onboarding (3 ekrana, preskočivo)

1. **»Pišite. Mi pazimo na ostalo.«** — Pravopis.io provjerava pravopis, gramatiku i stil dok tipkate — na hrvatskom, po hrvatskim pravilima. → `Započni`
2. **»Svaki ispravak ima objašnjenje.«** — Ne ispravljamo naslijepo. Uz svaki prijedlog stoji pravilo, da svaki tekst bude i mala lekcija. → `Dalje`
3. **»Vaš tekst, vaš ton.«** — Odaberite cilj teksta — poslovni e-mail, seminar ili objava — i prijedlozi se prilagođavaju. → `Otvori prvi dokument`

Prvi dokument je interaktivni vodič: pripremljen tekst s 5 tipičnih grešaka koje korisnik ispravlja sam (aktivacija kroz djelovanje, ne kroz čitanje).

### 7.2 Prazna stanja

- **Radna ploča bez dokumenata:** »Ovdje će živjeti vaši tekstovi. Stvorite prvi dokument ili zalijepite tekst koji želite provjeriti.« → `+ Novi dokument`
- **Sidebar bez prijedloga (tekst čist):** ikona pera + »Sve je na mjestu. Nismo pronašli nijednu pogrešku — nastavite pisati.«
- **Sidebar dok analiza traje:** »Čitamo vaš tekst…« (skeleton kartice, bez spinnera preko editora).
- **Osobni rječnik prazan:** »Riječi koje dodate ovdje više nećemo označavati — imena, nazivi, stručni izrazi.«

### 7.3 Poruke o greškama (sustavne)

- Mreža: »Nema veze s poslužiteljem. Vaš tekst je sigurno spremljen na uređaju — nastavite pisati, prijedlozi stižu čim se veza vrati.«
- Analiza nije uspjela: »Analizu trenutačno ne možemo dovršiti. Pokušajte ponovno.« → `Pokušaj ponovno`
- Predug dokument (free): »Besplatni plan provjerava do 10.000 riječi po dokumentu. Za dulje tekstove prijeđite na Pro.« → `Pogledaj Pro`
- Uvoz datoteke: »Ovu datoteku ne možemo otvoriti. Podržani su formati .docx, .txt i .md.«

### 7.4 Uspjeh i potvrde

- Prihvat ispravka: tiha potvrda (kartica nestaje + brojač se smanji) — bez toasta; toast samo za skupne akcije: »Prihvaćeno 7 ispravaka.« → `Poništi`
- Dokument bez grešaka nakon ispravljanja: »Tekst je spreman! Ocjena 100 — bez ijedne pogreške.«
- Spremanje: statusna traka »Sve spremljeno« / »Spremanje…« (nikad modalno).

### 7.5 Mikrotekstovi (uzorci)

| Element | Tekst |
|---|---|
| Placeholder editora | »Počnite pisati ili zalijepite tekst…« |
| Tooltip ocjene | »Ocjena teksta: točnost, jasnoća i prikladnost tona« |
| Tooltip ikone pravopisa | »Pravopisne pogreške — preporučujemo ispravak« |
| Tooltip ikone stila | »Stilski prijedlozi — vi odlučujete« |
| Gumb tona | »Prilagodi ton« |
| Potvrda zanemarivanja | »U redu, ovo više nećemo predlagati u ovom dokumentu.« |

---

## 8. Tehnička arhitektura (sažetak za v1)

```
┌─ Klijent ──────────────────────────────────────────────┐
│ Next.js 15 (App Router) + TypeScript + Tailwind        │
│ Editor: TipTap (ProseMirror) + vlastiti »mark« sloj    │
│ za podcrte/kategorije; dekoracije ne mijenjaju sadržaj │
└──────────────┬─────────────────────────────────────────┘
               │ HTTPS / SSE za streaming prijedloga
┌──────────────▼─────────────────────────────────────────┐
│ API sloj (Next.js route handlers / Edge)               │
│ ── Cjevovod analize (hibrid, po odlomku): ──           │
│ 1. PRAVILA (lokalno, <50 ms): regex + rječnik čestih   │
│    grešaka, tipografija, razmaci → trenutne oznake     │
│ 2. MORFOLOŠKI SLOJ: hrvatski rječnik s flektivnim      │
│    oblicima (hunspell-hr kao baza + vlastita           │
│    proširenja); opcionalno ispravi.me kao sekundarna   │
│    provjera                                            │
│ 3. LLM SLOJ (Claude API): gramatika u kontekstu,       │
│    jasnoća, ton, preoblikovanje, dijalekti —           │
│    strukturirani JSON izlaz {span, kategorija,         │
│    prijedlog, objašnjenje}                             │
└──────────────┬─────────────────────────────────────────┘
┌──────────────▼─────────────────────────────────────────┐
│ Supabase: Auth · Postgres (dokumenti, rječnici,        │
│ telemetrija prihvata/odbijanja — temelj budućeg        │
│ vlastitog modela) · Realtime (sync) · RLS obavezan     │
│ Hosting: Vercel/Netlify · Stripe za naplatu            │
└────────────────────────────────────────────────────────┘
```

**Ključne odluke:**
- **Hibridni cjevovod** drži troškove i latenciju pod kontrolom: pravila hvataju 60–70 % grešaka besplatno i trenutno; LLM se zove po odlomku, s keširanjem nepromijenjenih odlomaka (hash odlomka → rezultat).
- **Privatnost kao značajka:** tekst se ne koristi za treniranje trećih strana; jasno komunicirati (GDPR, bitno za institucije i FER pitch).
- Telemetrija prihvaćeno/odbijeno po pravilu = evaluacijski korpus i konkurentska prednost koja raste s korištenjem.

---

## 9. Metrike uspjeha

| Metrika | Cilj (90 dana od lansiranja) |
|---|---|
| Aktivacija (≥ 1 prihvaćen ispravak u 1. sesiji) | ≥ 60 % registriranih |
| Accept rate prijedloga | ≥ 55 % (po kategoriji: pravopis ≥ 75 %, stil ≥ 35 %) |
| W1 retencija aktiviranih | ≥ 40 % |
| Lažno pozitivni (prijavljeni pogrešni prijedlozi) | < 3 % prikazanih |
| Konverzija free → Pro | ≥ 4 % nakon 30 dana korištenja |
| NPS | ≥ 45 |

---

## 10. Faze isporuke

- **Faza 1 (MVP, 8–10 tj.):** editor + cjevovod pravila i morfologije + ploča prijedloga + računi + osobni rječnik. *Bez LLM funkcija* — temelj mora biti brz i točan.
- **Faza 2 (+4–6 tj.):** Claude sloj — gramatika u kontekstu, Preoblikuj, Ton, Jasnoća, ocjena teksta, ciljevi teksta.
- **Faza 3 (+4 tj.):** Dijalekti i starohrvatski (few-shot pristup) + prikupljanje paralelnog korpusa, jezični kutak, statistika pisanja, Pro naplata + jednokratna lektura velikog dokumenta (F14).
- **Faza 4:** AI pomoćnik (F11c) · Chrome ekstenzija → macOS agent → CLI · institucionalni plan i FER pilot · školski način rada.
- **Faza 5 (istraživačka, paralelno):** fine-tuning vlastitog dijalektalnog modela na prikupljenom korpusu, u suradnji s akademskim partnerima.

---

## 11. Otvorena pitanja

1. **(Jezik/sadržaj)** Koja pravopisna norma kao zadana — Institut za hrvatski jezik (Hrvatski pravopis, IHJJ) — i nudimo li Matičin kao opciju u postavkama strogosti? *Blokira F2.*
2. **(Pravno)** Licenciranje rječničke građe (hunspell-hr je LGPL — provjeriti kompatibilnost s komercijalnim modelom). *Blokira Fazu 1.*
3. **(Dizajn)** Tamna tema u v1 ili fast-follow? (Prijedlog: fast-follow; »papir« identitet prvo mora sjesti.)
4. **(Produkt)** Granica besplatnog plana — broj dokumenata vs. broj riječi mjesečno? Testirati.
5. **(Tehnika)** Streaming prijedloga po odlomku preko SSE vs. batch po dokumentu — prototipirati latenciju s Claude API-jem na hrvatskim tekstovima od 2–3 k riječi.
6. **(Akademski)** Tko je partner za dijalektološku evaluaciju (autentičnost transformacija)? Kandidati: Odsjek za kroatistiku FFZG, Institut za hrvatski jezik, Zavod za lingvistiku. *Blokira ozbiljnost F11 prema institucijama.*
7. **(B2G)** Put nabave za javne ustanove — direktna pogodba ispod praga, okvirni sporazum ili CARNET/SRCE kao kanal za školstvo? Pravno-komercijalno istražiti prije FER pitcha.
8. **(Podaci)** Smije li se korisnički tekst iz institucionalnih računa uopće koristiti za korpus (čak i anonimiziran)? Prijedlog: opt-in po ustanovi, zadano isključeno — povjerenje ispred podataka.

---

*Dokument pripremio: Claude · Za: Marijo · Sljedeći korak: wireframe editora visoke vjernosti ili interaktivni HTML prototip ploče prijedloga.*

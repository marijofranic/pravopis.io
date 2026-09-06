# Jezični Most — modul integracije za imigrante
**Nadogradnja na Pravopis.io · v0.1 · realističan opseg po fazama**

---

## 0. Iskrena procjena prije bilo čega drugog

Sedam sustava koje si opisao dijele se u dvije vrste po tome što im treba da postoje:

**A — gradivo odmah, unutar postojeće arhitekture** (Next.js + Supabase + Claude API iz specifikacije Pravopis.io):
1. Materinji jezik kao filter/kontekst (postavka korisnika)
2. Komparativna gramatika uz Claude API (objašnjenje greške kroz prizmu materinjeg jezika)
3. Institucionalni paketi vokabulara (strukturirani sadržaj + provjera pravopisa nad njim)
4. Osnova zajednice (pitanja/odgovori vezani uz jezik — tekstualno, moderirano)

**B — zahtijeva ono što nijedan prototip ne može lažirati**:
5. **Analiza izgovora/naglaska** — treba pravi model za prepoznavanje govora s fonetskom analizom (Web Audio API sam po sebi ne "čuje" č/ć/š/ž greške; to bi zahtijevalo trenirani ASR model ili API poput Azure Pronunciation Assessment). Mogu izgraditi *snimi-i-usporedi* mehaniku, ali "analiza akcenta" bez pravog modela bila bi glumljena funkcionalnost — to neću raditi.
6. **Zajednica na razini "vidi što su drugi iz tvoje zemlje pitali"** — treba moderaciju, moguće zlouporabe, GDPR na osjetljivim podacima (zemlja podrijetla + status boravka je osjetljiva kombinacija). Gradivo je, ali kao pravi proizvod s pravilima, ne kao demo.
7. **Institucionalna certifikacija ("B1 razina")** — pravno vrijedi samo ako stoji iza nje priznato tijelo (HR ZA ZAPOŠLJAVANJE, sveučilište, CIEP). Aplikacija može *pripremiti* korisnika i simulirati test, ali ne može sama izdavati priznatu diplomu.

Dolje je spec za A (već u prototipu) i skica za B (sljedeće faze, s onim što bi svaka stvarno zahtijevala).

---

## 1. Materinji jezik kao most — mehanika

Pri onboardingu, korisnik bira materinji jezik (bangla, ukrajinski, srpski, engleski, arapski, vijetnamski + dugi rep od ~40 jezika — prototip ih nudi 20). Ovo nije prijevod — to je **kontekst koji se šalje uz svaki AI poziv** tako da Claude zna kroz koju jezičnu prizmu objašnjavati.

Praktično, to znači jedan dodatni parametar (`materinji_jezik`) koji putuje kroz cijeli sustav:
- Ulazi u `ciljevi` objekt korisnika (uz publiku/formalnost/područje/namjeru koje već imamo)
- Sprema se u Supabase profil (`profili.materinji_jezik`)
- Ubacuje se u svaki Claude prompt kao instrukcija: *"objasni ovo hrvatskom govorniku čiji je materinji jezik X; gdje je relevantno, usporedi strukturu"*

## 2. AI komparativna gramatika — implementirano u prototipu

Kad pravilni motor (`computeIssues`) uhvati grešku, korisnik na popoveru klikne **"objasni na mom jeziku"**. To šalje Claude poziv koji uspoređuje gramatičku strukturu materinjeg jezika i hrvatskog, imenuje konkretnu razliku (rod, padež, red riječi, član, glagolski vid) i ostaje na max 3 rečenice, jednostavnim jezikom.

Primjer za bangla govornika i grešku roda: *"bangla nema gramatički rod pa se pridjevi ne mijenjaju uz imenicu — u hrvatskom pridjev mora 'slagati' rod s imenicom: student je muškog roda pa je 'stari student', a studentica je ženskog pa 'stara studentica'."*

## 3. Institucionalni paketi vokabulara — demo u prototipu

Prototip sadrži demo paket **Administracija** s pet pojmova (prijava boravišta, OIB, boravišna dozvola, HZZO, bruto/neto plaća). Svaki ima kuriranu hrvatsku definiciju (statičnu, ne AI-generiranu) i gumb "objasni na [jezik]" koji na zahtjev generira objašnjenje kroz materinji jezik korisnika.

Puna verzija bi imala četiri paketa prema statusu boravka:

| Paket | Sadržaj |
|---|---|
| Radni imigrant | ugovor o radu, plaća/bruto-neto, sindikat, HZZO |
| Student | upis, ECTS, stipendija, studentski dom |
| Obiteljsko spajanje | MUP obrasci, dokazi prihoda, boravišna dozvola |
| Azil/izbjeglica | zahtjev za azil, socijalna skrb, integracijski program |

**Izvor istine:** ovi paketi MORAJU biti kurirani sadržaj (u suradnji s NGO-ima koji rade s imigrantima — npr. Centar za mirovne studije, Are You Syrious), ne slobodna AI generacija — administrativna netočnost ovdje ima stvarne posljedice za ljude. AI smije generirati samo objašnjenje/usporedbu na zahtjev, nikad sam pojam i njegovo pravno značenje.

## 4. Što je u prototipu, a što nije

**Ugrađeno i radi** (testirano, nula grešaka u konzoli):
- Korak u onboardingu: odabir materinjeg jezika (20 jezika, proširivo)
- Gumb "objasni na mom jeziku" na svakoj gramatičkoj/pravopisnoj grešci
- Demo paket vokabulara "Jezični most — administracija" u AI panelu

**Namjerno izostavljeno** (jer bi bilo glumljeno): audio snimanje/analiza izgovora, zajednica, certifikacija.

---

## 5. Faze B — što bi svaka stvarno trebala

**Govor i slušanje (faza 2):** integracija s pravim ASR servisom (npr. Azure Speech Pronunciation Assessment ili sličan API) koji vraća fonemsku ocjenu izgovora po glasu (č/ć, š/ž razlike). Web Audio API/Tone.js ostaju za snimanje i reprodukciju zvuka u pregledniku — analizu radi vanjski servis, ne sam preglednik.

**Zajednica (faza 3):** tekstualni Q&A vezan uz jezik (ne uz status boravka — to razdvojiti iz privatnosnih razloga), s moderacijom, bez javnog prikaza zemlje podrijetla korisnika osim ako sam to eksplicitno ne odabere.

**Institucionalna certifikacija (faza 4):** partnerstvo s priznatim tijelom; aplikacija priprema za test, certifikat izdaje partner, ne aplikacija sama.

---

*Prototip s ugrađenim koracima 1-4: `pravopis-io-prototip.html`*

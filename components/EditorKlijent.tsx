"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { computeIssues, ocjenaOd, KATEGORIJE, type Issue, type Kategorija } from "@/engine/pravila";
import { CILJ_OPCIJE } from "@/lib/tipovi";
import type { Dokument } from "@/lib/tipovi";
import Toast, { useToast } from "@/components/Toast";

/* ---------------------------------------------------------------------
 * Pomoćne funkcije za rad s contenteditable poljem — tekst, pozicija
 * pokazivača (caret) i ponovno iscrtavanje oznaka. Izravna DOM
 * manipulacija je namjerna: React state za sadržaj editora bi se sudarao
 * s contenteditable-om pri svakom re-renderu.
 * ------------------------------------------------------------------- */
function getText(el: HTMLElement): string {
  let s = "";
  (function w(n: Node) {
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) s += (c as Text).data;
      else if (c.nodeName === "BR") s += "\n";
      else {
        if (/^(DIV|P)$/.test(c.nodeName) && s && !s.endsWith("\n")) s += "\n";
        w(c);
      }
    });
  })(el);
  return s;
}

function offsetOf(el: HTMLElement, node: Node, off: number): number | null {
  let acc = 0;
  let done = false;
  (function w(n: Node) {
    if (done) return;
    if (n === node && n.nodeType === 3) {
      acc += off;
      done = true;
      return;
    }
    if (n.nodeType === 3) {
      acc += (n as Text).data.length;
      return;
    }
    if (n === node) {
      let k = 0;
      for (const c of Array.from(n.childNodes)) {
        if (k >= off) break;
        w(c);
        k++;
      }
      done = true;
      return;
    }
    if (n.nodeName === "BR") {
      acc += 1;
      return;
    }
    for (const c of Array.from(n.childNodes)) {
      w(c);
      if (done) return;
    }
  })(el);
  return done ? acc : null;
}

function caretOffset(ed: HTMLElement): number | null {
  const s = window.getSelection();
  if (!s || !s.rangeCount) return null;
  const r = s.getRangeAt(0);
  if (!ed.contains(r.startContainer)) return null;
  return offsetOf(ed, r.startContainer, r.startOffset);
}

function setCaret(ed: HTMLElement, off: number) {
  const r = document.createRange();
  let acc = 0;
  let done = false;
  (function w(n: Node) {
    if (done) return;
    if (n.nodeType === 3) {
      const len = (n as Text).data.length;
      if (acc + len >= off) {
        r.setStart(n, off - acc);
        done = true;
      } else acc += len;
      return;
    }
    if (n.nodeName === "BR") {
      acc += 1;
      if (acc >= off) {
        r.setStartAfter(n);
        done = true;
      }
      return;
    }
    for (const c of Array.from(n.childNodes)) {
      w(c);
      if (done) return;
    }
  })(ed);
  if (!done) {
    r.selectNodeContents(ed);
    r.collapse(false);
  }
  r.collapse(true);
  const s = window.getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nl = (t: string) => t.replace(/\n/g, "<br>");
const skrati = (t: string, n = 24) => (t.length > n ? t.slice(0, n - 1) + "…" : t);

function renderEditorHTML(text: string, issues: Issue[]): string {
  let html = "";
  let poz = 0;
  for (const i of issues) {
    html += nl(esc(text.slice(poz, i.start)));
    html += `<mark class="${i.kat}" data-id="${i.id}">${nl(esc(text.slice(i.start, i.end)))}</mark>`;
    poz = i.end;
  }
  html += nl(esc(text.slice(poz)));
  return html;
}

interface Selekcija {
  s: number;
  e: number;
}

const TONOVI = ["formalno", "profesionalno", "prijateljski", "akademski", "sažeto", "uvjerljivo"];
const DIJALEKTI = [
  { v: "kajkavski (zagorski)", l: "kajkavski / zagorski" },
  { v: "čakavski", l: "čakavski" },
  { v: "štokavski (ikavica)", l: "štokavski (ikavica)" },
  { v: "splitski govor", l: "splitski" },
  { v: "zagrebački govor", l: "zagrebački" },
  { v: "starohrvatski (glagoljaška tradicija 12.–16. st.)", l: "starohrvatski (12.–16. st.)" },
];

export default function EditorKlijent({
  pocetniDokument,
  pocetniRjecnik,
  pocetnoZanemareno,
}: {
  pocetniDokument: Dokument;
  pocetniRjecnik: string[];
  pocetnoZanemareno: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { poruka, prikazi, sakrij } = useToast();

  const edRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const [naslov, setNaslov] = useState(pocetniDokument.naslov);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [aktivanFiltar, setAktivanFiltar] = useState<"sve" | Kategorija>("sve");
  const [otvorenaKartica, setOtvorenaKartica] = useState<number | null>(null);
  const [ocjena, setOcjena] = useState<number | null>(null);
  const [brojRijeci, setBrojRijeci] = useState(0);
  const [spremljeno, setSpremljeno] = useState(true);
  const [panelOtvoren, setPanelOtvoren] = useState(false);
  const [aiOtvoren, setAiOtvoren] = useState(false);
  const [ciljeviOtvoreni, setCiljeviOtvoreni] = useState(false);
  const [popoverIssue, setPopoverIssue] = useState<Issue | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const [ciljevi, setCiljevi] = useState({
    publika: pocetniDokument.cilj_publika,
    formalnost: pocetniDokument.cilj_formalnost,
    podrucje: pocetniDokument.cilj_podrucje,
    namjera: pocetniDokument.cilj_namjera,
  });

  const [rezPreoblikuj, setRezPreoblikuj] = useState<React.ReactNode>(null);
  const [rezTon, setRezTon] = useState<React.ReactNode>(null);
  const [rezJasnoca, setRezJasnoca] = useState<React.ReactNode>(null);
  const [rezDijalekt, setRezDijalekt] = useState<React.ReactNode>(null);
  const [dijalektOdabran, setDijalektOdabran] = useState(DIJALEKTI[0].v);

  const ignoriranoRef = useRef<Set<string>>(new Set(pocetnoZanemareno));
  const rjecnikRef = useRef<Set<string>>(new Set(pocetniRjecnik));
  const lastSelRef = useRef<Selekcija | null>(null);
  const fokIdxRef = useRef(-1);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spremiDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const issuesRef = useRef<Issue[]>([]);

  /* ---------------- analiza ---------------- */
  const analiziraj = useCallback((zadrziCaret = true) => {
    const ed = edRef.current;
    if (!ed) return;
    const text = getText(ed);
    const novi = computeIssues(text, { ignorirano: ignoriranoRef.current, rjecnik: rjecnikRef.current });
    issuesRef.current = novi;
    const off = zadrziCaret ? caretOffset(ed) : null;
    ed.innerHTML = renderEditorHTML(text, novi);
    if (off != null) setCaret(ed, off);
    setIssues(novi);
    const rijeci = text.trim() ? text.trim().split(/\s+/).length : 0;
    setBrojRijeci(rijeci);
    setOcjena(rijeci ? ocjenaOd(novi) : null);
  }, []);

  const primijeniTekst = useCallback((noviTekst: string, caret?: number) => {
    const ed = edRef.current;
    if (!ed) return;
    const novi = computeIssues(noviTekst, { ignorirano: ignoriranoRef.current, rjecnik: rjecnikRef.current });
    issuesRef.current = novi;
    ed.innerHTML = renderEditorHTML(noviTekst, novi);
    if (caret != null) {
      ed.focus();
      setCaret(ed, caret);
    }
    setIssues(novi);
    setOtvorenaKartica(null);
    const rijeci = noviTekst.trim() ? noviTekst.trim().split(/\s+/).length : 0;
    setBrojRijeci(rijeci);
    setOcjena(rijeci ? ocjenaOd(novi) : null);
    lastSelRef.current = null;
    zakaziSpremanje();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- autosave ---------------- */
  const zakaziSpremanje = useCallback(() => {
    setSpremljeno(false);
    if (spremiDebRef.current) clearTimeout(spremiDebRef.current);
    spremiDebRef.current = setTimeout(async () => {
      const ed = edRef.current;
      if (!ed) return;
      const sadrzaj = getText(ed);
      await supabase
        .from("dokumenti")
        .update({
          sadrzaj,
          naslov,
          cilj_publika: ciljevi.publika,
          cilj_formalnost: ciljevi.formalnost,
          cilj_podrucje: ciljevi.podrucje,
          cilj_namjera: ciljevi.namjera,
        })
        .eq("id", pocetniDokument.id);
      setSpremljeno(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 900);
  }, [naslov, ciljevi, pocetniDokument.id, supabase]);

  /* ---------------- inicijalno punjenje editora ---------------- */
  useEffect(() => {
    const ed = edRef.current;
    if (!ed) return;
    const novi = computeIssues(pocetniDokument.sadrzaj, {
      ignorirano: ignoriranoRef.current,
      rjecnik: rjecnikRef.current,
    });
    issuesRef.current = novi;
    ed.innerHTML = renderEditorHTML(pocetniDokument.sadrzaj, novi);
    setIssues(novi);
    const rijeci = pocetniDokument.sadrzaj.trim()
      ? pocetniDokument.sadrzaj.trim().split(/\s+/).length
      : 0;
    setBrojRijeci(rijeci);
    setOcjena(rijeci ? ocjenaOd(novi) : null);
    ed.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- unos ---------------- */
  function naUnos() {
    setPopoverIssue(null);
    lastSelRef.current = null;
    setSpremljeno(false);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      analiziraj();
      zakaziSpremanje();
    }, 800);
  }

  function naEnter(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  }

  function naLijepljenje(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  }

  useEffect(() => {
    function naSelekciju() {
      const ed = edRef.current;
      if (!ed) return;
      const s = window.getSelection();
      if (!s || !s.rangeCount) return;
      const r = s.getRangeAt(0);
      if (!r.collapsed && ed.contains(r.startContainer) && ed.contains(r.endContainer)) {
        const a = offsetOf(ed, r.startContainer, r.startOffset);
        const b = offsetOf(ed, r.endContainer, r.endOffset);
        if (a != null && b != null && b > a) lastSelRef.current = { s: a, e: b };
      }
    }
    document.addEventListener("selectionchange", naSelekciju);
    return () => document.removeEventListener("selectionchange", naSelekciju);
  }, []);

  function bljesni(mk: Element) {
    edRef.current?.querySelectorAll("mark.fok").forEach((m) => m.classList.remove("fok"));
    mk.classList.add("fok");
    setTimeout(() => mk.classList.remove("fok"), 1600);
  }

  /* ---------------- prihvat / odbacivanje ---------------- */
  function prihvati(id: number) {
    const i = issuesRef.current.find((x) => x.id === id);
    if (!i || i.sug == null) return;
    const ed = edRef.current;
    if (!ed) return;
    const t = getText(ed);
    void supabase.from("telemetrija_prijedloga").insert({
      dokument_id: pocetniDokument.id,
      kategorija: i.kat,
      pravilo: i.pod,
      original: i.original,
      prijedlog: i.sug,
      odluka: "prihvaceno",
    });
    primijeniTekst(t.slice(0, i.start) + i.sug + t.slice(i.end), i.start + i.sug.length);
    setPopoverIssue(null);
  }

  async function zanemari(id: number) {
    const i = issuesRef.current.find((x) => x.id === id);
    if (!i) return;
    const kljuc = i.kat + "|" + i.original.toLowerCase();
    ignoriranoRef.current.add(kljuc);
    setPopoverIssue(null);
    analiziraj();
    zakaziSpremanje();
    prikazi("U redu, ovo više nećemo predlagati u ovom dokumentu.");
    await supabase.from("zanemareno").insert({ dokument_id: pocetniDokument.id, kljuc });
    await supabase.from("telemetrija_prijedloga").insert({
      dokument_id: pocetniDokument.id,
      kategorija: i.kat,
      pravilo: i.pod,
      original: i.original,
      prijedlog: i.sug,
      odluka: "odbijeno",
    });
  }

  async function uRjecnik(id: number) {
    const i = issuesRef.current.find((x) => x.id === id);
    if (!i) return;
    rjecnikRef.current.add(i.original.toLowerCase());
    setPopoverIssue(null);
    analiziraj();
    prikazi(`»${i.original}« dodano u osobni rječnik.`);
    await supabase.from("rjecnik").insert({ rijec: i.original.toLowerCase() });
  }

  function prihvatiSveTocnost() {
    const ed = edRef.current;
    if (!ed) return;
    const prije = getText(ed);
    let t = prije;
    const pr = issuesRef.current
      .filter((i) => i.kat === "tocnost" && i.sug != null)
      .sort((a, b) => b.start - a.start);
    pr.forEach((i) => (t = t.slice(0, i.start) + i.sug + t.slice(i.end)));
    primijeniTekst(t);
    prikazi(`Prihvaćeno ${pr.length} ispravaka.`, () => primijeniTekst(prije));
  }

  /* ---------------- popover ---------------- */
  function naKlikEditora(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const mk = target.closest("mark");
    if (!mk) return;
    const id = Number(mk.getAttribute("data-id"));
    otvoriPopover(id, mk);
  }

  function otvoriPopover(id: number, mk: Element) {
    const i = issuesRef.current.find((x) => x.id === id);
    if (!i) return;
    fokIdxRef.current = issuesRef.current.indexOf(i);
    setPopoverIssue(i);
    const wr = wrapRef.current?.getBoundingClientRect();
    const r = mk.getBoundingClientRect();
    if (wr && wrapRef.current) {
      setPopoverPos({
        left: Math.max(8, Math.min(r.left - wr.left + wrapRef.current.scrollLeft, wrapRef.current.clientWidth - 310)),
        top: r.bottom - wr.top + wrapRef.current.scrollTop + 8,
      });
    }
    bljesni(mk);
  }

  function skociNaSljedeci() {
    if (!issuesRef.current.length) return;
    fokIdxRef.current = (fokIdxRef.current + 1) % issuesRef.current.length;
    const sljedeci = issuesRef.current[fokIdxRef.current];
    const mk = edRef.current?.querySelector(`mark[data-id="${sljedeci.id}"]`);
    if (mk) {
      mk.scrollIntoView?.({ block: "center" });
      otvoriPopover(sljedeci.id, mk);
    }
  }

  useEffect(() => {
    function naDocKlik(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (popRef.current?.contains(target)) return;
      if (target.closest("mark")) return;
      setPopoverIssue(null);
    }
    function naTipku(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPopoverIssue(null);
        setCiljeviOtvoreni(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        skociNaSljedeci();
      }
    }
    document.addEventListener("click", naDocKlik);
    document.addEventListener("keydown", naTipku);
    return () => {
      document.removeEventListener("click", naDocKlik);
      document.removeEventListener("keydown", naTipku);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- natrag / naslov ---------------- */
  async function natrag() {
    const ed = edRef.current;
    if (ed) {
      if (spremiDebRef.current) clearTimeout(spremiDebRef.current);
      await supabase
        .from("dokumenti")
        .update({
          sadrzaj: getText(ed),
          naslov,
          cilj_publika: ciljevi.publika,
          cilj_formalnost: ciljevi.formalnost,
          cilj_podrucje: ciljevi.podrucje,
          cilj_namjera: ciljevi.namjera,
        })
        .eq("id", pocetniDokument.id);
    }
    router.push("/dokumenti");
  }

  /* ---------------- AI sloj ---------------- */
  function aiIzvor() {
    const ed = edRef.current;
    const t = ed ? getText(ed) : "";
    const sel = lastSelRef.current;
    if (sel && sel.e <= t.length && sel.e > sel.s) return { tekst: t.slice(sel.s, sel.e), s: sel.s, e: sel.e };
    return { tekst: t.slice(0, 1500), s: 0, e: Math.min(t.length, 1500) };
  }

  const ciljStr = () =>
    `publika: ${ciljevi.publika}, formalnost: ${ciljevi.formalnost}, područje: ${ciljevi.podrucje}, namjera: ${ciljevi.namjera}`;

  async function pozoviAI(upit: string): Promise<string> {
    const odgovor = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upit }),
    });
    const podaci = await odgovor.json();
    if (podaci.greska) throw new Error(podaci.greska);
    return podaci.tekst as string;
  }

  function primijeniRezultat(izvor: { s: number; e: number }, tekst: string) {
    const ed = edRef.current;
    if (!ed) return;
    const t = getText(ed);
    primijeniTekst(t.slice(0, izvor.s) + tekst + t.slice(izvor.e));
    prikazi("Primijenjeno.");
  }

  function RezultatBlok({ oznaka, tekst, izvor }: { oznaka: string; tekst: string; izvor: { s: number; e: number } }) {
    return (
      <div className="ed-ai-rezultat">
        <div className="oznaka">{oznaka}</div>
        <div className="tekst">{tekst}</div>
        <button className="btn btn-zel" onClick={() => primijeniRezultat(izvor, tekst)}>
          Primijeni
        </button>
      </div>
    );
  }

  async function aiPreoblikuj() {
    const iz = aiIzvor();
    if (!iz.tekst.trim()) return prikazi("Najprije napišite ili označite tekst.");
    setRezPreoblikuj(<div className="ed-ucitava">Claude čita vaš tekst…</div>);
    try {
      const odg = await pozoviAI(
        `Preoblikuj sljedeći hrvatski tekst u TOČNO 3 varijante. Ciljevi teksta — ${ciljStr()}. Odgovori ISKLJUČIVO valjanim JSON nizom bez ikakvog drugog teksta i bez Markdown ograda, oblika: [{"oznaka":"kraće","tekst":"..."},{"oznaka":"jasnije","tekst":"..."},{"oznaka":"formalnije","tekst":"..."}]. Tekst:\n\n${iz.tekst}`
      );
      const stavke: { oznaka: string; tekst: string }[] = JSON.parse(odg.replace(/```json|```/g, "").trim());
      setRezPreoblikuj(
        <>
          {stavke.map((s, n) => (
            <RezultatBlok key={n} oznaka={s.oznaka} tekst={s.tekst} izvor={iz} />
          ))}
        </>
      );
    } catch {
      setRezPreoblikuj(
        <div className="ed-ai-greska">Analizu trenutačno ne možemo dovršiti. Provjerite vezu i pokušajte ponovno.</div>
      );
    }
  }

  async function aiTon(ton: string) {
    const iz = aiIzvor();
    if (!iz.tekst.trim()) return prikazi("Najprije napišite ili označite tekst.");
    setRezTon(<div className="ed-ucitava">Claude čita vaš tekst…</div>);
    try {
      const odg = await pozoviAI(
        `Prepiši sljedeći hrvatski tekst u tonu: ${ton}. Ciljevi teksta — ${ciljStr()}. Zadrži značenje i duljinu približno istom. Odgovori ISKLJUČIVO prepisanim tekstom na hrvatskom, bez uvoda i komentara.\n\n${iz.tekst}`
      );
      setRezTon(<RezultatBlok oznaka={`Ton: ${ton}`} tekst={odg} izvor={iz} />);
    } catch {
      setRezTon(<div className="ed-ai-greska">Analizu trenutačno ne možemo dovršiti. Provjerite vezu i pokušajte ponovno.</div>);
    }
  }

  async function aiJasnoca() {
    const iz = aiIzvor();
    if (!iz.tekst.trim()) return prikazi("Najprije napišite ili označite tekst.");
    setRezJasnoca(<div className="ed-ucitava">Claude čita vaš tekst…</div>);
    try {
      const odg = await pozoviAI(
        `Pojednostavni sljedeći hrvatski tekst: kraće rečenice, aktivni glagoli, bez pleonazama i administrativizama, bez gubitka značenja. Odgovori ISKLJUČIVO pojednostavljenim tekstom, bez komentara.\n\n${iz.tekst}`
      );
      setRezJasnoca(<RezultatBlok oznaka="Jasnije" tekst={odg} izvor={iz} />);
    } catch {
      setRezJasnoca(<div className="ed-ai-greska">Analizu trenutačno ne možemo dovršiti. Provjerite vezu i pokušajte ponovno.</div>);
    }
  }

  async function aiDijalekt() {
    const iz = aiIzvor();
    if (!iz.tekst.trim()) return prikazi("Najprije napišite ili označite tekst.");
    setRezDijalekt(<div className="ed-ucitava">Claude čita vaš tekst…</div>);
    try {
      const odg = await pozoviAI(
        `Pretvori sljedeći hrvatski standardni tekst u varijetet: ${dijalektOdabran}. Budi jezično autentičan (leksik, fonologija, morfologija toga varijeteta), ali zadrži značenje. Ako je varijetet starohrvatski, piši stilom glagoljaške pisane tradicije 12.–16. stoljeća latiničnom transliteracijom. Odgovori ISKLJUČIVO pretvorenim tekstom, bez komentara.\n\n${iz.tekst}`
      );
      setRezDijalekt(<RezultatBlok oznaka={dijalektOdabran} tekst={odg} izvor={iz} />);
    } catch {
      setRezDijalekt(<div className="ed-ai-greska">Analizu trenutačno ne možemo dovršiti. Provjerite vezu i pokušajte ponovno.</div>);
    }
  }

  /* ---------------- izvedene vrijednosti za prikaz ---------------- */
  const brojevi: Record<Kategorija, number> = { tocnost: 0, jasnoca: 0, zanimljivost: 0, dojam: 0 };
  issues.forEach((i) => (brojevi[i.kat] += 1));
  const ukupno = issues.length;
  const vidljivi = issues.filter((i) => aktivanFiltar === "sve" || i.kat === aktivanFiltar);

  return (
    <div className="ed-app">
      <header className="ed-topbar">
        <button className="ed-natrag" onClick={natrag} title="Natrag na dokumente" aria-label="Natrag na dokumente">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <input
          className="ed-doctitle"
          value={naslov}
          onChange={(e) => {
            setNaslov(e.target.value);
            zakaziSpremanje();
          }}
          aria-label="Naslov dokumenta"
        />
        <div style={{ flex: 1 }} />
        <span className="ed-spremanje">{spremljeno ? "Sve spremljeno" : "Spremanje…"}</span>
        <button
          className="ed-ocjena"
          title="Ukupna ocjena teksta: točnost, jasnoća, zanimljivost i dojam"
          onClick={skociNaSljedeci}
        >
          <span className="ed-prsten" style={{ "--p": ocjena ?? 0 } as React.CSSProperties}>
            <i>{ocjena ?? "—"}</i>
          </span>
          <span className="ed-ocjena-lab">
            Ukupna
            <b>ocjena · {brojRijeci} r.</b>
          </span>
        </button>
        <button className="btn btn-obr" onClick={() => setCiljeviOtvoreni(true)}>
          🎯 Ciljevi
        </button>
        <button className="ed-tgl-panel" onClick={() => setPanelOtvoren((v) => !v)} aria-label="Otvori prijedloge">
          Prijedlozi <span className="bedz">{ukupno}</span>
        </button>
      </header>

      <main className="ed-wrap" ref={wrapRef}>
        <div className="ed-stranica">
          <div
            ref={edRef}
            className="ed-editor"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            data-placeholder="Počnite pisati ili zalijepite tekst…"
            aria-label="Platno za pisanje"
            onInput={naUnos}
            onKeyDown={naEnter}
            onPaste={naLijepljenje}
            onClick={naKlikEditora}
          />
          {popoverIssue && (
            <div
              ref={popRef}
              className="ed-popover"
              role="dialog"
              aria-label="Prijedlog ispravka"
              style={{ left: popoverPos.left, top: popoverPos.top }}
            >
              <div className="ed-kat-red">
                <span className="tocka" style={{ background: KATEGORIJE[popoverIssue.kat].boja }} />
                {KATEGORIJE[popoverIssue.kat].ime} <span className="pod">· {popoverIssue.pod}</span>
              </div>
              {popoverIssue.sug != null && (
                <div className="ed-zamjena">
                  <span className="staro">{skrati(popoverIssue.original)}</span>{" "}
                  <span className="novo">{popoverIssue.sug}</span>
                </div>
              )}
              <div className="ed-obj">{popoverIssue.obj}</div>
              <div className="ed-akcije">
                {popoverIssue.sug != null && (
                  <button className="btn btn-zel" onClick={() => prihvati(popoverIssue.id)}>
                    Prihvati
                  </button>
                )}
                <button className="btn btn-obr" onClick={() => zanemari(popoverIssue.id)}>
                  Odbaci
                </button>
                {popoverIssue.sug != null && !/\s/.test(popoverIssue.original) && (
                  <button className="btn btn-tih" title="Dodaj u osobni rječnik" onClick={() => uRjecnik(popoverIssue.id)}>
                    + Rječnik
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <button
        className={`ed-widget ${ukupno ? "gre" : "ok"}`}
        title={ukupno ? `${ukupno} prijedloga` : "Tekst je bez pogrešaka"}
        onClick={() => {
          if (window.matchMedia("(max-width: 1020px)").matches) setPanelOtvoren((v) => !v);
          else skociNaSljedeci();
        }}
      >
        {ukupno || "✓"}
      </button>

      <aside className={`ed-panel ${panelOtvoren ? "otvoren" : ""}`} aria-label="Ploča prijedloga">
        <div className="ed-p-glava">
          <div className="ed-p-naslov">
            <h2>Prijedlozi</h2>
            <span className="uk">{ukupno ? `${ukupno} prijedloga` : ""}</span>
          </div>
          <div className="ed-p-tabs">
            <button
              className={`ed-p-tab ${aktivanFiltar === "sve" ? "akt" : ""}`}
              onClick={() => {
                setAktivanFiltar("sve");
                setOtvorenaKartica(null);
              }}
            >
              <span className="br">{ukupno}</span>Sve
            </button>
            {(Object.keys(KATEGORIJE) as Kategorija[]).map((k) => (
              <button
                key={k}
                className={`ed-p-tab ${aktivanFiltar === k ? "akt" : ""}`}
                title={KATEGORIJE[k].ime}
                onClick={() => {
                  setAktivanFiltar(k);
                  setOtvorenaKartica(null);
                }}
              >
                <span className="br">
                  <span className="tocka" style={{ background: KATEGORIJE[k].boja }} />
                  {brojevi[k]}
                </span>
                {KATEGORIJE[k].ime}
              </button>
            ))}
          </div>
        </div>

        <button
          className="ed-ai-gumb"
          style={aiOtvoren ? { background: "var(--zelena-100)" } : undefined}
          onClick={() => setAiOtvoren((v) => !v)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
          </svg>
          AI pomoćnik
        </button>

        {!aiOtvoren && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {brojevi.tocnost > 1 && (
              <button className="ed-skupno" onClick={prihvatiSveTocnost}>
                Prihvati sve prijedloge točnosti ({brojevi.tocnost})
              </button>
            )}
            <div className="ed-p-lista">
              {ukupno === 0 && (
                <div className="ed-p-prazno">
                  <div className="ed-krug-ok">✓</div>
                  <strong>Sve je na mjestu.</strong>
                  <br />
                  Nismo pronašli nijednu pogrešku — nastavite pisati.
                </div>
              )}
              {ukupno > 0 && vidljivi.length === 0 && (
                <div className="ed-p-prazno">U ovoj kategoriji trenutačno nema prijedloga.</div>
              )}
              {vidljivi.map((i) => {
                const jednaRijec = i.sug != null && !/\s/.test(i.original);
                const otvorena = otvorenaKartica === i.id;
                return (
                  <div key={i.id} className="ed-kartica">
                    <button
                      className="ed-k-sazeto"
                      style={{ width: "100%", background: "none", border: "none" }}
                      onClick={() => {
                        const novi = otvorena ? null : i.id;
                        setOtvorenaKartica(novi);
                        const mk = edRef.current?.querySelector(`mark[data-id="${i.id}"]`);
                        if (mk && novi != null) {
                          mk.scrollIntoView?.({ block: "center", behavior: "smooth" });
                          bljesni(mk);
                        }
                      }}
                    >
                      <span className="traka" style={{ background: KATEGORIJE[i.kat].boja }} />
                      <span className="tekst">
                        {i.sug != null ? (
                          <>
                            <span className="staro">{skrati(i.original)}</span> <span className="novo">{i.sug}</span>
                          </>
                        ) : (
                          skrati(i.original, 40)
                        )}
                      </span>
                      <span className="vrsta">{i.pod}</span>
                    </button>
                    {otvorena && (
                      <div className="ed-k-detalj">
                        <div className="ed-obj">{i.obj}</div>
                        <div className="ed-akcije">
                          {i.sug != null && (
                            <button className="btn btn-zel" onClick={() => prihvati(i.id)}>
                              Prihvati
                            </button>
                          )}
                          <button className="btn btn-obr" onClick={() => zanemari(i.id)}>
                            Odbaci
                          </button>
                          {jednaRijec && (
                            <button className="btn btn-tih" onClick={() => uRjecnik(i.id)}>
                              + Rječnik
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {aiOtvoren && (
          <div className="ed-ai-panel">
            <div className="ed-ai-blok">
              <h3>
                <span className="tocka" style={{ background: "var(--zelena-600)" }} />
                Preoblikuj
              </h3>
              <p>Označite rečenicu ili odlomak pa zatražite 3 varijante — kraću, jasniju i formalniju.</p>
              <button className="btn btn-zel" onClick={aiPreoblikuj}>
                Preoblikuj odabrano
              </button>
              {rezPreoblikuj}
            </div>
            <div className="ed-ai-blok">
              <h3>
                <span className="tocka" style={{ background: "var(--dojam)" }} />
                Prilagodi ton
              </h3>
              <p>Cijeli tekst ili selekcija prepisuje se u odabranom tonu.</p>
              <div className="ed-ai-red">
                {TONOVI.map((t) => (
                  <button key={t} className="ed-ton-cip" onClick={() => aiTon(t)}>
                    {t}
                  </button>
                ))}
              </div>
              {rezTon}
            </div>
            <div className="ed-ai-blok">
              <h3>
                <span className="tocka" style={{ background: "var(--jasnoca)" }} />
                Jasnoća
              </h3>
              <p>Pojednostavnite složene rečenice bez gubitka značenja.</p>
              <button className="btn btn-obr" onClick={aiJasnoca}>
                Pojednostavi odabrano
              </button>
              {rezJasnoca}
            </div>
            <div className="ed-ai-blok">
              <h3>
                <span className="tocka" style={{ background: "var(--zanimljivost)" }} />
                Dijalekti i povijesni oblici
              </h3>
              <p>Kulturna transformacija teksta — nije lektura, nego baština.</p>
              <select value={dijalektOdabran} onChange={(e) => setDijalektOdabran(e.target.value)}>
                {DIJALEKTI.map((d) => (
                  <option key={d.v} value={d.v}>
                    {d.l}
                  </option>
                ))}
              </select>
              <button className="btn btn-zel" onClick={aiDijalekt}>
                Pretvori odabrano
              </button>
              {rezDijalekt}
              <div className="ed-ai-nap">
                AI funkcije rade na selekciji ili na početku teksta (do ~1500 znakova) — ograničenje prototipa. Vaši
                ciljevi teksta prosljeđuju se asistentu.
              </div>
            </div>
          </div>
        )}
      </aside>

      {ciljeviOtvoreni && (
        <div className="ed-zastor" onClick={(e) => e.target === e.currentTarget && setCiljeviOtvoreni(false)}>
          <div className="ed-modal">
            <h2>Postavite ciljeve teksta</h2>
            <div className="pod">Prijedlozi i AI pomoćnik prilagođavaju se vašoj publici i namjeri.</div>
            {(Object.keys(CILJ_OPCIJE) as (keyof typeof CILJ_OPCIJE)[]).map((c) => (
              <div className="ed-cilj-grupa" key={c}>
                <label>{c === "publika" ? "Publika" : c === "formalnost" ? "Formalnost" : c === "podrucje" ? "Područje" : "Namjera"}</label>
                <div className="ed-seg">
                  {CILJ_OPCIJE[c].map((o) => (
                    <button
                      key={o}
                      className={ciljevi[c] === o ? "akt" : ""}
                      onClick={() => setCiljevi((prev) => ({ ...prev, [c]: o }))}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="dno">
              <button className="btn btn-obr" onClick={() => setCiljeviOtvoreni(false)}>
                Zatvori
              </button>
              <button
                className="btn btn-zel"
                onClick={() => {
                  setCiljeviOtvoreni(false);
                  zakaziSpremanje();
                  prikazi("Ciljevi spremljeni — prijedlozi se prilagođavaju.");
                }}
              >
                Spremi ciljeve
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast poruka={poruka} onZatvori={sakrij} />
    </div>
  );
}

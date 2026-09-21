/**
 * Pravopis.io — pravilni motor za hrvatski jezik.
 * Samostalan, bez vanjskih ovisnosti: koristi ga i klijent (trenutna,
 * optimistična analiza tijekom tipkanja) i poslužiteljske rute
 * (autoritativna provjera prije spremanja, izvoza ili velikih dokumenata).
 *
 * Ovo je P0 sloj iz specifikacije (§6.1, F1-F2): pravila + tipografija +
 * osnovna gramatika. Morfološki rječnik (hunspell-hr) i LLM sloj (Claude,
 * F8-F11) dolaze kao dodatni slojevi cjevovoda opisanog u §8 specifikacije,
 * ne kao zamjena za ovaj modul.
 */

export type Kategorija = "tocnost" | "jasnoca" | "zanimljivost" | "dojam";

export interface Issue {
  id: number;
  start: number;
  end: number;
  kat: Kategorija;
  pod: string;
  original: string;
  sug: string | null;
  obj: string;
}

const NIJEC: Record<string, string> = {
  neznam: "ne znam", neznaš: "ne znaš", nezna: "ne zna", neznamo: "ne znamo",
  neznate: "ne znate", neznaju: "ne znaju",
  nebi: "ne bi", nebih: "ne bih", nebismo: "ne bismo", nebiste: "ne biste",
  nemogu: "ne mogu", nemožeš: "ne možeš", nemože: "ne može",
  nemožemo: "ne možemo", nemožete: "ne možete",
};

const KRIVO: Record<string, string> = {
  sumljam: "sumnjam", sumljaš: "sumnjaš", sumlja: "sumnja",
  sumljamo: "sumnjamo", sumljaju: "sumnjaju",
  uvjek: "uvijek", ljepo: "lijepo", obadva: "oba",
};

const PLEO: Array<[RegExp, string, string]> = [
  [/\bvremenski period\b/gi, "razdoblje", "Pleonazam: »period« već označava vremenski odsječak. Dovoljno je »razdoblje«."],
  [/\bno međutim\b/gi, "međutim", "»No« i »međutim« znače isto — upotrijebite samo jedno."],
  [/\bčak štoviše\b/gi, "štoviše", "»Čak« i »štoviše« udvajaju isto pojačanje — dovoljno je »štoviše«."],
  [/\bukoliko\b/gi, "ako", "»Ukoliko« je administrativizam; u većini rečenica prirodnije je »ako«."],
  [/\bpo pitanju\b/gi, "u vezi s", "»Po pitanju« je kalk iz administrativnog stila; bolje je »u vezi s« ili izravna dopuna."],
];

const cap = (s: string, uzor: string) =>
  /[A-ZČĆĐŠŽ]/.test(uzor[0]) ? s[0].toUpperCase() + s.slice(1) : s;

/** Glavna funkcija: tekst -> popis pronađenih problema, bez preklapanja, sortirano po poziciji. */
export function computeIssues(
  text: string,
  opts: { ignorirano?: Set<string>; rjecnik?: Set<string> } = {}
): Issue[] {
  const ignorirano = opts.ignorirano ?? new Set<string>();
  const rjecnik = opts.rjecnik ?? new Set<string>();
  const out: Issue[] = [];
  let id = 0;

  const push = (
    start: number, end: number, kat: Kategorija, pod: string,
    sug: string | null, obj: string
  ) => {
    const original = text.slice(start, end);
    if (ignorirano.has(kat + "|" + original.toLowerCase())) return;
    if (!/\s/.test(original) && rjecnik.has(original.toLowerCase())) return;
    out.push({ id: id++, start, end, kat, pod, original, sug, obj });
  };

  let m: RegExpExecArray | null;

  const nijRe = new RegExp("\\b(" + Object.keys(NIJEC).join("|") + ")\\b", "gi");
  while ((m = nijRe.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Pravopis",
      cap(NIJEC[m[0].toLowerCase()], m[0]),
      "Niječnica »ne« piše se odvojeno od glagola.");

  const krRe = new RegExp("\\b(" + Object.keys(KRIVO).join("|") + ")\\b", "gi");
  while ((m = krRe.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Pravopis",
      cap(KRIVO[m[0].toLowerCase()], m[0]),
      "Često pogrešno pisanje — standardni je oblik »" + KRIVO[m[0].toLowerCase()] + "«.");

  const jelRe = /\bjel\b/gi;
  while ((m = jelRe.exec(text)))
    push(m.index, m.index + 3, "tocnost", "Pravopis", cap("je li", m[0]),
      "U upitnim konstrukcijama standardni je oblik »je li«.");

  const krat = /\b(npr|tj|itd)\b(?!\.)/g;
  while ((m = krat.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Pravopis", m[0] + ".",
      "Kratica »" + m[0] + "« piše se s točkom.");

  const ri2 = / +([,.;:!?])(?=[A-Za-zČĆĐŠŽčćđšž])/g;
  while ((m = ri2.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Interpunkcija", m[1] + " ",
      "Ispred interpunkcijskog znaka nema razmaka, a iza njega dolazi jedan razmak.");

  const ri = / +([,.;:!?])/g;
  while ((m = ri.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Interpunkcija", m[1],
      "Ispred interpunkcijskog znaka ne dolazi razmak.");

  const dr = /  +/g;
  while ((m = dr.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Tipografija", " ",
      "Dvostruki razmak — dovoljan je jedan.");

  const zb = /,(?=[A-Za-zČĆĐŠŽčćđšž])/g;
  while ((m = zb.exec(text)))
    push(m.index, m.index + 1, "tocnost", "Interpunkcija", ", ",
      "Iza zareza dolazi razmak.");

  const vs = /(^|[.!?]\s+)([a-zčćđšž])/g;
  while ((m = vs.exec(text))) {
    const i = m.index + m[1].length;
    push(i, i + 1, "tocnost", "Velika i mala slova", text[i].toUpperCase(),
      "Rečenica počinje velikim slovom.");
  }

  const sa = /\b([Ss]a)\s+([a-zA-ZčćđšžČĆĐŠŽ]+)/g;
  while ((m = sa.exec(text))) {
    const w = m[2].toLowerCase();
    if ("sšzž".includes(w[0]) || w === "mnom" || /^(ps|ks|kš|pš|x)/.test(w)) continue;
    push(m.index, m.index + m[1].length, "tocnost", "Gramatika",
      m[1][0] === "S" ? "S" : "s",
      "Prijedlog »sa« dolazi samo ispred s, š, z, ž i teških suglasničkih skupina (sa školom, sa mnom). Ovdje je pravilno »s«: s " + m[2] + ".");
  }

  const gk = /\b([Gg]dje)\s+(idem|ideš|ide|idemo|idete|idu|putuje\w*|odlazi\w*|krećem\w*)\b/g;
  while ((m = gk.exec(text)))
    push(m.index, m.index + m[1].length, "tocnost", "Gramatika",
      m[1][0] === "G" ? "Kamo" : "kamo",
      "Uz glagole kretanja pitamo »kamo« (cilj kretanja); »gdje« označava mjesto mirovanja.");

  const uv = /\b([Uu] vezi)\s+(?!s\s|sa\s)(?=[a-zčćđšž])/g;
  while ((m = uv.exec(text)))
    push(m.index, m.index + m[1].length, "tocnost", "Gramatika", m[1] + " s",
      "Uz »u vezi« dolazi instrumental s prijedlogom s: u vezi s natječajem, u vezi s tim.");

  const ob = /\b(s )?obzirom da\b/gi;
  while ((m = ob.exec(text)))
    push(m.index, m.index + m[0].length, "tocnost", "Gramatika",
      cap("s obzirom na to da", m[0]),
      "Pravilna je konstrukcija »s obzirom na to da«.");

  for (const [re, sug, obj] of PLEO) {
    re.lastIndex = 0;
    while ((m = re.exec(text)))
      push(m.index, m.index + m[0].length, "jasnoca", "Sažetost", cap(sug, m[0]), obj);
  }

  const reR = /[^.!?\n]+[.!?]?/g;
  while ((m = reR.exec(text))) {
    const br = m[0].trim().split(/\s+/).filter(Boolean).length;
    if (br > 35)
      push(
        m.index + (m[0].length - m[0].trimStart().length),
        m.index + m[0].length,
        "jasnoca", "Čitljivost", null,
        "Rečenica ima " + br + " riječi — razmislite o podjeli na dvije kraće radi čitljivosti."
      );
  }

  out.sort((a, b) => a.start - b.start || a.id - b.id);
  const cisto: Issue[] = [];
  let kraj = -1;
  for (const i of out) {
    if (i.start >= kraj) {
      cisto.push(i);
      kraj = i.end;
    }
  }
  cisto.forEach((i, n) => (i.id = n));
  return cisto;
}

export const KATEGORIJE: Record<Kategorija, { ime: string; boja: string }> = {
  tocnost: { ime: "Točnost", boja: "#E64C4C" },
  jasnoca: { ime: "Jasnoća", boja: "#4A90E2" },
  zanimljivost: { ime: "Zanimljivost", boja: "#16A085" },
  dojam: { ime: "Dojam", boja: "#9B51E0" },
};

/** Ocjena teksta 0-100 iz popisa problema. */
export function ocjenaOd(issues: Issue[]): number {
  const b = { tocnost: 0, jasnoca: 0, zanimljivost: 0, dojam: 0 };
  issues.forEach((i) => (b[i.kat] += 1));
  return Math.max(12, 100 - 6 * b.tocnost - 3 * b.jasnoca - 2 * b.dojam);
}

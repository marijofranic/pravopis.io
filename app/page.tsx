"use client";

import Link from "next/link";
import { useState } from "react";

const checks = ["Pravopis i gramatika", "Jasnije rečenice", "Objašnjenja na vašem jeziku"];

export default function Pocetna() {
  const [text, setText] = useState("Danas sam napisao važan mail i želim da zvuči profesionalno.");
  const [checked, setChecked] = useState(false);

  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Glavna navigacija">
        <Link href="/" className="wordmark" aria-label="pravopis.io početna"><img src="/pravopis-io-logo.svg" alt="pravopis.io" /></Link>
        <div className="landing-nav-links">
          <a href="#kako-radi">Kako radi</a>
          <a href="#cijene">Cijene</a>
          <Link href="/prijava" className="nav-login">Prijava</Link>
          <Link href="/prijava" className="nav-primary">Počni pisati <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> hrvatski, bez prepreka</p>
          <h1>Pišite bolje.<br /><em>U svom jeziku.</em></h1>
          <p className="hero-lead">Pravopis.io je AI asistent za hrvatski jezik. Ispravlja pravopis, gramatiku i stil — a svaku promjenu objašnjava na vašem jeziku.</p>
          <div className="hero-actions">
            <Link href="/prijava" className="button button-dark">Isprobajte besplatno <span>↗</span></Link>
            <a href="#kako-radi" className="text-link">Saznajte više <span>↓</span></a>
          </div>
          <p className="hero-note">Bez kreditne kartice · Vaš tekst ostaje vaš</p>
        </div>
        <div className="editor-card" aria-label="Primjer pravopisnog uređivača">
          <div className="editor-top"><span className="editor-label">PRIMJER</span><span className="editor-status"><i /> spremno za provjeru</span></div>
          <textarea value={text} onChange={(event) => { setText(event.target.value); setChecked(false); }} aria-label="Tekst za provjeru" />
          <div className="editor-bottom"><span>{text.length} znakova</span><button onClick={() => setChecked(true)} className="check-button">{checked ? "Provjereno ✓" : "Provjeri tekst ↗"}</button></div>
          {checked && <div className="editor-result"><strong>Tekst izgleda dobro.</strong><span>Pronašli smo samo nekoliko prijedloga za još jasniji stil.</span></div>}
        </div>
      </section>

      <section className="trust-row" id="kako-radi">
        <p>Za sve koji žive, rade ili uče u Hrvatskoj.</p>
        <div>{checks.map((item) => <span key={item}><b>✓</b>{item}</span>)}</div>
      </section>

      <section className="bridge-section">
        <div><p className="eyebrow">01 — jezični most</p><h2>Ne samo ispravak.<br /><em>Razumijevanje.</em></h2></div>
        <div className="bridge-copy"><p>Greška je samo početak razgovora. Pravopis.io objašnjava zašto nešto nije dobro i nudi prijedlog koji odgovara vašem tonu.</p><Link href="/prijava" className="text-link">Istražite uređivač <span>↗</span></Link></div>
      </section>

      <section className="pricing-section" id="cijene">
        <div><p className="eyebrow">02 — jednostavno</p><h2>Počnite besplatno.<br /><em>Rastite s nama.</em></h2></div>
        <div className="price-card"><p className="price-kicker">OSNOVNI PLAN</p><p className="price"><strong>0 €</strong> / zauvijek</p><p>Za svakodnevno pisanje bez kompliciranja.</p><Link href="/prijava" className="button button-dark full">Krenite odmah <span>↗</span></Link></div>
      </section>

      <footer><Link href="/" className="wordmark" aria-label="pravopis.io početna"><img src="/pravopis-io-logo.svg" alt="pravopis.io" /></Link><p>Pišite bolje. U svom jeziku.</p><p>© 2026 Pravopis.io</p></footer>
    </main>
  );
}

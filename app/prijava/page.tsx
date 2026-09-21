"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Prijava() {
  const [email, setEmail] = useState("");
  const [poslano, setPoslano] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [ucitava, setUcitava] = useState(false);

  async function posaljiLink(e: React.FormEvent) {
    const supabase = createClient();
    e.preventDefault();
    setGreska(null);
    setUcitava(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setUcitava(false);
    if (error) {
      setGreska("Prijava trenutačno ne uspijeva. Provjerite adresu e-pošte i pokušajte ponovno.");
      return;
    }
    setPoslano(true);
  }

  async function prijavaGoogle() {
    setGreska(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setGreska("Prijava preko Googlea trenutačno nije dostupna.");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--pov-2)",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--pov)",
          border: "1px solid var(--crta)",
          borderRadius: 14,
          maxWidth: 400,
          width: "100%",
          padding: "34px 32px 28px",
          boxShadow: "var(--sjena)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "var(--zelena-600)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          P
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Dobrodošli u Pravopis.io
        </h1>
        <p style={{ color: "var(--t-600)", fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
          Hrvatski asistent za pisanje. Prijavite se e-poštom ili Google računom.
        </p>

        {poslano ? (
          <div
            style={{
              background: "var(--zelena-50)",
              border: "1px solid var(--zelena-100)",
              borderRadius: "var(--r)",
              padding: "14px 16px",
              fontSize: 13.5,
              color: "var(--zelena-700)",
              lineHeight: 1.5,
            }}
          >
            Poslali smo poveznicu za prijavu na <strong>{email}</strong>. Otvorite ju u
            ovom pregledniku da nastavite.
          </div>
        ) : (
          <>
            <form onSubmit={posaljiLink} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                required
                placeholder="ime@primjer.hr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "11px 13px",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--crta)",
                  fontSize: 14,
                }}
              />
              <button type="submit" disabled={ucitava} className="btn btn-zel" style={{ padding: "11px 0" }}>
                {ucitava ? "Šaljemo poveznicu…" : "Nastavi s e-poštom"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--crta)" }} />
              <span style={{ fontSize: 12, color: "var(--t-400)" }}>ili</span>
              <div style={{ flex: 1, height: 1, background: "var(--crta)" }} />
            </div>

            <button
              onClick={prijavaGoogle}
              className="btn btn-obr"
              style={{ width: "100%", padding: "11px 0" }}
            >
              Nastavi s Google računom
            </button>
          </>
        )}

        {greska && (
          <div
            style={{
              marginTop: 14,
              fontSize: 12.5,
              color: "#a33",
              background: "var(--tocnost-bg)",
              borderRadius: "var(--r)",
              padding: "9px 11px",
              lineHeight: 1.5,
            }}
          >
            {greska}
          </div>
        )}
      </div>
    </div>
  );
}

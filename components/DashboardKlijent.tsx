"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeIssues, ocjenaOd } from "@/engine/pravila";
import type { Dokument } from "@/lib/tipovi";
import { zadaniCiljevi } from "@/lib/tipovi";
import Toast, { useToast } from "@/components/Toast";

function ocjenaTeksta(tekst: string): number | null {
  if (!tekst.trim()) return null;
  return ocjenaOd(computeIssues(tekst));
}

function formatDatum(iso: string): string {
  const d = new Date(iso);
  const danas = new Date();
  const jucer = new Date();
  jucer.setDate(danas.getDate() - 1);
  const isti = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (isti(d, danas)) return "danas";
  if (isti(d, jucer)) return "jučer";
  return d.toLocaleDateString("hr-HR", { day: "numeric", month: "short" });
}

export default function DashboardKlijent({
  pocetniDokumenti,
  email,
}: {
  pocetniDokumenti: Dokument[];
  email: string;
}) {
  const [dokumenti, setDokumenti] = useState(pocetniDokumenti);
  const [stvara, setStvara] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { poruka, prikazi, sakrij } = useToast();

  async function noviDokument() {
    setStvara(true);
    const { data, error } = await supabase
      .from("dokumenti")
      .insert({ naslov: "Dokument bez naslova", sadrzaj: "", ...zadaniCiljevi })
      .select()
      .single();
    setStvara(false);
    if (error || !data) {
      prikazi("Dokument trenutačno ne možemo stvoriti. Pokušajte ponovno.");
      return;
    }
    router.push(`/d/${data.id}`);
  }

  async function izbrisi(id: string, naslov: string) {
    const prije = dokumenti;
    setDokumenti((d) => d.filter((x) => x.id !== id));
    const { error } = await supabase.from("dokumenti").delete().eq("id", id);
    if (error) {
      setDokumenti(prije);
      prikazi("Brisanje nije uspjelo. Pokušajte ponovno.");
      return;
    }
    prikazi(`Dokument »${naslov}« izbrisan.`, async () => {
      const { data } = await supabase
        .from("dokumenti")
        .insert({ naslov, sadrzaj: "", ...zadaniCiljevi })
        .select()
        .single();
      if (data) setDokumenti((d) => [data as Dokument, ...d]);
    });
  }

  async function odjava() {
    await fetch("/auth/odjava", { method: "POST" });
    router.push("/prijava");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--pov-2)" }}>
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          background: "var(--pov)",
          borderBottom: "1px solid var(--crta)",
          position: "sticky",
          top: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--zelena-600)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            P
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Pravopis<span style={{ color: "var(--zelena-600)" }}>.io</span>
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: "var(--t-400)" }}>{email}</span>
        <button className="btn btn-obr" onClick={odjava}>
          Odjava
        </button>
        <button className="btn btn-zel" onClick={noviDokument} disabled={stvara}>
          + Novi dokument
        </button>
      </header>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "30px 20px 70px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Moji dokumenti</h1>
        <p style={{ fontSize: 13, color: "var(--t-600)", marginBottom: 22 }}>
          Nastavite gdje ste stali — ili započnite novi tekst.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
            gap: 14,
          }}
        >
          <button
            onClick={noviDokument}
            disabled={stvara}
            style={{
              border: "1.5px dashed var(--crta)",
              borderRadius: 12,
              minHeight: 212,
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--t-600)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "var(--zelena-600)",
                color: "#fff",
                fontSize: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              +
            </span>
            {stvara ? "Stvaramo…" : "Novi dokument"}
          </button>

          {dokumenti.map((d) => {
            const oc = ocjenaTeksta(d.sadrzaj);
            const bojaCipa =
              oc == null
                ? undefined
                : oc >= 90
                ? { background: "var(--zelena-100)", color: "var(--zelena-700)" }
                : oc >= 70
                ? { background: "#FBF3E0", color: "#9A6B12" }
                : { background: "var(--tocnost-bg)", color: "#B03A3A" };

            return (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/d/${d.id}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/d/${d.id}`)}
                style={{
                  position: "relative",
                  background: "var(--pov)",
                  border: "1px solid var(--crta)",
                  borderRadius: 12,
                  minHeight: 212,
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  overflow: "hidden",
                  textAlign: "left",
                }}
                className="dok-kartica"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    izbrisi(d.id, d.naslov);
                  }}
                  title="Izbriši dokument"
                  className="dok-brisi"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--t-400)",
                    background: "var(--pov)",
                    border: "1px solid var(--crta)",
                  }}
                >
                  ✕
                </button>
                <div
                  style={{
                    flex: 1,
                    padding: "14px 14px 8px",
                    fontSize: 10.5,
                    lineHeight: 1.65,
                    color: "var(--t-400)",
                    overflow: "hidden",
                    borderBottom: "1px solid var(--crta-2)",
                    whiteSpace: "pre-wrap",
                    maxHeight: 128,
                    display: d.sadrzaj.trim() ? "block" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontStyle: d.sadrzaj.trim() ? "normal" : "italic",
                  }}
                >
                  {d.sadrzaj.trim() ? d.sadrzaj.slice(0, 300) : "Prazan dokument"}
                </div>
                <div style={{ padding: "11px 13px", display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {d.naslov}
                    </b>
                    <span style={{ fontSize: 11, color: "var(--t-400)" }}>
                      {formatDatum(d.updated_at)}
                    </span>
                  </div>
                  {oc != null && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 999,
                        ...bojaCipa,
                      }}
                    >
                      {oc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toast poruka={poruka} onZatvori={sakrij} />

      <style>{`
        .dok-kartica:hover { box-shadow: var(--sjena); }
        .dok-brisi { opacity: 0; transition: opacity .12s; }
        .dok-kartica:hover .dok-brisi { opacity: 1; }
        .dok-brisi:hover { color: #B03A3A; border-color: #E8C2C2; }
      `}</style>
    </div>
  );
}

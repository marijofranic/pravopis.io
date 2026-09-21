"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ToastStanje {
  tekst: string;
  ponisti?: () => void;
}

export function useToast() {
  const [poruka, setPoruka] = useState<ToastStanje | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prikazi = useCallback((tekst: string, ponisti?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setPoruka({ tekst, ponisti });
    timer.current = setTimeout(() => setPoruka(null), 4200);
  }, []);

  const sakrij = useCallback(() => setPoruka(null), []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { poruka, prikazi, sakrij };
}

export default function Toast({
  poruka,
  onZatvori,
}: {
  poruka: { tekst: string; ponisti?: () => void } | null;
  onZatvori: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--t-900)",
        color: "#fff",
        fontSize: 13,
        padding: "10px 16px",
        borderRadius: "var(--r)",
        display: "flex",
        gap: 14,
        alignItems: "center",
        boxShadow: "var(--sjena)",
        zIndex: 90,
        opacity: poruka ? 1 : 0,
        pointerEvents: poruka ? "auto" : "none",
        transition: "opacity .2s",
      }}
    >
      <span>{poruka?.tekst}</span>
      {poruka?.ponisti && (
        <button
          onClick={() => {
            poruka.ponisti?.();
            onZatvori();
          }}
          style={{ color: "#7FE0C8", fontWeight: 600 }}
        >
          Poništi
        </button>
      )}
    </div>
  );
}

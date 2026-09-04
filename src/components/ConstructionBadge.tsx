"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "donarios_construction_dismissed";

export default function ConstructionBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[340px]">
      <div className="relative flex items-center gap-3 rounded-3xl border border-line bg-white p-4 pr-9 shadow-xl">
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-forest/40 hover:bg-cream-2 hover:text-forest"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M4 4l16 16M20 4L4 20" />
          </svg>
        </button>

        {/* Ilustración: palta trabajando con una pala */}
        <svg width="58" height="66" viewBox="0 0 100 116" className="shrink-0">
          {/* montículo de tierra */}
          <ellipse cx="50" cy="104" rx="34" ry="8" fill="#EFE6CC" />
          <ellipse cx="30" cy="104" rx="9" ry="4" fill="#8B4A2B" />
          {/* cuerpo palta */}
          <ellipse cx="52" cy="56" rx="27" ry="34" fill="#5C7A3F" />
          <ellipse cx="52" cy="58" rx="19" ry="25" fill="#A9C17A" />
          {/* carozo / cara */}
          <circle cx="52" cy="64" r="12" fill="#8B4A2B" />
          <circle cx="48" cy="61" r="1.6" fill="#2B3620" />
          <circle cx="56" cy="61" r="1.6" fill="#2B3620" />
          <path d="M47 67c2 2 6 2 8 0" stroke="#2B3620" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* casco */}
          <path d="M36 34a16 16 0 0132 0z" fill="#C8973C" />
          <rect x="34" y="33" width="36" height="4" rx="2" fill="#A87A28" />
          {/* brazo + pala */}
          <path d="M74 58l14-10" stroke="#5C7A3F" strokeWidth="6" strokeLinecap="round" />
          <path d="M88 48l10-16" stroke="#8B4A2B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M94 29l10 6-6 10-10-6z" fill="#C7CDBB" stroke="#8b9480" strokeWidth="1.5" />
          {/* piecitos */}
          <ellipse cx="42" cy="98" rx="7" ry="4.5" fill="#3E5429" />
          <ellipse cx="62" cy="98" rx="7" ry="4.5" fill="#3E5429" />
          {/* tierrita saltando */}
          <circle cx="20" cy="88" r="2" fill="#8B4A2B" />
          <circle cx="14" cy="96" r="1.4" fill="#8B4A2B" />
        </svg>

        <div>
          <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-avocado-dark">🚧 En construcción</p>
          <p className="text-[13px] leading-snug text-forest/70">
            Seguimos mejorando la tienda todos los días. ¡Gracias por tu paciencia!
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const links = [
  { href: "/categoria/keto", label: "Keto" },
  { href: "/categoria/low-carb", label: "Low carb" },
  { href: "/categoria/sin-gluten", label: "Sin gluten" },
  { href: "/categoria/seleccion", label: "Selección Doña Ríos" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // El menú se "porta" directo a <body> para que no quede atrapado dentro del
  // header (que tiene backdrop-blur — eso crea un contexto que rompe el
  // position:fixed de los hijos, confinándolos a la franja del header).
  useEffect(() => setMounted(true), []);

  const overlay = (
    <div
      className={`fixed inset-0 z-[100] bg-forest/35 transition-opacity md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setOpen(false)}
    >
      <div
        className={`absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white p-6 shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setOpen(false)} className="mb-6 ml-auto block" aria-label="Cerrar menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B3620" strokeWidth="2">
            <path d="M4 4l16 16M20 4L4 20" />
          </svg>
        </button>
        <nav className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3.5 font-display text-lg font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-[4px] p-2 md:hidden"
        aria-label="Abrir menú"
      >
        <span className="h-[2px] w-5 rounded bg-forest" />
        <span className="h-[2px] w-5 rounded bg-forest" />
        <span className="h-[2px] w-5 rounded bg-forest" />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

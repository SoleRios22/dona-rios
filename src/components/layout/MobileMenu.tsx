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

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const overlay = (
    <div
      className="fixed inset-0 z-[100] bg-forest/35 md:hidden"
      onClick={() => setOpen(false)}
    >
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          autoFocus
          onClick={() => setOpen(false)}
          className="mb-6 ml-auto block"
          aria-label="Cerrar menú"
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2B3620"
            strokeWidth="2"
          >
            <path d="M4 4l16 16M20 4L4 20" />
          </svg>
        </button>

        <nav className="flex flex-col" aria-label="Navegación móvil">
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
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col gap-[4px] p-2 md:hidden"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <span className="h-[2px] w-5 rounded bg-forest" />
        <span className="h-[2px] w-5 rounded bg-forest" />
        <span className="h-[2px] w-5 rounded bg-forest" />
      </button>

      {mounted && open && createPortal(overlay, document.body)}
    </>
  );
}
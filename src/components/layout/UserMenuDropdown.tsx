"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export default function UserMenuDropdown({
  fullName,
  initials,
  isAdmin,
}: {
  fullName: string;
  initials: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-light font-display text-sm font-semibold text-avocado-dark"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="px-3 py-2 text-sm font-semibold">{fullName}</div>
          <Link href="/pedidos" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-cream-2">
            Mis pedidos
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-cream-2">
              Panel admin
            </Link>
          )}
          <form action={signOut}>
            <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-clay hover:bg-cream-2">
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

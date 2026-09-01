"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/lib/actions/products";

export default function ActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => { void toggleProductActive(id, !isActive); })}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        isActive ? "bg-avocado/15 text-avocado-dark" : "bg-clay/10 text-clay"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </button>
  );
}

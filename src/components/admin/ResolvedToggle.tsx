"use client";

import { useTransition } from "react";
import { toggleMessageResolved } from "@/lib/actions/contact";

export default function ResolvedToggle({ id, resolved }: { id: string; resolved: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => { void toggleMessageResolved(id, !resolved); })}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        resolved ? "bg-avocado/15 text-avocado-dark" : "bg-honey/20 text-honey-dark"
      }`}
    >
      {resolved ? "Resuelto" : "Pendiente"}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/actions/products";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-forest/70">¿Eliminar &quot;{name}&quot;?</span>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => { void deleteProduct(id); })}
          className="font-semibold text-clay underline"
        >
          Sí, eliminar
        </button>
        <button onClick={() => setConfirming(false)} className="font-semibold text-forest/60 underline">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-clay hover:underline">
      Eliminar
    </button>
  );
}

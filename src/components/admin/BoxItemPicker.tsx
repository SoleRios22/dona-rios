"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";

export interface BoxItemState {
  productId: string;
  name: string;
  quantity: number;
}

export default function BoxItemPicker({
  availableProducts,
  value,
  onChange,
}: {
  availableProducts: { id: string; name: string; price: number }[];
  value: BoxItemState[];
  onChange: (items: BoxItemState[]) => void;
}) {
  const [search, setSearch] = useState("");

  const selectedIds = new Set(value.map((v) => v.productId));
  const filtered = search.trim()
    ? availableProducts.filter(
        (p) => !selectedIds.has(p.id) && p.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const priceById = new Map(availableProducts.map((p) => [p.id, p.price]));
  const individualTotal = value.reduce((sum, item) => sum + (priceById.get(item.productId) ?? 0) * item.quantity, 0);

  function addProduct(p: { id: string; name: string }) {
    onChange([...value, { productId: p.id, name: p.name, quantity: 1 }]);
    setSearch("");
  }

  function updateQuantity(productId: string, quantity: number) {
    onChange(value.map((v) => (v.productId === productId ? { ...v, quantity: Math.max(1, quantity) } : v)));
  }

  function removeProduct(productId: string) {
    onChange(value.filter((v) => v.productId !== productId));
  }

  return (
    <div>
      <div className="relative mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre para agregar..."
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
        />
        {search.trim() && (
          <div className="absolute z-10 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
            {filtered.length === 0 ? (
              <p className="p-3.5 text-sm text-forest/50">No encontramos productos activos con ese nombre.</p>
            ) : (
              filtered.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-cream-2"
                >
                  <span>{p.name}</span>
                  <span className="text-xs font-semibold text-avocado-dark">+ Agregar · {formatCurrency(p.price)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-forest/50">Todavía no agregaste productos a este combo.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {value.map((item) => (
              <div key={item.productId} className="flex flex-wrap items-center gap-2 rounded-xl bg-cream-2 px-3.5 py-2.5">
                <span className="min-w-0 flex-1 text-sm font-medium">{item.name}</span>
                <div className="flex items-center overflow-hidden rounded-full border border-line bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-8 w-8 text-sm font-semibold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-8 w-8 text-sm font-semibold"
                  >
                    +
                  </button>
                </div>
                <button type="button" onClick={() => removeProduct(item.productId)} className="text-clay" aria-label={`Quitar ${item.name}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-forest/50">
            Suma de estos productos por separado: <strong className="text-forest">{formatCurrency(individualTotal)}</strong> — usalo de referencia para poner el precio del combo.
          </p>
        </>
      )}
    </div>
  );
}

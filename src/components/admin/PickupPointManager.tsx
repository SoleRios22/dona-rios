"use client";

import { useState, useTransition } from "react";
import {
  createPickupPoint,
  updatePickupPoint,
  togglePickupPointActive,
  deletePickupPoint,
} from "@/lib/actions/pickup-points";
import type { PickupPoint } from "@/types/database";

export default function PickupPointManager({ initial }: { initial: PickupPoint[] }) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPickupPoint(name, address);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: name.trim(), address: address.trim() || null, is_active: true, sort_order: prev.length },
      ]);
      setName("");
      setAddress("");
    });
  }

  function startEdit(point: PickupPoint) {
    setEditingId(point.id);
    setEditName(point.name);
    setEditAddress(point.address ?? "");
  }

  function saveEdit(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, name: editName.trim(), address: editAddress.trim() || null } : p)));
    setEditingId(null);
    startTransition(() => {
      void updatePickupPoint(id, editName, editAddress);
    });
  }

  function handleToggleActive(id: string, isActive: boolean) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)));
    startTransition(() => {
      void togglePickupPointActive(id, isActive);
    });
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => {
      void deletePickupPoint(id);
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-6">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Terminal de ómnibus"
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">
            Dirección o referencia (opcional)
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Entrada por calle Sobremonte"
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-avocado px-6 py-2.5 text-sm font-semibold text-cream shadow-[0_4px_0_var(--color-avocado-dark)] disabled:opacity-60"
        >
          + Agregar
        </button>
      </form>

      {error && <p className="mb-6 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-forest/50">Todavía no creaste ningún punto de retiro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((point) => (
            <div key={point.id} className="rounded-2xl border border-line bg-white p-5">
              {editingId === point.id ? (
                <div className="flex flex-col gap-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border border-line px-3.5 py-2 text-sm"
                    placeholder="Nombre"
                  />
                  <input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="rounded-xl border border-line px-3.5 py-2 text-sm"
                    placeholder="Dirección o referencia"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(point.id)} className="rounded-full bg-avocado px-4 py-1.5 text-xs font-semibold text-cream">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{point.name}</p>
                    {point.address && <p className="text-xs text-forest/50">{point.address}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(point.id, !point.is_active)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        point.is_active ? "bg-avocado/15 text-avocado-dark" : "bg-clay/10 text-clay"
                      }`}
                    >
                      {point.is_active ? "Visible" : "Oculto"}
                    </button>
                    <button onClick={() => startEdit(point)} className="text-xs font-semibold text-avocado-dark hover:underline">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(point.id)} className="text-xs font-semibold text-clay hover:underline">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
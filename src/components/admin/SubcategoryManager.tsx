"use client";

import { useState, useTransition } from "react";
import { createSubcategory, deleteSubcategory } from "@/lib/actions/subcategories";
import { CATEGORY_LABELS, type CategoryTag, type Subcategory } from "@/types/database";

const ALL_TAGS: CategoryTag[] = ["keto", "low-carb", "sin-gluten", "sin-azucar", "seleccion"];

export default function SubcategoryManager({ initial }: { initial: Subcategory[] }) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [parentTag, setParentTag] = useState<CategoryTag>("keto");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSubcategory(name, parentTag);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), slug: name.trim(), parent_tag: parentTag }]);
      setName("");
    });
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => {
      void deleteSubcategory(id);
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-6">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Panificados"
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Categoría principal</label>
          <select
            value={parentTag}
            onChange={(e) => setParentTag(e.target.value as CategoryTag)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm"
          >
            {ALL_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {CATEGORY_LABELS[tag].emoji} {CATEGORY_LABELS[tag].label}
              </option>
            ))}
          </select>
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

      {ALL_TAGS.map((tag) => {
        const inTag = items.filter((s) => s.parent_tag === tag);
        if (inTag.length === 0) return null;
        return (
          <div key={tag} className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-avocado-dark">
              {CATEGORY_LABELS[tag].emoji} {CATEGORY_LABELS[tag].label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {inTag.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm"
                >
                  {s.name}
                  <button onClick={() => handleDelete(s.id)} className="text-clay" aria-label={`Eliminar ${s.name}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-sm text-forest/50">Todavía no creaste ninguna subcategoría.</p>
      )}
    </div>
  );
}

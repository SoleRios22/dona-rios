"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, type ProductFormInput } from "@/lib/actions/products";
import { CATEGORY_LABELS, type CategoryTag, type Subcategory } from "@/types/database";
import { slugify } from "@/lib/utils/slugify";

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<ProductFormInput>;
  availableSubcategories: Subcategory[];
}

const ALL_TAGS: CategoryTag[] = ["keto", "low-carb", "sin-gluten", "sin-azucar", "seleccion"];
const COLORWAYS = [
  { value: "clay", label: "Terracota (dulce de leche, mermeladas)" },
  { value: "leaf", label: "Verde hoja" },
  { value: "honey", label: "Miel / mostaza" },
  { value: "cream", label: "Crema" },
];

export default function ProductForm({ mode, productId, initial, availableSubcategories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice?.toString() ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [suitableFor, setSuitableFor] = useState(initial?.suitableFor ?? "");
  const [colorway, setColorway] = useState(initial?.colorway ?? "clay");
  const [isBox, setIsBox] = useState(initial?.isBox ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "0");
  const [tags, setTags] = useState<CategoryTag[]>(initial?.tags ?? []);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>(initial?.subcategoryIds ?? []);
  const [variants, setVariants] = useState(initial?.variants ?? []);
  const [nutrition, setNutrition] = useState(initial?.nutrition ?? []);

  function toggleSubcategory(id: string) {
    setSubcategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleTag(tag: CategoryTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: "", priceDelta: 0, isDefault: prev.length === 0 }]);
  }
  function updateVariant(index: number, patch: Partial<(typeof variants)[number]>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function addNutrition() {
    setNutrition((prev) => [...prev, { label: "", value: "" }]);
  }
  function updateNutrition(index: number, patch: Partial<(typeof nutrition)[number]>) {
    setNutrition((prev) => prev.map((n, i) => (i === index ? { ...n, ...patch } : n)));
  }
  function removeNutrition(index: number) {
    setNutrition((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim() || !price) {
      setError("Nombre, slug y precio son obligatorios.");
      return;
    }

    const input: ProductFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      unit: unit.trim(),
      origin: origin.trim(),
      suitableFor: suitableFor.trim(),
      colorway,
      isBox,
      isActive,
      stock: Number(stock) || 0,
      tags,
      subcategoryIds,
      variants: variants.filter((v) => v.label.trim()),
      nutrition: nutrition.filter((n) => n.label.trim()),
    };

    startTransition(async () => {
      const result =
        mode === "create" ? await createProduct(input) : await updateProduct(productId!, input);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h1 className="mb-8 text-3xl">{mode === "create" ? "Nuevo producto" : "Editar producto"}</h1>

      {error && <p className="mb-6 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <Section title="Datos básicos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre" className="col-span-2">
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Slug (URL)" className="col-span-2">
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Descripción breve" className="col-span-2">
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Descripción completa" className="col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-24 resize-y`}
            />
          </Field>
        </div>
      </Section>

      <Section title="Precio y stock">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Precio">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Precio anterior (opcional)">
            <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Unidad (ej: Frasco de 400g)">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Stock">
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Categorías">
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                tags.includes(tag) ? "border-avocado bg-avocado text-cream" : "border-line bg-white"
              }`}
            >
              {CATEGORY_LABELS[tag].emoji} {CATEGORY_LABELS[tag].label}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={isBox} onChange={(e) => setIsBox(e.target.checked)} className="h-4 w-4 accent-avocado" />
          Es un box armado (⭐)
        </label>
      </Section>

      <Section title="Subcategorías (opcional)">
        {tags.length === 0 ? (
          <p className="text-sm text-forest/50">Elegí al menos una categoría principal arriba para ver sus subcategorías.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tags.map((tag) => {
              const options = availableSubcategories.filter((s) => s.parent_tag === tag);
              if (options.length === 0) return null;
              return (
                <div key={tag}>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-forest/60">
                    {CATEGORY_LABELS[tag].emoji} {CATEGORY_LABELS[tag].label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSubcategory(s.id)}
                        className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition ${
                          subcategoryIds.includes(s.id) ? "border-avocado bg-avocado text-cream" : "border-line bg-white"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-forest/50">
              ¿Falta alguna? Podés crearlas desde{" "}
              <a href="/admin/subcategorias" target="_blank" className="underline">
                Subcategorías
              </a>
              .
            </p>
          </div>
        )}
      </Section>

      <Section title="Variantes de peso/volumen (opcional)">
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Ej: 400g"
                value={v.label}
                onChange={(e) => updateVariant(i, { label: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                placeholder="Diferencia de precio"
                value={v.priceDelta}
                onChange={(e) => updateVariant(i, { priceDelta: Number(e.target.value) })}
                className={`${inputClass} w-40`}
              />
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                <input
                  type="radio"
                  name="defaultVariant"
                  checked={v.isDefault}
                  onChange={() => setVariants((prev) => prev.map((x, xi) => ({ ...x, isDefault: xi === i })))}
                  className="accent-avocado"
                />
                Por defecto
              </label>
              <button type="button" onClick={() => removeVariant(i)} className="text-clay">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="self-start text-sm font-semibold text-avocado-dark underline">
            + Agregar variante
          </button>
        </div>
      </Section>

      <Section title="Información nutricional (opcional)">
        <div className="flex flex-col gap-3">
          {nutrition.map((n, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Ej: Carbohidratos"
                value={n.label}
                onChange={(e) => updateNutrition(i, { label: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              <input
                placeholder="Ej: 7,2g"
                value={n.value}
                onChange={(e) => updateNutrition(i, { value: e.target.value })}
                className={`${inputClass} w-40`}
              />
              <button type="button" onClick={() => removeNutrition(i)} className="text-clay">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addNutrition} className="self-start text-sm font-semibold text-avocado-dark underline">
            + Agregar dato nutricional
          </button>
        </div>
      </Section>

      <Section title="Más datos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Origen">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Apto para">
            <input value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Color del mock (ilustración)">
            <select value={colorway} onChange={(e) => setColorway(e.target.value)} className={inputClass}>
              {COLORWAYS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visible en la tienda">
            <select value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")} className={inputClass}>
              <option value="1">Sí, activo</option>
              <option value="0">No, oculto</option>
            </select>
          </Field>
        </div>
      </Section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-avocado px-8 py-3.5 font-semibold text-cream shadow-[0_5px_0_var(--color-avocado-dark)] disabled:opacity-60"
        >
          {isPending ? "Guardando..." : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </button>
        <button type="button" onClick={() => router.push("/admin")} className="rounded-full border-2 border-forest px-8 py-3.5 font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-4 text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">{label}</span>
      {children}
    </label>
  );
}

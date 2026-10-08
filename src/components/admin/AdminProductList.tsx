"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import ActiveToggle from "@/components/admin/ActiveToggle";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import {
  CATEGORY_LABELS,
  type CategoryTag,
} from "@/types/database";

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_box: boolean;
  image_url: string | null;
  colorway: string;
  product_tags: { tag: string }[];
}

interface Props {
  products: AdminProduct[];
  initialSearch: string;
  initialCategory: CategoryTag | "";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .trim();
}

export default function AdminProductList({
  products,
  initialSearch,
  initialCategory,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<CategoryTag | "">(
    initialCategory
  );

  const query = normalize(search);

  const filteredProducts = products.filter((product) => {
    const matchesName = normalize(product.name).includes(query);
    const matchesCategory =
      !category ||
      product.product_tags.some((item) => item.tag === category);

    return matchesName && matchesCategory;
  });

  function listUrl(nextSearch: string, nextCategory: CategoryTag | "") {
    const params = new URLSearchParams();

    if (nextSearch.trim()) params.set("buscar", nextSearch);
    if (nextCategory) params.set("categoria", nextCategory);

    const suffix = params.toString();

    return `/admin/productos${suffix ? `?${suffix}` : ""}`;
  }

  function updateFilters(
    nextSearch: string,
    nextCategory: CategoryTag | ""
  ) {
    setSearch(nextSearch);
    setCategory(nextCategory);

    window.history.replaceState(
      null,
      "",
      listUrl(nextSearch, nextCategory)
    );
  }

  // Al regresar de editar, busca la fila incluso si cambió el nombre
  // o la categoría y ya no coincide con los filtros anteriores.
  useEffect(() => {
  const id = window.location.hash.slice(1);
  if (!id.startsWith("producto-")) return;

  const productId = id.slice("producto-".length);
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  const matchesName = normalize(product.name).includes(
    normalize(initialSearch)
  );

  const matchesCategory =
    !initialCategory ||
    product.product_tags.some(
      (item) => item.tag === initialCategory
    );

  let scrollFrame: number | undefined;

  const frame = window.requestAnimationFrame(() => {
    if (!matchesName || !matchesCategory) {
      setSearch("");
      setCategory("");

      window.history.replaceState(
        null,
        "",
        `/admin/productos#${id}`
      );
    }

    // Espera al siguiente frame para ubicar la fila
    // después de actualizar los filtros.
    scrollFrame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        block: "center",
      });
    });
  });

  return () => {
    window.cancelAnimationFrame(frame);

    if (scrollFrame !== undefined) {
      window.cancelAnimationFrame(scrollFrame);
    }
  };
}, [products, initialSearch, initialCategory]);

  const currentListUrl = listUrl(search, category);

  return (
    <>
      <div className="mb-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              updateFilters(event.target.value, category)
            }
            placeholder="Buscar producto por nombre..."
            aria-label="Buscar producto por nombre"
            className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-avocado"
          />

          {(search || category) && (
            <button
              type="button"
              onClick={() => updateFilters("", "")}
              className="text-sm font-semibold text-avocado-dark underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <nav
          aria-label="Filtrar productos por categoría"
          className="flex flex-wrap gap-2"
        >
          <Link
            href={listUrl(search, "")}
            aria-current={!category ? "page" : undefined}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
              ) {
                return;
              }

              event.preventDefault();
              updateFilters(search, "");
            }}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${
              !category
                ? "border-avocado bg-avocado text-cream"
                : "border-line bg-white text-forest"
            }`}
          >
            Todas
          </Link>

          {(Object.keys(CATEGORY_LABELS) as CategoryTag[]).map(
            (tag) => (
              <Link
                key={tag}
                href={listUrl(search, tag)}
                aria-current={category === tag ? "page" : undefined}
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }

                  event.preventDefault();
                  updateFilters(search, tag);
                }}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${
                  category === tag
                    ? "border-avocado bg-avocado text-cream"
                    : "border-line bg-white text-forest"
                }`}
              >
                {CATEGORY_LABELS[tag].emoji}{" "}
                {CATEGORY_LABELS[tag].label}
              </Link>
            )
          )}
        </nav>
      </div>

      <p role="status" className="mb-3 text-sm text-forest/70">
        {filteredProducts.length} de {products.length} productos
      </p>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-forest/70">
          No encontramos productos con estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-2 text-xs uppercase tracking-wide text-forest/60">
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-5 py-3 font-semibold">Categorías</th>
                <th className="px-5 py-3 font-semibold">Precio</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const returnTo =
                  `${currentListUrl}#producto-${product.id}`;

                return (
                  <tr
                    key={product.id}
                    id={`producto-${product.id}`}
                    className="scroll-mt-24 border-b border-line last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
                          <ProductVisual
                            colorway={product.colorway}
                            isBox={product.is_box}
                            imageUrl={product.image_url}
                            size={40}
                            alt={product.name}
                            imageSizes="56px"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium">
                            {product.name}
                          </p>

                          {product.is_box && (
                            <span className="text-xs text-honey-dark">
                              ⭐ Box
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.product_tags.map(({ tag }) => {
                          const info =
                            CATEGORY_LABELS[tag as CategoryTag];

                          if (!info) return null;

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                updateFilters(
                                  search,
                                  tag as CategoryTag
                                )
                              }
                              aria-label={`Filtrar por ${info.label}`}
                              className="rounded-full bg-cream-2 px-2 py-1 text-xs hover:bg-avocado/15"
                            >
                              {info.emoji} {info.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-display font-semibold">
                      ${product.price.toLocaleString("es-AR")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.stock <= 0
                            ? "font-semibold text-clay"
                            : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <ActiveToggle
                        id={product.id}
                        isActive={product.is_active}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/productos/${product.id}/editar?volver=${encodeURIComponent(returnTo)}`}
                          className="text-xs font-semibold text-avocado-dark hover:underline"
                        >
                          Editar
                        </Link>

                        <DeleteProductButton
                          id={product.id}
                          name={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
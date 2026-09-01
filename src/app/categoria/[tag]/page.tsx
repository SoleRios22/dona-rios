import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getFavoriteProductIds } from "@/lib/actions/favorites";
import { getSubcategories } from "@/lib/actions/subcategories";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import SearchInput from "@/components/SearchInput";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { CATEGORY_LABELS, type CategoryTag } from "@/types/database";

const VALID_TAGS = Object.keys(CATEGORY_LABELS) as CategoryTag[];

const CATEGORY_INTROS: Record<CategoryTag, string> = {
  keto: "Productos compatibles con alimentación cetogénica — elegidos uno por uno.",
  "low-carb": "Menor contenido de carbohidratos, sin resignar sabor.",
  "sin-gluten": "Elaborados específicamente sin gluten, con la aptitud aclarada en cada producto.",
  "sin-azucar": "Sin azúcares agregadas más allá de las propias del ingrediente.",
  seleccion: "Los productos que representan mejor lo que buscamos: calidad real, no cantidad.",
};

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  if (!VALID_TAGS.includes(tag as CategoryTag)) return {};

  const categoryTag = tag as CategoryTag;
  const { label } = CATEGORY_LABELS[categoryTag];
  const title = `${label} en Río Cuarto`;
  const description = `${CATEGORY_INTROS[categoryTag]} Envío o retiro en Río Cuarto, Córdoba.`;

  return {
    title,
    description,
    alternates: { canonical: `/categoria/${tag}` },
    openGraph: { title: `${title} | Doña Ríos`, description, url: `${SITE_URL}/categoria/${tag}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ sort?: string; sub?: string; q?: string }>;
}) {
  const { tag } = await params;
  const { sort, sub, q } = await searchParams;

  if (!VALID_TAGS.includes(tag as CategoryTag)) notFound();
  const categoryTag = tag as CategoryTag;

  let products = await getProducts({ tag: categoryTag, subcategorySlug: sub, search: q });
  const [favoriteIds, subcategories] = await Promise.all([
    getFavoriteProductIds(),
    getSubcategories(categoryTag),
  ]);

  if (sort === "precio-asc") products = [...products].sort((a, b) => a.price - b.price);
  else if (sort === "precio-desc") products = [...products].sort((a, b) => b.price - a.price);
  else if (sort === "valorados") products = [...products].sort((a, b) => b.rating - a.rating);

  const { label, emoji } = CATEGORY_LABELS[categoryTag];

  function buildHref(nextSub?: string) {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    if (nextSub) params.set("sub", nextSub);
    const qs = params.toString();
    return `/categoria/${categoryTag}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8 md:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: label, item: `${SITE_URL}/categoria/${categoryTag}` },
          ],
        }}
      />
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-forest/60">
        <Link href="/" className="hover:text-avocado-dark">Inicio</Link>
        <span className="text-forest/30">/</span>
        <span className="font-semibold text-forest">{label}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 pt-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> {emoji} Categoría
          </p>
          <h1 className="text-[38px]">{label}</h1>
          <p className="mt-2 max-w-lg text-[15px] text-forest/60">{CATEGORY_INTROS[categoryTag]}</p>
        </div>
        <span className="text-sm text-forest/40">{products.length} productos</span>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Suspense fallback={null}>
          <SearchInput />
        </Suspense>
        <div className="sm:ml-auto">
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={buildHref()}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
              !sub ? "bg-avocado text-cream" : "border border-line bg-white text-forest/70"
            }`}
          >
            Todas
          </Link>
          {subcategories.map((s) => (
            <Link
              key={s.id}
              href={buildHref(s.slug)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                sub === s.slug ? "bg-avocado text-cream" : "border border-line bg-white text-forest/70"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-forest/60">
          {q ? `No encontramos productos para "${q}".` : "Todavía no hay productos en esta categoría."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

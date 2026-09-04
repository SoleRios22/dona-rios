import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getFavoriteProductIds } from "@/lib/actions/favorites";
import { createClient } from "@/lib/supabase/server";
import ProductVisual from "@/components/ProductVisual";
import ProductCard from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";
import Stars from "@/components/Stars";
import PurchasePanel from "@/components/product/PurchasePanel";
import ProductTabs from "@/components/product/ProductTabs";
import ReviewForm from "@/components/product/ReviewForm";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/types/database";
import { formatCurrency } from "@/lib/utils/currency";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.name;
  const description =
    product.short_description ||
    `${product.name} — ${CATEGORY_LABELS[product.tags[0]]?.label ?? "Selección Doña Ríos"}. Envío o retiro en Río Cuarto.`;

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: { title: `${title} | Doña Ríos`, description, url: `${SITE_URL}/producto/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug, product.tags);
  const favoriteIds = await getFavoriteProductIds();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const alreadyReviewed = !!user && product.reviews.some((r) => r.userId === user.id);

  const maxCount = Math.max(1, ...Object.values(product.ratingBreakdown));

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || product.name,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: "ARS",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
  if (product.reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <div>
      <JsonLd data={productJsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            ...(product.tags[0]
              ? [
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: CATEGORY_LABELS[product.tags[0]].label,
                    item: `${SITE_URL}/categoria/${product.tags[0]}`,
                  },
                ]
              : []),
            {
              "@type": "ListItem",
              position: product.tags[0] ? 3 : 2,
              name: product.name,
              item: `${SITE_URL}/producto/${product.slug}`,
            },
          ],
        }}
      />
      <div className="mx-auto max-w-[1180px] px-6 pt-6 md:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-forest/60">
          <Link href="/" className="hover:text-avocado-dark">Inicio</Link>
          <span className="text-forest/30">/</span>
          {product.tags[0] && (
            <>
              <Link href={`/categoria/${product.tags[0]}`} className="hover:text-avocado-dark">
                {CATEGORY_LABELS[product.tags[0]].label}
              </Link>
              <span className="text-forest/30">/</span>
            </>
          )}
          <span className="font-semibold text-forest">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-[1180px] gap-14 px-6 py-9 md:grid-cols-2 md:px-8">
        <div>
          <div className="relative h-[440px] overflow-hidden rounded-3xl border border-line">
            <span className="absolute left-5 top-5 z-10 rounded-full bg-avocado px-3.5 py-1.5 text-xs font-semibold text-cream">
              ⭐ Selección Doña Ríos
            </span>
            <ProductVisual colorway={product.colorway} isBox={product.is_box} imageUrl={product.image_url} size={200} />
          </div>
        </div>

        <div>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line bg-cream-2 px-3 py-1.5 text-xs font-semibold text-avocado-dark">
                {CATEGORY_LABELS[tag].emoji} {CATEGORY_LABELS[tag].label}
              </span>
            ))}
          </div>

          <div className="mb-3 flex items-start justify-between gap-4">
            <h1 className="max-w-md text-[34px] leading-tight">{product.name}</h1>
            <FavoriteButton productId={product.id} initiallyFavorite={favoriteIds.has(product.id)} />
          </div>

          <a href="#reviews" className="mb-5 flex items-center gap-2.5">
            <Stars rating={product.rating} size={17} />
            <span className="text-[13.5px] text-forest/60 underline underline-offset-2">
              {product.reviewCount > 0 ? `${product.rating} · ${product.reviewCount} valoraciones` : "Sin valoraciones aún"}
            </span>
          </a>

          <div className="mb-1 flex items-baseline gap-3">
            <span className="font-display text-[32px] font-semibold">{formatCurrency(product.price)}</span>
            {product.old_price && (
              <span className="text-forest/40 line-through">{formatCurrency(product.old_price)}</span>
            )}
          </div>
          {product.unit && <p className="mb-5 text-[13px] text-forest/50">Precio por {product.unit.toLowerCase()}</p>}

          {product.short_description && (
            <p className="mb-6 max-w-md text-[15.5px] text-forest/70">{product.short_description}</p>
          )}

          <PurchasePanel productId={product.id} basePrice={product.price} variants={product.variants} />

          <dl className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
            {product.unit && (
              <div className="flex justify-between text-[13.5px]">
                <dt className="text-forest/60">Peso</dt>
                <dd className="font-semibold">{product.unit}</dd>
              </div>
            )}
            {product.suitable_for && (
              <div className="flex justify-between text-[13.5px]">
                <dt className="text-forest/60">Apto para</dt>
                <dd className="font-semibold">{product.suitable_for}</dd>
              </div>
            )}
            {product.origin && (
              <div className="flex justify-between text-[13.5px]">
                <dt className="text-forest/60">Origen</dt>
                <dd className="font-semibold">{product.origin}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-12 md:px-8">
        <ProductTabs description={product.description ?? ""} nutrition={product.nutrition} />
      </section>

      <section id="reviews" className="mx-auto max-w-[1180px] px-6 py-6 pb-16 md:px-8">
        <div className="mb-11 grid gap-14 md:grid-cols-[280px_1fr]">
          <div className="rounded-[20px] border border-line bg-white p-8 text-center">
            <div className="font-display text-[52px] font-semibold leading-none">{product.rating || "—"}</div>
            <div className="my-2.5 flex justify-center">
              <Stars rating={product.rating} size={19} />
            </div>
            <div className="text-[13px] text-forest/60">Basado en {product.reviewCount} valoraciones</div>
          </div>

          <div>
            {([5, 4, 3, 2, 1] as const).map((n) => (
              <div key={n} className="mb-2 flex items-center gap-2.5 text-[12.5px]">
                <span className="w-9 text-forest/60">{n} ★</span>
                <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-cream-2">
                  <div
                    className="h-full rounded-full bg-honey"
                    style={{ width: `${(product.ratingBreakdown[n] / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-forest/40">{product.ratingBreakdown[n]}</span>
              </div>
            ))}
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="mb-9 flex flex-col gap-5">
            {product.reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-[18px] border border-line bg-white p-5">
                <div className="mb-2.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-light font-display text-sm font-bold text-avocado-dark">
                    {r.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14.5px] font-semibold">{r.authorName}</div>
                    <div className="text-xs text-forest/40">{new Date(r.createdAt).toLocaleDateString("es-AR")}</div>
                  </div>
                </div>
                <div className="mb-2.5">
                  <Stars rating={r.rating} size={15} />
                </div>
                <p className="text-[14.5px] text-forest/70">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        <ReviewForm
          productSlug={product.slug}
          productId={product.id}
          isAuthenticated={!!user}
          alreadyReviewed={alreadyReviewed}
        />
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-8">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> También de la selección
          </p>
          <h2 className="mb-7 text-[28px]">Podría interesarte</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

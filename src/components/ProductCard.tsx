import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import Stars from "@/components/Stars";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import { formatCurrency } from "@/lib/utils/currency";
import { CATEGORY_LABELS, type ProductWithRelations } from "@/types/database";

export default function ProductCard({
  product,
  isFavorite = false,
}: {
  product: ProductWithRelations;
  isFavorite?: boolean;
}) {
  const primaryTag = product.is_box ? null : product.tags[0];

  return (
    <div className="relative rounded-[20px] border border-line bg-white p-5 transition hover:-translate-y-1.5 hover:shadow-[0_16px_30px_rgba(43,54,32,0.10)]">
      {product.is_box ? (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-honey px-2.5 py-1 text-[11px] font-semibold text-forest">
          ⭐ Box
        </span>
      ) : primaryTag ? (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-forest px-2.5 py-1 text-[11px] font-semibold text-cream">
          {CATEGORY_LABELS[primaryTag].emoji} {CATEGORY_LABELS[primaryTag].label}
        </span>
      ) : null}

      <div className="absolute right-4 top-4 z-10">
        <FavoriteButton productId={product.id} initiallyFavorite={isFavorite} size="sm" />
      </div>

      <Link href={`/producto/${product.slug}`}>
        <div className="mb-4 h-[150px]">
          <ProductVisual colorway={product.colorway} isBox={product.is_box} imageUrl={product.image_url} size={product.is_box ? 60 : 60} />
        </div>
        <h3 className="mb-1 text-[16px] font-semibold">{product.name}</h3>
      </Link>

      {product.reviewCount > 0 ? (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-forest/60">
          <Stars rating={product.rating} size={12} />
          {product.rating} ({product.reviewCount})
        </div>
      ) : (
        <div className="mb-3 text-xs text-forest/40">Sé el primero en valorarlo</div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold">{formatCurrency(product.price)}</span>
        <AddToCartButton productId={product.id} variantId={product.variants.find((v) => v.is_default)?.id ?? null} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import type { CategoryTag, ProductWithRelations } from "@/types/database";

// Trae todos los productos activos, opcionalmente filtrados por tag de categoría,
// por subcategoría (slug) y/o por búsqueda de texto (nombre o subcategoría).
export async function getProducts(options?: {
  tag?: CategoryTag;
  subcategorySlug?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, slug, name, short_description, description, price, old_price, unit, origin, suitable_for, colorway, is_box, stock, image_url,
       product_tags(tag),
       product_subcategories(subcategories(id, name, slug)),
       product_variants(id, label, price_delta, is_default),
       reviews(rating)`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  const mapped: ProductWithRelations[] = data.map((p) => {
    const ratings = (p.reviews ?? []).map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const subcategories = (p.product_subcategories ?? [])
      .map((ps) => ps.subcategories as unknown as { id: string; name: string; slug: string } | null)
      .filter((s): s is { id: string; name: string; slug: string } => s !== null);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      short_description: p.short_description,
      description: p.description,
      price: p.price,
      old_price: p.old_price,
      unit: p.unit,
      origin: p.origin,
      suitable_for: p.suitable_for,
      colorway: p.colorway,
      is_box: p.is_box,
      stock: p.stock,
      image_url: p.image_url,
      tags: (p.product_tags ?? []).map((t) => t.tag as CategoryTag),
      subcategories,
      variants: p.product_variants ?? [],
      nutrition: [],
      rating: Number(avg.toFixed(1)),
      reviewCount: ratings.length,
    };
  });

  let result = mapped;

  if (options?.tag) {
    result = result.filter((p) => p.tags.includes(options.tag!));
  }
  if (options?.subcategorySlug) {
    result = result.filter((p) => p.subcategories.some((s) => s.slug === options.subcategorySlug));
  }
  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.subcategories.some((s) => s.name.toLowerCase().includes(q))
      );
    }
  }

  return result;
}

// Trae un producto por slug, con nutrición y reseñas completas (con nombre del autor).
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, short_description, description, price, old_price, unit, origin, suitable_for, colorway, is_box, stock, image_url,
       product_tags(tag),
       product_variants(id, label, price_delta, is_default),
       product_nutrition(label, value, sort_order)`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at, profiles(full_name)")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const ratings = (reviews ?? []).map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    if (r >= 1 && r <= 5) breakdown[r as 1 | 2 | 3 | 4 | 5]++;
  });

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.short_description,
    description: product.description,
    price: product.price,
    old_price: product.old_price,
    unit: product.unit,
    origin: product.origin,
    suitable_for: product.suitable_for,
    colorway: product.colorway,
    is_box: product.is_box,
    stock: product.stock,
    image_url: product.image_url,
    tags: (product.product_tags ?? []).map((t) => t.tag as CategoryTag),
    variants: product.product_variants ?? [],
    nutrition: (product.product_nutrition ?? []).sort((a, b) => a.sort_order - b.sort_order),
    rating: Number(avg.toFixed(1)),
    reviewCount: ratings.length,
    ratingBreakdown: breakdown,
    reviews: (reviews ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      authorName: (r.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "Cliente Doña Ríos",
    })),
  };
}

export async function getRelatedProducts(currentSlug: string, tags: CategoryTag[], limit = 4) {
  const all = await getProducts();
  return all.filter((p) => p.slug !== currentSlug && p.tags.some((t) => tags.includes(t))).slice(0, limit);
}

export async function getFavoriteProducts(favoriteIds: Set<string>) {
  if (favoriteIds.size === 0) return [];
  const all = await getProducts();
  return all.filter((p) => favoriteIds.has(p.id));
}

import { notFound } from "next/navigation";
import { getProductForEdit, getProductsForBoxPicker } from "@/lib/actions/products";
import { getSubcategories } from "@/lib/actions/subcategories";
import ProductForm from "@/components/admin/ProductForm";
import type { CategoryTag } from "@/types/database";


export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ volver?: string }>;
}) {
  const { id } = await params;
  const { volver } = await searchParams;

  let returnTo = `/admin/productos#producto-${id}`;

  if (volver) {
    try {
      const base = "https://donarios.example";
      const destination = new URL(volver, base);

      if (
        destination.origin === base &&
        destination.pathname === "/admin/productos"
      ) {
        returnTo =
          destination.pathname +
          destination.search +
          `#producto-${id}`;
      }
    } catch {
      // Conserva el regreso predeterminado si la URL no es válida.
    }
  }  const [product, availableSubcategories, availableProducts] = await Promise.all([
    getProductForEdit(id),
    getSubcategories(),
    getProductsForBoxPicker(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      returnTo={returnTo}
      availableSubcategories={availableSubcategories}
      availableProducts={availableProducts.filter((p) => p.id !== product.id)}
      initial={{
        name: product.name,
        slug: product.slug,
        shortDescription: product.short_description ?? "",
        description: product.description ?? "",
        price: product.price,
        oldPrice: product.old_price,
        unit: product.unit ?? "",
        origin: product.origin ?? "",
        suitableFor: product.suitable_for ?? "",
        colorway: product.colorway,
        imageUrl: product.image_url,
        nutritionImageUrl: product.nutrition_image_url ?? null,
        isBox: product.is_box,
        isActive: product.is_active,
        stock: product.stock,
        tags: (product.product_tags ?? []).map((t) => t.tag as CategoryTag),
        subcategoryIds: (product.product_subcategories ?? []).map((ps) => ps.subcategory_id),
        variants: (product.product_variants ?? [])
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((v) => ({
  id: v.id,
  label: v.label,
  priceDelta: v.price_delta,
  isDefault: v.is_default,
})),
        nutrition: (product.product_nutrition ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((n) => ({ label: n.label, value: n.value })),
        boxItems: (product.box_items ?? []).map((b) => ({
          productId: b.included_product_id,
          quantity: b.quantity,
          name: (b.products as unknown as { name: string } | null)?.name ?? "Producto",
        })),
      }}
    />
  );
}

import { notFound } from "next/navigation";
import { getProductForEdit } from "@/lib/actions/products";
import { getSubcategories } from "@/lib/actions/subcategories";
import ProductForm from "@/components/admin/ProductForm";
import type { CategoryTag } from "@/types/database";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, availableSubcategories] = await Promise.all([getProductForEdit(id), getSubcategories()]);

  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      availableSubcategories={availableSubcategories}
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
        isBox: product.is_box,
        isActive: product.is_active,
        stock: product.stock,
        tags: (product.product_tags ?? []).map((t) => t.tag as CategoryTag),
        subcategoryIds: (product.product_subcategories ?? []).map((ps) => ps.subcategory_id),
        variants: (product.product_variants ?? [])
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((v) => ({ label: v.label, priceDelta: v.price_delta, isDefault: v.is_default })),
        nutrition: (product.product_nutrition ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((n) => ({ label: n.label, value: n.value })),
      }}
    />
  );
}

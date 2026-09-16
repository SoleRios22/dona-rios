import ProductForm from "@/components/admin/ProductForm";
import { getSubcategories } from "@/lib/actions/subcategories";
import { getProductsForBoxPicker } from "@/lib/actions/products";

export default async function NewProductPage() {
  const [subcategories, availableProducts] = await Promise.all([getSubcategories(), getProductsForBoxPicker()]);
  return <ProductForm mode="create" availableSubcategories={subcategories} availableProducts={availableProducts} />;
}

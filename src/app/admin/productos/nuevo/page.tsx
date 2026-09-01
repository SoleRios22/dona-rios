import ProductForm from "@/components/admin/ProductForm";
import { getSubcategories } from "@/lib/actions/subcategories";

export default async function NewProductPage() {
  const subcategories = await getSubcategories();
  return <ProductForm mode="create" availableSubcategories={subcategories} />;
}

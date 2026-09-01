import { getSubcategories } from "@/lib/actions/subcategories";
import SubcategoryManager from "@/components/admin/SubcategoryManager";

export default async function AdminSubcategoriesPage() {
  const subcategories = await getSubcategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Subcategorías</h1>
        <p className="mt-1 text-sm text-forest/60">
          Vivan dentro de cada categoría principal — por ejemplo &quot;Panificados&quot; dentro de Sin gluten.
        </p>
      </div>
      <SubcategoryManager initial={subcategories} />
    </div>
  );
}

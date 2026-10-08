import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/actions/products";
import AdminProductList from "@/components/admin/AdminProductList";
import {
  CATEGORY_LABELS,
  type CategoryTag,
} from "@/types/database";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    buscar?: string;
    categoria?: string;
  }>;
}) {
  const products = await getAllProductsForAdmin();
  const { buscar = "", categoria = "" } = await searchParams;

  const initialCategory: CategoryTag | "" =
    Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, categoria)
      ? (categoria as CategoryTag)
      : "";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-forest/60">
            {products.length} productos cargados
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-avocado px-5 py-3 text-sm font-semibold text-cream shadow-[0_4px_0_var(--color-avocado-dark)]"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-forest/60">
          Todavía no cargaste ningún producto.{" "}
          <Link
            href="/admin/productos/nuevo"
            className="font-semibold text-avocado-dark underline"
          >
            Cargá el primero
          </Link>
          .
        </div>
      ) : (
        <AdminProductList
          products={products}
          initialSearch={buscar}
          initialCategory={initialCategory}
        />
      )}
    </div>
  );
}
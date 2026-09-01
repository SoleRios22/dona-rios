import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/actions/products";
import { CATEGORY_LABELS, type CategoryTag } from "@/types/database";
import ActiveToggle from "@/components/admin/ActiveToggle";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-forest/60">{products.length} productos cargados</p>
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
          <Link href="/admin/productos/nuevo" className="font-semibold text-avocado-dark underline">
            Cargá el primero
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-2 text-xs uppercase tracking-wide text-forest/60">
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-5 py-3 font-semibold">Categorías</th>
                <th className="px-5 py-3 font-semibold">Precio</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 font-medium">
                    {p.name}
                    {p.is_box && <span className="ml-2 text-xs text-honey-dark">⭐ Box</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.product_tags ?? []).map((t) => {
                        const tag = t.tag as CategoryTag;
                        return (
                          <span key={tag} className="rounded-full bg-cream-2 px-2 py-1 text-xs">
                            {CATEGORY_LABELS[tag]?.emoji} {CATEGORY_LABELS[tag]?.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-display font-semibold">
                    ${p.price.toLocaleString("es-AR")}
                  </td>
                  <td className="px-5 py-4">
                    <span className={p.stock <= 0 ? "font-semibold text-clay" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-4">
                    <ActiveToggle id={p.id} isActive={p.is_active} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/productos/${p.id}/editar`} className="text-xs font-semibold text-avocado-dark hover:underline">
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

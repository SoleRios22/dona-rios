import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFavoriteProductIds } from "@/lib/actions/favorites";
import { getFavoriteProducts } from "@/lib/data/products";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb"

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/favoritos");

  const favoriteIds = await getFavoriteProductIds();
  const products = await getFavoriteProducts(favoriteIds);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 md:px-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Tus favoritos" }]} />
      <h1 className="mb-1 text-3xl">Tus favoritos</h1>
      <p className="mb-8 text-sm text-forest/60">
        {products.length} producto{products.length !== 1 ? "s" : ""} guardado{products.length !== 1 ? "s" : ""}
      </p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="mb-5 text-sm text-forest/60">
            Todavía no guardaste ningún producto. Tocá el corazón en cualquier producto para guardarlo acá.
          </p>
          <Link href="/" className="rounded-full bg-avocado px-6 py-3 font-semibold text-cream">
            Ver selección
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}

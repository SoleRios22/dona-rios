import Link from "next/link";
import { getCart } from "@/lib/actions/cart";
import CartItemRow from "@/components/cart/CartItemRow";
import { formatCurrency } from "@/lib/utils/currency";

interface CartProductJoin {
  id: string;
  slug: string;
  name: string;
  price: number;
  unit: string | null;
  colorway: string;
  is_box: boolean;
}
interface CartVariantJoin {
  id: string;
  label: string;
  price_delta: number;
}

export default async function CartPage() {
  const cart = await getCart();

  if (!cart.authenticated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-2 text-2xl">Tu carrito</h1>
        <p className="mb-6 text-sm text-forest/60">Iniciá sesión para ver y guardar tu carrito.</p>
        <Link href="/login?next=/carrito" className="rounded-full bg-avocado px-6 py-3 font-semibold text-cream">
          Ingresar
        </Link>
      </div>
    );
  }

  const items = cart.items.map((item) => {
    const product = item.products as unknown as CartProductJoin | null;
    const variant = item.product_variants as unknown as CartVariantJoin | null;
    return { item, product, variant };
  });

  const subtotal = items.reduce((sum, { product, variant, item }) => {
    if (!product) return sum;
    return sum + (product.price + (variant?.price_delta ?? 0)) * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 md:px-8">
      <h1 className="mb-1 text-3xl">Tu carrito</h1>
      <p className="mb-8 text-sm text-forest/60">
        {items.length} producto{items.length !== 1 ? "s" : ""} seleccionado{items.length !== 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="mb-5 text-sm text-forest/60">Todavía no agregaste nada.</p>
          <Link href="/" className="rounded-full bg-avocado px-6 py-3 font-semibold text-cream">
            Ver selección
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {items.map(({ item, product, variant }) =>
              product ? (
                <CartItemRow
                  key={item.id}
                  itemId={item.id}
                  productSlug={product.slug}
                  productName={product.name}
                  colorway={product.colorway}
                  isBox={product.is_box}
                  variantLabel={variant?.label ?? product.unit}
                  unitPrice={product.price + (variant?.price_delta ?? 0)}
                  quantity={item.quantity}
                />
              ) : null
            )}
          </div>

          <div className="h-fit rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-5 text-lg">Resumen</h2>
            <div className="mb-2 flex justify-between text-sm text-forest/70">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="mb-5 text-xs text-forest/40">El envío se calcula en el siguiente paso.</p>
            <div className="mb-5 flex justify-between border-t border-line pt-4 text-lg font-semibold">
              <span>Total</span>
              <span className="font-display">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full rounded-full bg-avocado py-3.5 text-center font-semibold text-cream shadow-[0_5px_0_var(--color-avocado-dark)]"
            >
              Continuar compra
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

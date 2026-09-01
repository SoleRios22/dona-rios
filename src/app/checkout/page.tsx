import { redirect } from "next/navigation";
import { getCart } from "@/lib/actions/cart";
import CheckoutForm from "@/components/checkout/CheckoutForm";

interface CartProductJoin {
  name: string;
  price: number;
}
interface CartVariantJoin {
  label: string;
  price_delta: number;
}

export default async function CheckoutPage() {
  const cart = await getCart();

  if (!cart.authenticated) redirect("/login?next=/checkout");
  if (cart.items.length === 0) redirect("/carrito");

  const lines = cart.items
    .map((item) => {
      const product = item.products as unknown as CartProductJoin | null;
      const variant = item.product_variants as unknown as CartVariantJoin | null;
      if (!product) return null;
      return {
        name: product.name,
        variantLabel: variant?.label ?? null,
        quantity: item.quantity,
        unitPrice: product.price + (variant?.price_delta ?? 0),
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-8">
      <h1 className="mb-1 text-3xl">Finalizar pedido</h1>
      <p className="mb-8 text-sm text-forest/60">Últimos datos y coordinamos el resto por WhatsApp</p>
      <CheckoutForm lines={lines} subtotal={subtotal} />
    </div>
  );
}

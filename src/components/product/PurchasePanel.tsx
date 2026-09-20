"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import { formatCurrency } from "@/lib/utils/currency";

interface Variant {
  id: string;
  label: string;
  price_delta: number;
  is_default: boolean;
}

export default function PurchasePanel({
  productId,
  basePrice,
  variants,
  stock,
}: {
  productId: string;
  basePrice: number;
  variants: Variant[];
  stock: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((variant) => variant.is_default) ??
      variants[0] ??
      null
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitPrice = basePrice + (selectedVariant?.price_delta ?? 0);
  const totalPrice = unitPrice * quantity;
  const outOfStock = stock <= 0;

  function handleAdd() {
    if (outOfStock) return;

    setError(null);
    setAdded(false);

    startTransition(async () => {
      const result = await addToCart(
        productId,
        selectedVariant?.id ?? null,
        quantity
      );

      if (result.error === "auth_required") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (result.error) {
        setError(
          "No pudimos agregar esa cantidad. Revisá el stock e intentá nuevamente."
        );
        return;
      }

      setAdded(true);
      router.refresh();

      window.setTimeout(() => {
        setAdded(false);
      }, 2500);
    });
  }

  if (outOfStock) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-clay/20 bg-clay/10 px-5 py-4"
      >
        <p className="font-semibold text-clay">Producto sin stock</p>
        <p className="mt-1 text-sm text-forest/70">
          Podés guardarlo en favoritos para encontrarlo fácilmente cuando
          vuelva a estar disponible.
        </p>
      </div>
    );
  }

  return (
    <div>
      {variants.length > 0 && (
        <>
          <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-forest">
            Peso
          </span>

          <div className="mb-6 flex flex-wrap gap-2.5">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                aria-pressed={selectedVariant?.id === variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`rounded-full border-2 px-4.5 py-2.5 text-sm font-semibold transition ${
                  selectedVariant?.id === variant.id
                    ? "border-avocado bg-avocado text-cream"
                    : "border-line"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </>
      )}

      <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-forest">
        Cantidad
      </span>

      <div className="mb-3.5 flex gap-3.5">
        <div className="flex items-center overflow-hidden rounded-full border-2 border-line">
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.max(1, current - 1))
            }
            disabled={quantity <= 1 || isPending}
            aria-label="Disminuir cantidad"
            className="h-[52px] w-[46px] text-lg font-semibold disabled:opacity-40"
          >
            −
          </button>

          <span
            className="w-9 text-center text-[15px] font-semibold"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(stock, current + 1))
            }
            disabled={quantity >= stock || isPending}
            aria-label="Aumentar cantidad"
            className="h-[52px] w-[46px] text-lg font-semibold disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          className="flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-avocado px-3 text-center text-[14px] font-semibold leading-tight text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5 disabled:opacity-60 sm:text-[15px]"
        >
          {isPending
            ? "Agregando..."
            : added
              ? "✓ Agregado"
              : `Agregar al carrito · ${formatCurrency(totalPrice)}`}
        </button>
      </div>

      {stock <= 5 && (
        <p className="text-xs font-semibold text-honey-dark">
          {stock === 1
            ? "Última unidad disponible"
            : `Quedan ${stock} unidades disponibles`}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay"
        >
          {error}
        </p>
      )}
    </div>
  );
}
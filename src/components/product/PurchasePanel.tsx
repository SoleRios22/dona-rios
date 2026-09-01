"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
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
}: {
  productId: string;
  basePrice: number;
  variants: Variant[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.is_default) ?? variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice = basePrice + (selectedVariant?.price_delta ?? 0);
  const totalPrice = unitPrice * quantity;

  function handleAdd() {
    startTransition(async () => {
      const result = await addToCart(productId, selectedVariant?.id ?? null, quantity);
      if (result.error === "auth_required") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 2500);
    });
  }

  return (
    <div>
      {variants.length > 0 && (
        <>
          <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-forest">Peso</span>
          <div className="mb-6 flex flex-wrap gap-2.5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`rounded-full border-2 px-4.5 py-2.5 text-sm font-semibold transition ${
                  selectedVariant?.id === v.id ? "border-avocado bg-avocado text-cream" : "border-line"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </>
      )}

      <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-forest">Cantidad</span>
      <div className="mb-3.5 flex gap-3.5">
        <div className="flex items-center overflow-hidden rounded-full border-2 border-line">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-[52px] w-[46px] text-lg font-semibold">
            −
          </button>
          <span className="w-9 text-center text-[15px] font-semibold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="h-[52px] w-[46px] text-lg font-semibold">
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-avocado px-3 text-center text-[14px] font-semibold leading-tight text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5 disabled:opacity-60 sm:text-[15px]"
        >
          {isPending ? "Agregando..." : added ? "✓ Agregado" : `Agregar al carrito · ${formatCurrency(totalPrice)}`}
        </button>
      </div>
    </div>
  );
}

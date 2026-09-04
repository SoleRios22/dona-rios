"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart";
import ProductVisual from "@/components/ProductVisual";
import { formatCurrency } from "@/lib/utils/currency";

interface Props {
  itemId: string;
  productSlug: string;
  productName: string;
  colorway: string;
  isBox: boolean;
  imageUrl: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
}

export default function CartItemRow({
  itemId,
  productSlug,
  productName,
  colorway,
  isBox,
  imageUrl,
  variantLabel,
  unitPrice,
  quantity,
}: Props) {
  const [qty, setQty] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  function changeQty(delta: number) {
    const next = qty + delta;
    if (next <= 0) {
      setRemoved(true);
      startTransition(() => {
        removeCartItem(itemId);
      });
      return;
    }
    setQty(next);
    startTransition(() => {
      updateCartItemQuantity(itemId, next);
    });
  }

  if (removed) return null;

  return (
    <div className={`flex gap-4 rounded-2xl border border-line bg-white p-4 ${isPending ? "opacity-60" : ""}`}>
      <Link href={`/producto/${productSlug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <ProductVisual colorway={colorway} isBox={isBox} imageUrl={imageUrl} size={48} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <Link href={`/producto/${productSlug}`} className="font-semibold hover:text-avocado-dark">
            {productName}
          </Link>
          {variantLabel && <p className="text-xs text-forest/50">{variantLabel}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden rounded-full border border-line">
            <button onClick={() => changeQty(-1)} className="h-8 w-8 text-sm font-semibold">
              −
            </button>
            <span className="w-7 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => changeQty(1)} className="h-8 w-8 text-sm font-semibold">
              +
            </button>
          </div>
          <span className="font-display font-semibold">{formatCurrency(unitPrice * qty)}</span>
        </div>
      </div>
      <button
        onClick={() => {
          setRemoved(true);
          startTransition(() => removeCartItem(itemId));
        }}
        className="self-start text-forest/30 hover:text-clay"
        aria-label="Quitar del carrito"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      </button>
    </div>
  );
}

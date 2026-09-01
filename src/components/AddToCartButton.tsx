"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";

export default function AddToCartButton({
  productId,
  variantId = null,
  className = "",
  children,
}: {
  productId: string;
  variantId?: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId, variantId, 1);
      if (result.error === "auth_required") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={
        className ||
        "flex h-9 w-9 items-center justify-center rounded-full bg-avocado text-lg font-semibold text-cream disabled:opacity-60"
      }
      aria-label="Agregar al carrito"
    >
      {children ?? (isPending ? "…" : "+")}
    </button>
  );
}

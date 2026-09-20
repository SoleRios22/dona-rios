"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";

type Feedback = "idle" | "added" | "error";

export default function AddToCartButton({
  productId,
  variantId = null,
  productName = "Producto",
  className = "",
  children,
}: {
  productId: string;
  variantId?: string | null;
  productName?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>("idle");

  function resetFeedback() {
    window.setTimeout(() => {
      setFeedback("idle");
    }, 1800);
  }

  function handleClick() {
    setFeedback("idle");

    startTransition(async () => {
      const result = await addToCart(productId, variantId, 1);

      if (result.error === "auth_required") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (result.error) {
        setFeedback("error");
        resetFeedback();
        return;
      }

      setFeedback("added");
      router.refresh();
      resetFeedback();
    });
  }

  const buttonColor =
    feedback === "added"
      ? "bg-avocado-dark"
      : feedback === "error"
        ? "bg-clay"
        : "bg-avocado";

  const accessibleLabel =
    feedback === "added"
      ? `${productName} agregado al carrito`
      : feedback === "error"
        ? `No se pudo agregar ${productName}`
        : `Agregar ${productName} al carrito`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={accessibleLabel}
      aria-live="polite"
      className={
        className ||
        `flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-cream transition ${buttonColor} disabled:opacity-60`
      }
    >
      {children ??
        (isPending
          ? "…"
          : feedback === "added"
            ? "✓"
            : feedback === "error"
              ? "!"
              : "+")}
    </button>
  );
}
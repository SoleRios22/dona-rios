"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toggleFavorite } from "@/lib/actions/favorites";

export default function FavoriteButton({
  productId,
  initiallyFavorite,
  size = "md",
}: {
  productId: string;
  initiallyFavorite: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFavorite, setIsFavorite] = useState(initiallyFavorite);
  const [isPending, startTransition] = useTransition();

  const dims = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? 15 : 17;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !isFavorite;
    setIsFavorite(next); // optimista

    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (result.error === "auth_required") {
        setIsFavorite(!next); // revertir
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setIsFavorite(result.isFavorite);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
      className={`${dims} flex items-center justify-center rounded-full border border-line bg-white transition hover:scale-105 disabled:opacity-70`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isFavorite ? "#8B4A2B" : "none"}
        stroke={isFavorite ? "#8B4A2B" : "#2B3620"}
        strokeWidth="1.8"
      >
        <path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z" />
      </svg>
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { submitReview } from "@/lib/actions/reviews";

export default function ReviewForm({
  productSlug,
  productId,
  isAuthenticated,
  alreadyReviewed,
}: {
  productSlug: string;
  productId: string;
  isAuthenticated: boolean;
  alreadyReviewed: boolean;
}) {
  const pathname = usePathname();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl bg-cream-2 p-8 text-center">
        <h3 className="mb-2 text-xl">¿Ya lo probaste?</h3>
        <p className="mb-5 text-sm text-forest/60">Iniciá sesión para dejar tu valoración.</p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className="inline-block rounded-full bg-avocado px-6 py-3 font-semibold text-cream"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="rounded-3xl bg-cream-2 p-8 text-center text-sm text-forest/60">
        Ya dejaste tu valoración para este producto. ¡Gracias! 💚
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Elegí un puntaje de 1 a 5 estrellas.");
      return;
    }
    startTransition(async () => {
      const result = await submitReview(productSlug, productId, rating, comment);
      if (result.error) setError(result.error);
      else {
        setSuccess(true);
        setComment("");
        setRating(0);
      }
    });
  }

  return (
    <div className="rounded-3xl bg-cream-2 px-6 py-7 sm:px-10 sm:py-9">
      <h3 className="mb-1.5 text-[22px]">Dejá tu valoración</h3>
      <p className="mb-6 text-sm text-forest/60">Si ya lo probaste, contanos qué te pareció.</p>

      <span className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-forest">Tu puntaje</span>
      <div className="mb-5 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <svg width="30" height="30" viewBox="0 0 20 20" fill={n <= rating ? "#C8973C" : "none"} stroke={n <= rating ? "#A87A28" : "#C4B48A"} strokeWidth="1.5">
              <path d="M10 1l2.6 5.8 6.3.6-4.8 4.2 1.4 6.3L10 14.9 4.5 17.9l1.4-6.3L1.1 7.4l6.3-.6z" />
            </svg>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">{error}</p>}
      {success && <p className="mb-4 rounded-lg bg-avocado px-3 py-2 text-xs font-semibold text-cream">✓ ¡Gracias! Tu valoración se publicó.</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-forest">Tu comentario</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contanos tu experiencia con el producto..."
            className="min-h-[100px] w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-avocado px-7 py-3 font-semibold text-cream disabled:opacity-60"
        >
          {isPending ? "Publicando..." : "Publicar valoración"}
        </button>
      </form>
    </div>
  );
}

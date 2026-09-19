"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmShippingQuoteOrder } from "@/lib/actions/orders";

export default function ShippingQuoteForm({
  orderId,
}: {
  orderId: string;
}) {
  const router = useRouter();
  const [shippingCost, setShippingCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const numericCost = Number(shippingCost);

    if (!Number.isFinite(numericCost) || numericCost < 0) {
      setError("Ingresá un costo de envío válido.");
      return;
    }

    startTransition(async () => {
      const result = await confirmShippingQuoteOrder(
        orderId,
        numericCost
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-2xl border border-honey/40 bg-honey/10 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-forest">
        Confirmar costo de envío
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Costo de envío</span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={shippingCost}
            onChange={(event) =>
              setShippingCost(event.target.value)
            }
            placeholder="Ej: 3500"
            disabled={isPending}
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={isPending || shippingCost === ""}
          className="rounded-full bg-avocado px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {isPending ? "Confirmando..." : "Confirmar pedido"}
        </button>
      </div>

      <p className="mt-2 text-xs text-forest/60">
        Al confirmar se vuelve a controlar el stock, se descuenta y se
        calcula el total final.
      </p>

      {error && (
        <p className="mt-2 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">
          {error}
        </p>
      )}
    </form>
  );
}
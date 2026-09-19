"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/database";
const OPTIONS: { value: OrderStatus; label: string }[] = [
  {
    value: "pendiente",
    label: "Pendiente de confirmar",
  },
  {
    value: "confirmado",
    label: "Confirmado",
  },
  {
    value: "en_preparacion",
    label: "En preparación",
  },
  {
    value: "en_camino",
    label: "En camino",
  },
  {
    value: "entregado",
    label: "Entregado",
  },
  {
    value: "cancelado",
    label: "Cancelado",
  },
];

export default function OrderStatusSelect({
  orderId,
  status,
  shippingPending = false,
}: {
  orderId: string;
  status: OrderStatus;
  shippingPending?: boolean;
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableOptions = shippingPending
    ? OPTIONS.filter(
        (option) =>
          option.value === "pendiente" ||
          option.value === "cancelado"
      )
    : OPTIONS;

  function handleChange(nextStatus: OrderStatus) {
    const previousStatus = selectedStatus;

    setSelectedStatus(nextStatus);
    setError(null);

    startTransition(async () => {
      const result = await updateOrderStatus(
        orderId,
        nextStatus
      );

      if (result.error) {
        setSelectedStatus(previousStatus);
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={selectedStatus}
        disabled={isPending}
        onChange={(event) =>
          handleChange(event.target.value as OrderStatus)
        }
        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
      >
        {availableOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="max-w-64 text-right text-xs text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
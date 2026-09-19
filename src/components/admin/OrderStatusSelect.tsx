"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/database";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente de confirmar" },
  { value: "confirmado", label: "Confirmado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
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
  const [isPending, startTransition] = useTransition();

  const availableOptions = shippingPending
    ? OPTIONS.filter(
        (option) =>
          option.value === "pendiente" ||
          option.value === "cancelado"
      )
    : OPTIONS;

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as OrderStatus;

        startTransition(() => {
          void updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
    >
      {availableOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
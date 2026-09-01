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

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => {
          void updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderStatus } from "@/types/database";

interface OrderConfirmationMessageProps {
  orderId: string;
  customerName: string;
  total: number;
  shippingCost: number;
  status: OrderStatus;
}

export default function OrderConfirmationMessage({
  orderId,
  customerName,
  total,
  shippingCost,
  status,
}: OrderConfirmationMessageProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const statusMessages: Partial<Record<OrderStatus, string>> = {
    confirmado:
      "Tu pedido fue confirmado ✅ Ya lo estamos preparando.",
    en_preparacion:
      "Tu pedido ya está en preparación 🥑",
    en_camino:
      "¡Tu pedido ya está en camino! 🚚",
    entregado:
      "Tu pedido figura como entregado ✅",
  };

  const closingMessages: Partial<Record<OrderStatus, string>> = {
    confirmado:
      "Te avisaremos cuando salga para entrega.",
    en_preparacion:
      "Te avisaremos apenas salga para entrega.",
    en_camino:
      "En breve estaremos llegando a la dirección acordada.",
    entregado:
      "¡Esperamos que lo disfrutes! Gracias por comprar en Doña Ríos.",
  };

  const message = [
    `¡Hola, ${customerName}!`,
    `${statusMessages[status] ?? "Tu pedido fue actualizado."}`,
    "",
    `Pedido: #${orderId.slice(0, 8)}`,
    `Envío: ${formatCurrency(shippingCost)}`,
    `Total: ${formatCurrency(total)}`,
    "",
    closingMessages[status] ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setError(false);

      window.setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      setError(true);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-avocado/30 bg-avocado/10 p-4">
      <p className="mb-2 text-sm font-semibold text-forest">
        Avisar al cliente
      </p>

      <p className="mb-3 text-xs text-forest/60">
        Copiá el mensaje y pegalo en la conversación de WhatsApp.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full bg-avocado px-5 py-2.5 text-sm font-semibold text-cream"
      >
        {copied
          ? "Mensaje copiado ✓"
          : "Copiar aviso para WhatsApp"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-clay">
          No pudimos copiar el mensaje. Probá nuevamente.
        </p>
      )}
    </div>
  );
}
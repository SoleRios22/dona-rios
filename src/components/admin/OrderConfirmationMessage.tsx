"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderFulfillment } from "@/types/database";

interface OrderConfirmationMessageProps {
  orderId: string;
  customerName: string;
  total: number;
  shippingCost: number;
  fulfillment: OrderFulfillment;
}

export default function OrderConfirmationMessage({
  orderId,
  customerName,
  total,
  shippingCost,
  fulfillment,
}: OrderConfirmationMessageProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const message = [
    `¡Hola, ${customerName}! Tu pedido #${orderId.slice(
      0,
      8
    )} fue confirmado ✅`,
    "",
    ...(fulfillment === "envio"
      ? [`Envío: ${formatCurrency(shippingCost)}`]
      : ["Entrega: retiro en punto acordado"]),
    `Total final: ${formatCurrency(total)}`,
    "",
    "Ya lo estamos preparando. Te avisaremos cuando salga para entrega.",
    "¡Gracias por comprar en Doña Ríos! 🥑",
  ].join("\n");

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
          : "Copiar confirmación para WhatsApp"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-clay">
          No pudimos copiarlo. Probá seleccionando el texto
          manualmente.
        </p>
      )}
    </div>
  );
}
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";

export default function OrderConfirmedPage() {
  const params = useSearchParams();
  const wa = params.get("wa") ?? "";
  const total = Number(params.get("total") ?? 0);
  const fulfillment = params.get("fulfillment") ?? "envio";

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-avocado">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FBF6EA" strokeWidth="2.5">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h1 className="mb-3 text-3xl">¡Ya casi está!</h1>
      <p className="mb-8 text-forest/60">
        Armamos tu mensaje. Solo falta que lo envíes por WhatsApp y confirmamos tu pedido enseguida.
      </p>

      <div className="mb-8 rounded-2xl border border-line bg-white p-6 text-left">
        <div className="flex justify-between border-b border-line pb-3 text-sm">
          <span>Total del pedido</span>
          <span className="font-display font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between pt-3 text-sm">
          <span>Entrega</span>
          <span>{fulfillment === "envio" ? "Envío a domicilio" : "Retiro en punto"}</span>
        </div>
      </div>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-block rounded-full bg-honey px-8 py-4 font-semibold text-forest shadow-[0_5px_0_var(--color-honey-dark)]"
        >
          Abrir WhatsApp y enviar pedido
        </a>
      )}

      <div>
        <Link href="/pedidos" className="text-sm font-semibold text-avocado-dark underline">
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}

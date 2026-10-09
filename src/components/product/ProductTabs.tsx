"use client";

import Image from "next/image";
import { useState } from "react";

type TabId = "desc" | "nutri" | "envio";

type ProductTabsProps = {
  description: string;
  nutritionImageUrl?: string | null;
  productName?: string;
  nutrition?: { label: string; value: string }[];
};

export default function ProductTabs({
  description,
  nutritionImageUrl,
  productName = "producto",
}: ProductTabsProps) {
  const [active, setActive] = useState<TabId>("desc");

  const imageUrl = nutritionImageUrl?.trim() || null;
  const currentTab = active === "nutri" && !imageUrl ? "desc" : active;

  const tabs: { id: TabId; label: string }[] = [
    { id: "desc", label: "Descripción" },
    ...(imageUrl
      ? [{ id: "nutri" as const, label: "Información nutricional" }]
      : []),
    { id: "envio", label: "Envío y devoluciones" },
  ];

  return (
    <div className="max-w-[760px]">
      <div className="mb-7 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line sm:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-pressed={currentTab === tab.id}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3.5 py-3.5 text-[14px] font-semibold sm:px-5 sm:text-[15px] ${
              currentTab === tab.id
                ? "border-avocado text-forest"
                : "border-transparent text-forest/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentTab === "desc" && (
        <p className="whitespace-pre-line text-[15px] text-forest/70">
          {description || "Sin descripción cargada todavía."}
        </p>
      )}

      {currentTab === "nutri" && imageUrl && (
        <div className="max-w-[320px]">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir la información nutricional de ${productName} en tamaño completo`}
            className="flex h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-3"
          >
            <Image
              src={imageUrl}
              alt={`Información nutricional de ${productName}`}
              width={1200}
              height={1600}
              sizes="(max-width: 380px) calc(100vw - 72px), 296px"
              className="h-full w-full object-contain"
            />
          </a>

          <p className="mt-3 text-xs text-forest/60">
            Tocá la imagen para verla en tamaño completo.
          </p>
        </div>
      )}

      {currentTab === "envio" && (
        <p className="text-[15px] text-forest/70">
          Los pedidos se coordinan por WhatsApp una vez confirmada la compra.
          Podés elegir envío a domicilio en Río Cuarto o retiro en punto de
          encuentro. Al ser productos alimenticios, no aceptamos devoluciones
          una vez entregado el pedido, salvo error nuestro o producto dañado.
        </p>
      )}
    </div>
  );
}
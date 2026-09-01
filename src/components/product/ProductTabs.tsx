"use client";

import { useState } from "react";

export default function ProductTabs({
  description,
  nutrition,
}: {
  description: string;
  nutrition: { label: string; value: string }[];
}) {
  const [active, setActive] = useState<"desc" | "nutri" | "envio">("desc");

  const tabs = [
    { id: "desc" as const, label: "Descripción" },
    { id: "nutri" as const, label: "Información nutricional" },
    { id: "envio" as const, label: "Envío y devoluciones" },
  ];

  return (
    <div className="max-w-[760px]">
      <div className="mb-7 flex gap-1 overflow-x-auto border-b border-line sm:gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3.5 py-3.5 text-[14px] font-semibold sm:px-5 sm:text-[15px] ${
              active === t.id ? "border-avocado text-forest" : "border-transparent text-forest/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "desc" && <p className="text-[15px] text-forest/70">{description || "Sin descripción cargada todavía."}</p>}

      {active === "nutri" &&
        (nutrition.length > 0 ? (
          <table className="w-full max-w-[420px] text-sm">
            <tbody>
              {nutrition.map((n) => (
                <tr key={n.label} className="border-b border-line">
                  <td className="py-2.5">{n.label}</td>
                  <td className="py-2.5 text-right font-semibold">{n.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[15px] text-forest/50">No cargamos info nutricional para este producto todavía.</p>
        ))}

      {active === "envio" && (
        <p className="text-[15px] text-forest/70">
          Los pedidos se coordinan por WhatsApp una vez confirmada la compra. Podés elegir envío a domicilio en
          Río Cuarto o retiro en punto de encuentro. Al ser productos alimenticios, no aceptamos devoluciones una
          vez entregado el pedido, salvo error nuestro o producto dañado.
        </p>
      )}
    </div>
  );
}

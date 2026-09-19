"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmOrder } from "@/lib/actions/orders";
import { calculateShippingForAddress } from "@/lib/actions/shipping";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderFulfillment, OrderPayment, PickupPoint } from "@/types/database";

const CASH_DISCOUNT_RATE = 0.1; // 10% de descuento pagando en efectivo 

const PAYMENT_OPTIONS: { value: OrderPayment; label: string; note: string }[] = [
  { value: "efectivo", label: "Efectivo", note: "10% OFF " },
  { value: "transferencia", label: "Transferencia", note: "Te pasamos el CBU por WhatsApp" },
  { value: "mercadopago", label: "Mercado Pago (QR)", note: "Al recibir el pedido" },
  { value: "tarjeta", label: "Débito / Crédito", note: "Al recibir el pedido" },
];
interface CartLine {
  name: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
}

export default function CheckoutForm({
  lines,
  subtotal,
  pickupPoints,
}: {
  lines: CartLine[];
  subtotal: number;
  pickupPoints: PickupPoint[];
}) {
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<OrderFulfillment>("envio");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [pickupPoint, setPickupPoint] = useState(pickupPoints[0]?.name ?? "A coordinar por WhatsApp");
  const [paymentMethod, setPaymentMethod] = useState<OrderPayment>("efectivo");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  
  const [freeShipping, setFreeShipping] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, startShippingCalculation] = useTransition();
  

  function markShippingStale() {
    setShippingCalculated(false);
    setShippingCost(null);
  
    setShippingError(null);
  }

  function handleCalculateShipping() {
    if (!address.trim()) {
      setShippingError("Ingresá tu dirección primero.");
      return;
    }
    setShippingError(null);
    startShippingCalculation(async () => {
      const result = await calculateShippingForAddress(address, neighborhood, subtotal);
      if (result.error) {
        setShippingError(result.error);
        setShippingCalculated(false);
        return;
      }
      setShippingCost(result.cost ?? 0);
    
      setFreeShipping(!!result.freeShipping);
      setShippingCalculated(true);
    });
  }

  const effectiveShippingCost = fulfillment === "envio" ? shippingCost ?? 0 : 0;
  const discount = paymentMethod === "efectivo" ? Math.round(subtotal * CASH_DISCOUNT_RATE) : 0;
  const total = subtotal - discount + effectiveShippingCost;
  
  const readyToConfirm = fulfillment === "retiro" || shippingCalculated;


  const waPreview = useMemo(() => {
    const itemLines = lines.map((l) => `${l.quantity}× ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""}`);
    const paymentLabel = PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label ?? paymentMethod;
    return [
      "🥑 Pedido Doña Ríos",
      ...itemLines,
       `Subtotal: ${formatCurrency(subtotal)}`,
      ...(discount > 0 ? [`Descuento efectivo (10%): -${formatCurrency(discount)}`] : []),
      `Total: ${formatCurrency(total)}`,
      `Entrega: ${fulfillment === "envio" ? `Envío a ${address || "domicilio"}` : `Retiro en ${pickupPoint}`}`,
      `Pago: ${paymentLabel}`,
    ].join("\n");
  }, [lines, subtotal, discount, total, fulfillment, address, pickupPoint, paymentMethod]);

  function submitOrder(forceShippingQuote = false) {
    setError(null);
    if (fulfillment === "envio" && !address.trim()) {
      setError("Completá la dirección de envío.");
      return;
    }
    if (
  fulfillment === "envio" &&
  !forceShippingQuote &&
  !shippingCalculated
) {
  setError("Calculá el costo de envío antes de confirmar.");
  return;
}
    startTransition(async () => {
     const res = await confirmOrder({
  fulfillment,
  paymentMethod,
  address: fulfillment === "envio" ? address : undefined,
  neighborhood: fulfillment === "envio" ? neighborhood : undefined,
  pickupPoint: fulfillment === "retiro" ? pickupPoint : undefined,
  forceShippingQuote,
});

      if (res.error === "auth_required") {
        window.location.href = "/login?next=/checkout";
        return;
      }
      if (res.error === "empty_cart") {
        setError("Tu carrito está vacío.");
        return;
      }

if (res.error === "invalid_address") {
  setError("Completá una dirección válida para el envío.");
  return;
}

if (
  res.error === "shipping_quote_created" &&
  res.whatsappUrl
) {
  window.location.href = res.whatsappUrl;
  return;
}
if (res.error === "insufficient_stock") {
  setError(
    "Uno de los productos ya no tiene stock suficiente. Volvé al carrito para revisar las cantidades."
  );
  return;
}

if (res.error === "cart_changed") {
  setError(
    "El precio o el contenido del carrito cambió. Actualizá la página antes de continuar."
  );
  return;
}

      if (res.error || !res.whatsappUrl) {
        setError("No pudimos confirmar el pedido. Probá de nuevo.");
        return;
      }
     const params = new URLSearchParams({
  wa: res.whatsappUrl,
  total: String(res.total),
  fulfillment,
});
      router.push(`/checkout/confirmado?${params.toString()}`);
    });
  }
function handleConfirm() {
  submitOrder(false);
}

function handleShippingQuote() {
  submitOrder(true);
}
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-6 rounded-2xl border border-line bg-white p-7">
          <h2 className="mb-5 flex items-center gap-2.5 text-lg">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-avocado text-xs text-cream">1</span>
            Entrega
          </h2>
          <div className="mb-5 flex gap-2.5">
            <button
              onClick={() => setFulfillment("envio")}
              className={`flex-1 rounded-2xl border-2 p-4 text-center ${fulfillment === "envio" ? "border-avocado bg-cream-2" : "border-line"}`}
            >
              <strong className="block text-sm">🚚 Envío a domicilio</strong>
              <small className="text-forest/50">En Río Cuarto · según distancia</small>
            </button>
            <button
              onClick={() => setFulfillment("retiro")}
              className={`flex-1 rounded-2xl border-2 p-4 text-center ${fulfillment === "retiro" ? "border-avocado bg-cream-2" : "border-line"}`}
            >
              <strong className="block text-sm">🏠 Retiro en punto</strong>
              <small className="text-forest/50">Sin costo</small>
            </button>
          </div>

          {fulfillment === "envio" ? (
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="col-span-2 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">
                    Dirección (calle y número)
                  </span>
                  <input
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      markShippingStale();
                    }}
                    placeholder="Ej: Alvear 750"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Barrio</span>
                  <input
                    value={neighborhood}
                    onChange={(e) => {
                      setNeighborhood(e.target.value);
                      markShippingStale();
                    }}
                    placeholder="Ej: Alberdi"
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleCalculateShipping}
                disabled={isCalculatingShipping || !address.trim()}
                className="mt-4 rounded-full border-2 border-avocado px-5 py-2.5 text-sm font-semibold text-avocado-dark disabled:opacity-50"
              >
                {isCalculatingShipping ? "Calculando..." : "Calcular costo de envío"}
              </button>

              {shippingError && (
                <div className="mt-3 rounded-xl bg-clay/10 p-3">
                  <p className="text-xs text-clay">{shippingError}</p>
                 <button
  type="button"
  onClick={handleShippingQuote}
  disabled={isPending}
  className="mt-2 text-left text-xs font-semibold text-avocado-dark underline disabled:opacity-50"
>
  {isPending
    ? "Guardando pedido..."
    : "Guardar pedido y consultar costo por WhatsApp"}
</button>

<p className="mt-2 text-[11px] text-forest/55">
  El pedido quedará pendiente. El stock se controlará cuando
  confirmemos el costo del envío.
</p>
                </div>
              )}

              {shippingCalculated && (
                <div className="mt-4 rounded-xl bg-cream-2 px-4 py-3 text-sm">
                  {freeShipping ? (
                    <p className="font-semibold text-avocado-dark">🎉 ¡Envío gratis por tu compra!</p>
                  ) : (
                    <div>
                     
                      <div className="flex justify-between">
                        <span className="text-forest/60">Costo de envío</span>
                        <span className="font-display font-semibold">{formatCurrency(shippingCost ?? 0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Punto de encuentro</span>
              {pickupPoints.length > 0 ? (
                <select
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
                >
                  {pickupPoints.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="A coordinar por WhatsApp">A coordinar por WhatsApp</option>
                </select>
              ) : (
                <p className="rounded-xl bg-cream-2 px-3.5 py-2.5 text-sm text-forest/60">
                  Coordinamos el lugar de retiro por WhatsApp.
                </p>
              )}
            </label>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-7">
          <h2 className="mb-5 flex items-center gap-2.5 text-lg">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-avocado text-xs text-cream">2</span>
            Cómo vas a pagar
          </h2>
          <div className="flex flex-col gap-2.5">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPaymentMethod(opt.value)}
                className={`flex flex-col items-start gap-0.5 rounded-2xl border-2 px-4 py-3.5 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-2 ${
                  paymentMethod === opt.value ? "border-avocado bg-cream-2" : "border-line"
                }`}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs text-forest/40">{opt.note}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-cream-2 px-4 py-3 text-xs text-forest/60">
            No cobramos nada acá. Elegís tu forma de pago preferida y la confirmamos juntos por WhatsApp antes
            de coordinar la entrega.
          </p>
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-4 text-lg">Tu pedido</h2>
        {lines.map((l, i) => (
          <div key={i} className="mb-2.5 flex justify-between gap-3 text-sm text-forest/70">
            <span>
              {l.quantity}× {l.name}
            </span>
            <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm text-forest/70">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="mt-2.5 flex justify-between text-sm font-semibold text-avocado-dark">
            <span>Descuento efectivo (10%)</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm text-forest/70">
          <span>Envío</span>
          <span>
            {fulfillment === "retiro"
              ? "Sin costo"
              : shippingCalculated
              ? formatCurrency(effectiveShippingCost)
              : "A calcular"}
          </span>
        </div>
        <div className="mb-4 flex justify-between pt-2.5 text-lg font-semibold">
          <span>Total</span>
          <span className="font-display">{formatCurrency(total)}</span>
        </div>

        <div className="mb-4 rounded-xl bg-[#E7F5DE] p-4 text-xs leading-relaxed text-forest">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-avocado-dark">
            Así vamos a recibir tu pedido:
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-white p-3 font-sans">{waPreview}</pre>
        </div>

        {error && <p className="mb-3 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">{error}</p>}
        {fulfillment === "envio" && !shippingCalculated && !error && (
          <p className="mb-3 text-center text-xs text-forest/50">Calculá el costo de envío para continuar</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={isPending || !readyToConfirm}
          className="w-full rounded-full bg-honey py-3.5 font-semibold text-forest shadow-[0_5px_0_var(--color-honey-dark)] disabled:opacity-60"
        >
          {isPending ? "Confirmando..." : "Confirmar pedido por WhatsApp"}
        </button>
      </div>
    </div>
  );
}
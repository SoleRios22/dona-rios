import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderHistory } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente de confirmar", className: "bg-honey/20 text-honey-dark" },
  confirmado: { label: "Confirmado", className: "bg-avocado/15 text-avocado-dark" },
  entregado: { label: "Entregado", className: "bg-avocado text-cream" },
  cancelado: { label: "Cancelado", className: "bg-clay/10 text-clay" },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pedidos");

  const orders = await getOrderHistory();

  return (
    <div className="mx-auto max-w-[840px] px-6 py-10 md:px-8">
      <h1 className="mb-1 text-3xl">Tus pedidos</h1>
      <p className="mb-8 text-sm text-forest/60">Historial de todo lo que pediste en Doña Ríos</p>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <p className="mb-5 text-sm text-forest/60">Todavía no hiciste ningún pedido.</p>
          <Link href="/" className="rounded-full bg-avocado px-6 py-3 font-semibold text-cream">
            Ver selección
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status as OrderStatus];
            return (
              <div key={order.id} className="rounded-2xl border border-line bg-white p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-forest/40">Pedido #{order.id.slice(0, 8)}</span>
                    <p className="text-sm text-forest/60">
                      {new Date(order.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mb-4 flex flex-col gap-1.5 border-t border-line pt-4">
                  {(order.order_items ?? []).map((oi, i) => (
                    <div key={i} className="flex justify-between text-sm text-forest/70">
                      <span>
                        {oi.quantity}× {oi.product_name_snapshot}
                      </span>
                      <span>{formatCurrency(oi.unit_price * oi.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                  <span className="text-xs text-forest/50">
                    {order.fulfillment === "envio" ? "Envío a domicilio" : "Retiro en punto"} ·{" "}
                    {
                      { efectivo: "Efectivo", transferencia: "Transferencia", mercadopago: "Mercado Pago", tarjeta: "Tarjeta" }[
                        order.payment_method as "efectivo" | "transferencia" | "mercadopago" | "tarjeta"
                      ]
                    }
                  </span>
                  <span className="font-display text-lg font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

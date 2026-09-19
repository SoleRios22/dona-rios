import { getAllOrdersForAdmin } from "@/lib/actions/orders";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import ShippingQuoteForm from "@/components/admin/ShippingQuoteForm";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderStatus } from "@/types/database";
import OrderConfirmationMessage from "@/components/admin/OrderConfirmationMessage";


const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercadopago: "Mercado Pago",
  tarjeta: "Tarjeta",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Pedidos</h1>
        <p className="mt-1 text-sm text-forest/60">
          {orders.length} pedidos en total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-forest/60">
          Todavía no hay pedidos.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const customerName =
              (
                order.profiles as unknown as {
                  full_name: string | null;
                } | null
              )?.full_name ?? "Cliente";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-forest/40">
                      Pedido #{order.id.slice(0, 8)}
                    </span>

                    <p className="text-sm font-semibold">
                      {customerName}
                    </p>

                    <p className="text-xs text-forest/50">
                      {new Date(order.created_at).toLocaleString(
                        "es-AR",
                        {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {order.shipping_pending && (
                      <span className="rounded-full bg-honey/20 px-3 py-1 text-xs font-semibold text-honey-dark">
                        Envío a cotizar
                      </span>
                    )}

                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status as OrderStatus}
                      shippingPending={order.shipping_pending}
                    />
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-1.5 border-t border-line pt-4">
                  {(order.order_items ?? []).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-forest/70"
                    >
                      <span>
                        {item.quantity}×{" "}
                        {item.product_name_snapshot}
                      </span>

                      <span>
                        {formatCurrency(
                          item.unit_price * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {order.shipping_pending &&
                  order.status === "pendiente" && (
                    <ShippingQuoteForm orderId={order.id} />
                  )}
                {!order.shipping_pending &&
  order.fulfillment === "envio" &&
  [
    "confirmado",
    "en_preparacion",
    "en_camino",
    "entregado",
  ].includes(order.status) && (
    <OrderConfirmationMessage
      orderId={order.id}
      customerName={customerName}
      total={Number(order.total)}
      shippingCost={Number(order.shipping_cost)}
      status={order.status as OrderStatus}
    />
  )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-forest/60">
                  <span>
                    {order.fulfillment === "envio"
                      ? `Envío a ${
                          order.address ?? "domicilio"
                        }${
                          order.neighborhood
                            ? `, ${order.neighborhood}`
                            : ""
                        }`
                      : `Retiro en ${
                          order.pickup_point ??
                          "punto a coordinar"
                        }`}
                    {" · "}
                    {PAYMENT_LABELS[order.payment_method] ??
                      order.payment_method}
                  </span>

                  <span className="text-right">
                    <strong className="block font-display text-lg font-semibold text-forest">
                      {formatCurrency(order.total)}
                    </strong>

                    {order.shipping_pending && (
                      <small className="text-honey-dark">
                        + envío a confirmar
                      </small>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
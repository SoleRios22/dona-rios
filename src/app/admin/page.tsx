import Link from "next/link";
import { getPendingOrdersSummary } from "@/lib/actions/orders";
import { getLowStockProducts } from "@/lib/actions/products";
import { getContactMessages } from "@/lib/actions/contact";
import { formatCurrency } from "@/lib/utils/currency";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const [ordersSummary, lowStockProducts, messages] = await Promise.all([
    getPendingOrdersSummary(5),
    getLowStockProducts(LOW_STOCK_THRESHOLD),
    getContactMessages(),
  ]);

  const unresolvedMessages = messages.filter((m) => !m.resolved);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Panel</h1>
        <p className="mt-1 text-sm text-forest/60">Lo que necesita tu atención hoy</p>
      </div>

      {/* STAT CARDS */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          href="/admin/pedidos"
          value={ordersSummary.count}
          label={ordersSummary.count === 1 ? "Pedido pendiente" : "Pedidos pendientes"}
          tone={ordersSummary.count > 0 ? "honey" : "neutral"}
          icon="cart"
        />
        <StatCard
          href="/admin/mensajes"
          value={unresolvedMessages.length}
          label={unresolvedMessages.length === 1 ? "Mensaje sin leer" : "Mensajes sin leer"}
          tone={unresolvedMessages.length > 0 ? "honey" : "neutral"}
          icon="chat"
        />
        <StatCard
          href="/admin/productos"
          value={lowStockProducts.length}
          label={lowStockProducts.length === 1 ? "Producto con poco stock" : "Productos con poco stock"}
          tone={lowStockProducts.length > 0 ? "clay" : "neutral"}
          icon="box"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PEDIDOS PENDIENTES */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Últimos pedidos pendientes</h2>
            <Link href="/admin/pedidos" className="text-xs font-semibold text-avocado-dark hover:underline">
              Ver todos
            </Link>
          </div>
          {ordersSummary.recent.length === 0 ? (
            <p className="text-sm text-forest/50">No hay pedidos pendientes de confirmar. 🎉</p>
          ) : (
            <div className="flex flex-col gap-3">
              {ordersSummary.recent.map((order) => {
                const customerName =
                  (order.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "Cliente";
                return (
                  <Link
                    key={order.id}
                    href="/admin/pedidos"
                    className="flex items-center justify-between rounded-xl bg-cream-2 px-4 py-3 text-sm hover:bg-cream-2/70"
                  >
                    <div>
                      <p className="font-semibold">{customerName}</p>
                      <p className="text-xs text-forest/50">
                        {new Date(order.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="font-display font-semibold">{formatCurrency(order.total)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* STOCK BAJO */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Stock bajo (≤ {LOW_STOCK_THRESHOLD})</h2>
            <Link href="/admin/productos" className="text-xs font-semibold text-avocado-dark hover:underline">
              Ver todos
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-forest/50">Todo tu catálogo tiene stock saludable.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/productos/${p.id}/editar`}
                  className="flex items-center justify-between rounded-xl bg-cream-2 px-4 py-3 text-sm hover:bg-cream-2/70"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className={`font-display font-semibold ${p.stock <= 0 ? "text-clay" : "text-honey-dark"}`}>
                    {p.stock} {p.stock === 1 ? "unidad" : "unidades"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ICONS = {
  cart: "M3 4h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6",
  chat: "M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-6.5-3L3 20l1-3.5A8.38 8.38 0 013 12a8.5 8.5 0 018.5-8.5A8.38 8.38 0 0121 11.5z",
  box: "M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10",
} as const;

const TONES = {
  honey: "bg-honey/15 text-honey-dark",
  clay: "bg-clay/10 text-clay",
  neutral: "bg-cream-2 text-avocado-dark",
} as const;

function StatCard({
  href,
  value,
  label,
  tone,
  icon,
}: {
  href: string;
  value: number;
  label: string;
  tone: keyof typeof TONES;
  icon: keyof typeof ICONS;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d={ICONS[icon]} />
        </svg>
      </div>
      <div className="font-display text-3xl font-semibold">{value}</div>
      <p className="mt-1 text-sm text-forest/60">{label}</p>
    </Link>
  );
}

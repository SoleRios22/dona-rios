"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderFulfillment, OrderPayment } from "@/types/database";

const WHATSAPP_NUMBER = "5493584315332"; // el mismo que ya usan en su bio de Instagram

interface CheckoutInput {
  fulfillment: OrderFulfillment;
  paymentMethod: OrderPayment;
  address?: string;
  neighborhood?: string;
  pickupPoint?: string;
  shippingCost: number;
    shippingDistanceKm?: number;
}

export async function confirmOrder(input: CheckoutInput) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "auth_required" as const, whatsappUrl: null };

  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", auth.user.id).maybeSingle();
  if (!cart) return { error: "empty_cart" as const, whatsappUrl: null };

  const { data: items } = await supabase
    .from("cart_items")
    .select(`quantity, products(id, name, price), product_variants(label, price_delta)`)
    .eq("cart_id", cart.id);

  if (!items || items.length === 0) return { error: "empty_cart" as const, whatsappUrl: null };

  const lines: string[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = item.products as unknown as { id: string; name: string; price: number } | null;
    const variant = item.product_variants as unknown as { label: string; price_delta: number } | null;
    if (!product) continue;

    const unitPrice = product.price + (variant?.price_delta ?? 0);
    subtotal += unitPrice * item.quantity;
    lines.push(`${item.quantity}× ${product.name}${variant ? ` (${variant.label})` : ""}`);
  }

  const total = subtotal + input.shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: auth.user.id,
      fulfillment: input.fulfillment,
      payment_method: input.paymentMethod,
      address: input.address ?? null,
      neighborhood: input.neighborhood ?? null,
      pickup_point: input.pickupPoint ?? null,
      shipping_cost: input.shippingCost,
      total,
      status: "pendiente",
            shipping_distance_km: input.shippingDistanceKm ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: "order_failed" as const, whatsappUrl: null };

  for (const item of items) {
    const product = item.products as unknown as { id: string; name: string; price: number } | null;
    const variant = item.product_variants as unknown as { label: string; price_delta: number } | null;
    if (!product) continue;
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price: product.price + (variant?.price_delta ?? 0),
      quantity: item.quantity,
    });
    await supabase.rpc("decrement_product_stock", {
      p_product_id: product.id,
      p_quantity: item.quantity,
    });
  }

  const paymentLabels: Record<OrderPayment, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    mercadopago: "Mercado Pago (QR)",
    tarjeta: "Débito / Crédito",
  };

  const message = [
    "🥑 Pedido Doña Ríos",
    ...lines,
    `Total: $${total.toLocaleString("es-AR")}`,
        ...(input.shippingDistanceKm ? [`Distancia estimada: ${input.shippingDistanceKm} km`] : []),
    `Entrega: ${input.fulfillment === "envio" ? `Envío a ${input.address ?? "domicilio"}` : `Retiro en ${input.pickupPoint ?? "punto a coordinar"}`}`,
    `Pago: ${paymentLabels[input.paymentMethod]}`,
    `N° de pedido: ${order.id.slice(0, 8)}`,
  ].join("\n");

  await supabase.from("orders").update({ whatsapp_message: message }).eq("id", order.id);
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/pedidos");

  return { error: null, whatsappUrl, orderId: order.id, message };
}

export async function getOrderHistory() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select(`id, total, status, fulfillment, payment_method, created_at, order_items(product_name_snapshot, quantity, unit_price)`)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  return orders ?? [];
}

// ---- Panel admin ----

async function requireAdminForOrders(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "admin";
}

export async function getAllOrdersForAdmin() {
  const supabase = await createClient();
  if (!(await requireAdminForOrders(supabase))) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, total, status, fulfillment, payment_method, address, neighborhood, pickup_point, created_at,
       profiles(full_name),
       order_items(product_name_snapshot, quantity, unit_price)`
    )
    .order("created_at", { ascending: false });

  return orders ?? [];
}

export async function updateOrderStatus(orderId: string, status: "pendiente" | "confirmado" | "entregado" | "cancelado") {
  const supabase = await createClient();
  if (!(await requireAdminForOrders(supabase))) return { error: "No tenés permisos de administrador." };

  const { data: currentOrder } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  if (!currentOrder) return { error: "No encontramos ese pedido." };

  const wasCancelled = currentOrder.status === "cancelado";
  const willBeCancelled = status === "cancelado";

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: "No se pudo actualizar el estado." };

  // Si cambia hacia/desde "cancelado", ajustamos el stock (sumamos al cancelar, restamos si se reactiva).
  if (wasCancelled !== willBeCancelled) {
    const { data: items } = await supabase.from("order_items").select("product_id, quantity").eq("order_id", orderId);
    for (const item of items ?? []) {
      if (!item.product_id) continue;
      const qty = willBeCancelled ? -item.quantity : item.quantity;
      await supabase.rpc("decrement_product_stock", { p_product_id: item.product_id, p_quantity: qty });
    }
  }

  revalidatePath("/admin/pedidos");
 
  revalidatePath("/admin");
  
  revalidatePath("/pedidos");

  return { error: null };
}
// Para el dashboard: cantidad de pedidos pendientes + los últimos, sin traer todo el historial.
export async function getPendingOrdersSummary(limit = 5) {
  const supabase = await createClient();
  if (!(await requireAdminForOrders(supabase))) return { count: 0, recent: [] };

  const { data, count } = await supabase
    .from("orders")
    .select("id, total, created_at, profiles(full_name)", { count: "exact" })
    .eq("status", "pendiente")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { count: count ?? 0, recent: data ?? [] };
}
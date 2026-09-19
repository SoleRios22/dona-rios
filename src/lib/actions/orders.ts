"use server";

import { calculateShippingForAddress } from "@/lib/actions/shipping";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { OrderFulfillment, OrderPayment } from "@/types/database";

const WHATSAPP_NUMBER = "5493584315332"; // el mismo que ya usan en su bio de Instagram

interface CheckoutInput {
  fulfillment: OrderFulfillment;
  paymentMethod: OrderPayment;
  address?: string;
  neighborhood?: string;
  pickupPoint?: string;
  forceShippingQuote?: boolean;
}

interface AtomicOrderResult {
  order_id: string;
  order_subtotal: number | string;
  order_discount: number | string;
  order_total: number | string;
}
interface ShippingQuoteResult {
  order_id: string;
  order_subtotal: number | string;
  order_discount: number | string;
  order_partial_total: number | string;
}

export async function confirmOrder(input: CheckoutInput) {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return {
      error: "auth_required" as const,
      whatsappUrl: null,
    };
  }

  const supabaseAdmin = createAdminClient();

  if (!(["envio", "retiro"] as const).includes(input.fulfillment)) {
    return {
      error: "invalid_fulfillment" as const,
      whatsappUrl: null,
    };
  }

  if (
    !(
      ["efectivo", "transferencia", "mercadopago", "tarjeta"] as const
    ).includes(input.paymentMethod)
  ) {
    return {
      error: "invalid_payment" as const,
      whatsappUrl: null,
    };
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!cart) {
    return {
      error: "empty_cart" as const,
      whatsappUrl: null,
    };
  }

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `quantity,
       products(id, name, price),
       product_variants(label, price_delta)`
    )
    .eq("cart_id", cart.id);

  if (!items || items.length === 0) {
    return {
      error: "empty_cart" as const,
      whatsappUrl: null,
    };
  }

  const lines: string[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = item.products as unknown as {
      id: string;
      name: string;
      price: number;
    } | null;

    const variant = item.product_variants as unknown as {
      label: string;
      price_delta: number;
    } | null;

    if (!product) continue;

    const unitPrice = product.price + (variant?.price_delta ?? 0);

    subtotal += unitPrice * item.quantity;

    lines.push(
      `${item.quantity}× ${product.name}${
        variant ? ` (${variant.label})` : ""
      }`
    );
  }

  let shippingCost = 0;
  let shippingDistanceKm: number | null = null;

  const paymentLabels: Record<OrderPayment, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    mercadopago: "Mercado Pago (QR)",
    tarjeta: "Débito / Crédito",
  };

  if (input.fulfillment === "envio") {
    if (!input.address?.trim()) {
      return {
        error: "invalid_address" as const,
        whatsappUrl: null,
      };
    }

   const shippingResult = input.forceShippingQuote
  ? null
  : await calculateShippingForAddress(
      input.address,
      input.neighborhood ?? "",
      subtotal
    );

if (
  input.forceShippingQuote ||
  !shippingResult ||
  shippingResult.error ||
  shippingResult.cost == null
) {
  const { data: quote, error: quoteError } = await supabaseAdmin
    .rpc("create_shipping_quote_from_cart", {
      p_user_id: auth.user.id,
      p_payment_method: input.paymentMethod,
      p_address: input.address.trim(),
      p_neighborhood: input.neighborhood?.trim() ?? "",
      p_expected_subtotal: subtotal,
    })
    .single();

  if (quoteError || !quote) {
    const databaseMessage = quoteError?.message ?? "";

    if (databaseMessage.includes("empty_cart")) {
      return {
        error: "empty_cart" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("insufficient_stock")) {
      return {
        error: "insufficient_stock" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("cart_changed")) {
      return {
        error: "cart_changed" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("invalid_variant")) {
      return {
        error: "invalid_variant" as const,
        whatsappUrl: null,
      };
    }

    return {
      error: "order_failed" as const,
      whatsappUrl: null,
    };
  }

  const shippingQuote = quote as ShippingQuoteResult;
  const orderId = shippingQuote.order_id;
  const finalSubtotal = Number(shippingQuote.order_subtotal);
  const discount = Number(shippingQuote.order_discount);
  const partialTotal = Number(
    shippingQuote.order_partial_total
  );

  const quoteMessage = [
    "🥑 Pedido con envío a cotizar — Doña Ríos",
    ...lines,
    `Subtotal: $${finalSubtotal.toLocaleString("es-AR")}`,
    ...(discount > 0
      ? [
          `Descuento efectivo (10%): -$${discount.toLocaleString(
            "es-AR"
          )}`,
        ]
      : []),
    `Total parcial: $${partialTotal.toLocaleString("es-AR")}`,
    "Envío: a confirmar",
    `Dirección: ${input.address.trim()}`,
    ...(input.neighborhood?.trim()
      ? [`Barrio: ${input.neighborhood.trim()}`]
      : []),
    `Pago: ${paymentLabels[input.paymentMethod]}`,
    `N° de pedido: ${orderId.slice(0, 8)}`,
    "",
    "El calculador no encontró mi dirección. ¿Me confirman el costo de envío?",
  ].join("\n");

  await supabaseAdmin
    .from("orders")
    .update({ whatsapp_message: quoteMessage })
    .eq("id", orderId);

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(quoteMessage)}`;

  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/pedidos");

  return {
    error: "shipping_quote_created" as const,
    whatsappUrl,
    orderId,
    message: quoteMessage,
    total: partialTotal,
  };
}

shippingCost = shippingResult.cost;
shippingDistanceKm = shippingResult.distanceKm ?? null;
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .rpc("create_order_from_cart", {
      p_user_id: auth.user.id,
      p_fulfillment: input.fulfillment,
      p_payment_method: input.paymentMethod,
      p_address:
        input.fulfillment === "envio"
          ? input.address?.trim() ?? null
          : null,
      p_neighborhood:
        input.fulfillment === "envio"
          ? input.neighborhood?.trim() ?? null
          : null,
      p_pickup_point:
        input.fulfillment === "retiro"
          ? input.pickupPoint ?? null
          : null,
      p_shipping_cost: shippingCost,
      p_shipping_distance_km: shippingDistanceKm,
      p_expected_subtotal: subtotal,
    })
    .single();

  if (orderError || !order) {
    const databaseMessage = orderError?.message ?? "";

    if (databaseMessage.includes("empty_cart")) {
      return {
        error: "empty_cart" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("insufficient_stock")) {
      return {
        error: "insufficient_stock" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("cart_changed")) {
      return {
        error: "cart_changed" as const,
        whatsappUrl: null,
      };
    }

    if (databaseMessage.includes("invalid_variant")) {
      return {
        error: "invalid_variant" as const,
        whatsappUrl: null,
      };
    }

    return {
      error: "order_failed" as const,
      whatsappUrl: null,
    };
  }

  const atomicOrder = order as AtomicOrderResult;

  const orderId = atomicOrder.order_id;
  const finalSubtotal = Number(atomicOrder.order_subtotal);
  const discount = Number(atomicOrder.order_discount);
  const total = Number(atomicOrder.order_total);

  const message = [
    "🥑 Pedido Doña Ríos",
    ...lines,
    `Subtotal: $${finalSubtotal.toLocaleString("es-AR")}`,
    ...(discount > 0
      ? [
          `Descuento efectivo (10%): -$${discount.toLocaleString(
            "es-AR"
          )}`,
        ]
      : []),
    `Envío: $${shippingCost.toLocaleString("es-AR")}`,
    `Total: $${total.toLocaleString("es-AR")}`,
    `Entrega: ${
      input.fulfillment === "envio"
        ? `Envío a ${input.address ?? "domicilio"}`
        : `Retiro en ${input.pickupPoint ?? "punto a coordinar"}`
    }`,
    `Pago: ${paymentLabels[input.paymentMethod]}`,
    `N° de pedido: ${orderId.slice(0, 8)}`,
  ].join("\n");

  await supabaseAdmin
    .from("orders")
    .update({ whatsapp_message: message })
    .eq("id", orderId);

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(message)}`;

  revalidatePath("/");
  revalidatePath("/carrito");
  revalidatePath("/pedidos");

  return {
    error: null,
    whatsappUrl,
    orderId,
    message,
    total,
  };
}

export async function getOrderHistory() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data: orders } = await supabase
    .from("orders")
   .select(
  `id, total, status, fulfillment, payment_method, shipping_cost, shipping_pending, created_at,
   order_items(product_name_snapshot, quantity, unit_price)`
)
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
      `id, total, status, fulfillment, payment_method, address, neighborhood, pickup_point, shipping_cost, shipping_pending, created_at,
 profiles(full_name),
 order_items(product_name_snapshot, quantity, unit_price)`
    )
    .order("created_at", { ascending: false });

  return orders ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  status:
    | "pendiente"
    | "confirmado"
    | "entregado"
    | "cancelado"
) {
  const supabase = await createClient();

  if (!(await requireAdminForOrders(supabase))) {
    return {
      error: "No tenés permisos de administrador.",
    };
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.rpc(
    "update_order_status_with_stock",
    {
      p_order_id: orderId,
      p_new_status: status,
    }
  );

  if (error) {
    const databaseMessage = error.message ?? "";

    if (databaseMessage.includes("order_not_found")) {
      return {
        error: "No encontramos ese pedido.",
      };
    }

    if (databaseMessage.includes("shipping_cost_required")) {
      return {
        error:
          "Primero cargá el costo de envío para confirmar este pedido.",
      };
    }

    if (databaseMessage.includes("insufficient_stock")) {
      return {
        error:
          "No hay stock suficiente para reactivar este pedido.",
      };
    }

    if (databaseMessage.includes("product_unavailable")) {
      return {
        error:
          "Uno de los productos del pedido ya no está disponible.",
      };
    }

    return {
      error: "No se pudo actualizar el estado del pedido.",
    };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  revalidatePath("/pedidos");

  return { error: null };
}
export async function confirmShippingQuoteOrder(
  orderId: string,
  shippingCost: number
) {
  const supabase = await createClient();

  if (!(await requireAdminForOrders(supabase))) {
    return {
      error: "No tenés permisos de administrador.",
      total: null,
    };
  }

  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    return {
      error: "Ingresá un costo de envío válido.",
      total: null,
    };
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .rpc("confirm_shipping_quote_order", {
      p_order_id: orderId,
      p_shipping_cost: shippingCost,
    })
    .single();

  if (error || !data) {
    const databaseMessage = error?.message ?? "";

    if (databaseMessage.includes("insufficient_stock")) {
      return {
        error:
          "No hay stock suficiente para confirmar este pedido.",
        total: null,
      };
    }

    if (databaseMessage.includes("invalid_order_status")) {
      return {
        error:
          "El pedido debe estar pendiente para poder confirmarlo.",
        total: null,
      };
    }

    if (
      databaseMessage.includes("shipping_already_confirmed")
    ) {
      return {
        error: "El envío de este pedido ya fue confirmado.",
        total: null,
      };
    }

    if (databaseMessage.includes("order_not_found")) {
      return {
        error: "No encontramos ese pedido.",
        total: null,
      };
    }

    return {
      error: "No se pudo confirmar el pedido.",
      total: null,
    };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  revalidatePath("/pedidos");

  return {
    error: null,
    total: Number(
      (
        data as {
          confirmed_total: number | string;
        }
      ).confirmed_total
    ),
  };
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
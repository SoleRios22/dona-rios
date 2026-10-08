"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GUEST_COOKIE = "donarios_guest_cart";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// createIfMissing solo debe ser true desde una Server Action.
// Al renderizar páginas podemos leer cookies, pero no crearlas.
async function getCartContext(createIfMissing = false) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    throw new Error("No se pudo verificar la sesión. Intentá nuevamente.");
  }

  if (auth.user) {
    const { data: existing, error } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

   if (error) {
  console.error("Error al consultar carts:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  throw new Error("No se pudo consultar el carrito.");
}

    if (existing || !createIfMissing) {
      return {
        client: supabase,
        cartId: existing?.id ?? null,
        authenticated: true,
      };
    }

    const { data: created, error: createError } = await supabase
      .from("carts")
      .upsert(
        { user_id: auth.user.id },
        { onConflict: "user_id", ignoreDuplicates: true }
      )
      .select("id")
      .maybeSingle();

    if (createError) {
      throw new Error("No se pudo crear el carrito.");
    }

    // Otra solicitud pudo haber creado el carrito al mismo tiempo.
    if (!created) {
      const { data: concurrent, error: concurrentError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", auth.user.id)
        .single();

      if (concurrentError || !concurrent) {
        throw new Error("No se pudo recuperar el carrito.");
      }

      return {
        client: supabase,
        cartId: concurrent.id,
        authenticated: true,
      };
    }

    return {
      client: supabase,
      cartId: created.id,
      authenticated: true,
    };
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(GUEST_COOKIE)?.value;
  const guestToken =
    cookieValue && UUID_PATTERN.test(cookieValue) ? cookieValue : null;

  // Este cliente permanece exclusivamente en el servidor.
  const admin = createAdminClient();

  if (guestToken) {
    const { data: existing, error } = await admin
      .from("carts")
      .select("id")
      .eq("guest_token", guestToken)
      .is("user_id", null)
      .maybeSingle();

    if (error) {
      throw new Error("No se pudo consultar el carrito de invitado.");
    }

    if (existing) {
      return {
        client: admin,
        cartId: existing.id,
        authenticated: false,
      };
    }
  }

  if (!createIfMissing) {
    return {
      client: admin,
      cartId: null,
      authenticated: false,
    };
  }

  // Si la cookie no corresponde a un carrito existente,
  // generamos un identificador nuevo desde el servidor.
  const newToken = randomUUID();

  const { data: created, error } = await admin
    .from("carts")
    .insert({
      user_id: null,
      guest_token: newToken,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("No se pudo crear el carrito de invitado.");
  }

  cookieStore.set(GUEST_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });

  return {
    client: admin,
    cartId: created.id,
    authenticated: false,
  };
}

export async function getCart() {
  const context = await getCartContext();

  if (!context.cartId) {
    return {
      items: [],
      authenticated: context.authenticated,
    };
  }

  const { data: items, error } = await context.client
    .from("cart_items")
    .select(
      `id, quantity, variant_id,
       products(id, slug, name, price, unit, colorway, is_box, image_url),
       product_variants(id, label, price_delta)`
    )
    .eq("cart_id", context.cartId);

  if (error) {
    throw new Error("No se pudieron consultar los productos del carrito.");
  }

  return {
    items: items ?? [],
    authenticated: context.authenticated,
  };
}

export async function addToCart(
  productId: string,
  variantId: string | null,
  quantity: number
) {
  if (
    !UUID_PATTERN.test(productId) ||
    (variantId !== null && !UUID_PATTERN.test(variantId)) ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    return { error: "invalid_input" as const };
  }

  try {
    const context = await getCartContext(true);

    if (!context.cartId) {
      return { error: "cart_failed" as const };
    }

    const { data: product, error: productError } = await context.client
      .from("products")
      .select("id, stock, is_active")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product || !product.is_active) {
      return { error: "product_unavailable" as const };
    }

    if (variantId !== null) {
      const { data: variant, error: variantError } = await context.client
        .from("product_variants")
        .select("id")
        .eq("id", variantId)
        .eq("product_id", productId)
        .maybeSingle();

      if (variantError || !variant) {
        return { error: "invalid_variant" as const };
      }
    }

    const { data: productItems, error: itemsError } = await context.client
      .from("cart_items")
      .select("id, quantity, variant_id")
      .eq("cart_id", context.cartId)
      .eq("product_id", productId);

    if (itemsError) {
      return { error: "cart_failed" as const };
    }

    const items = productItems ?? [];
    const currentQuantity = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (currentQuantity + quantity > product.stock) {
      return { error: "insufficient_stock" as const };
    }

    const existing = items.find(
      (item) => item.variant_id === variantId
    );

    if (existing) {
      const { error } = await context.client
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .eq("cart_id", context.cartId);

      if (error) {
        return { error: "cart_failed" as const };
      }
    } else {
      const { error } = await context.client.from("cart_items").insert({
        cart_id: context.cartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      if (error) {
        return { error: "cart_failed" as const };
      }
    }

    revalidatePath("/carrito");
    revalidatePath("/checkout");

    return { error: null };
  } catch {
    return { error: "cart_failed" as const };
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<void> {
  if (!UUID_PATTERN.test(itemId) || !Number.isSafeInteger(quantity)) {
    throw new Error("La cantidad o el producto no son válidos.");
  }

  if (quantity <= 0) {
    await removeCartItem(itemId);
    return;
  }

  const context = await getCartContext();

  if (!context.cartId) {
    throw new Error("No encontramos tu carrito.");
  }

  const { data: item, error: itemError } = await context.client
    .from("cart_items")
    .select("id, product_id")
    .eq("id", itemId)
    .eq("cart_id", context.cartId)
    .maybeSingle();

  if (itemError || !item) {
    throw new Error("No encontramos ese producto en tu carrito.");
  }

  const { data: product, error: productError } = await context.client
    .from("products")
    .select("stock, is_active")
    .eq("id", item.product_id)
    .maybeSingle();

  if (productError || !product || !product.is_active) {
    throw new Error("El producto ya no está disponible.");
  }

  const { data: otherItems, error: otherItemsError } = await context.client
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", context.cartId)
    .eq("product_id", item.product_id)
    .neq("id", itemId);

  if (otherItemsError) {
    throw new Error("No se pudo verificar la cantidad.");
  }

  const otherQuantity = (otherItems ?? []).reduce(
    (sum, other) => sum + other.quantity,
    0
  );

  if (otherQuantity + quantity > product.stock) {
    throw new Error("No hay stock suficiente para esa cantidad.");
  }

  const { error } = await context.client
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("cart_id", context.cartId);

  if (error) {
    throw new Error("No se pudo actualizar la cantidad.");
  }

  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function removeCartItem(itemId: string): Promise<void> {
  if (!UUID_PATTERN.test(itemId)) {
    throw new Error("El producto no es válido.");
  }

  const context = await getCartContext();

  if (!context.cartId) return;

  const { error } = await context.client
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("cart_id", context.cartId);

  if (error) {
    throw new Error("No se pudo quitar el producto del carrito.");
  }

  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function clearCart(cartId: string): Promise<void> {
  const context = await getCartContext();

  // Nunca aceptamos vaciar un carrito ajeno.
  if (!context.cartId || context.cartId !== cartId) {
    throw new Error("No tenés acceso a ese carrito.");
  }

  const { error } = await context.client
    .from("cart_items")
    .delete()
    .eq("cart_id", context.cartId);

 if (error) {
  console.error("Error al consultar carts:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  throw new Error("No se pudo consultar el carrito.");
}

  revalidatePath("/carrito");
  revalidatePath("/checkout");
}
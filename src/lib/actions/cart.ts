"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Devuelve el carrito del usuario logueado, creándolo si no existe.
async function getOrCreateCartId(userId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !created) throw new Error("No se pudo crear el carrito");
  return created.id;
}

export async function getCart() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { items: [], authenticated: false as const };

  const cartId = await getOrCreateCartId(auth.user.id);

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, variant_id,
       products(id, slug, name, price, unit, colorway, is_box, image_url),
       product_variants(id, label, price_delta)`
    )
    .eq("cart_id", cartId);

  return { items: items ?? [], authenticated: true as const };
}

export async function addToCart(productId: string, variantId: string | null, quantity: number) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "auth_required" as const };

  const cartId = await getOrCreateCartId(auth.user.id);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("variant_id", variantId ?? "")
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
  }

  revalidatePath("/carrito");
  return { error: null };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();
  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }
  revalidatePath("/carrito");
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/carrito");
}

export async function clearCart(cartId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  revalidatePath("/carrito");
}

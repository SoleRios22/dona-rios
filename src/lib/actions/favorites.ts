"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "auth_required" as const, isFavorite: false };

  const { data: existing } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
    revalidatePath("/favoritos");
    return { error: null, isFavorite: false };
  }

  await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/favoritos");
  return { error: null, isFavorite: true };
}

// Devuelve el set de ids de producto que el usuario actual tiene como favoritos.
// Útil para marcar el corazón "lleno" en listados de productos.
export async function getFavoriteProductIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
  return new Set((data ?? []).map((f) => f.product_id));
}

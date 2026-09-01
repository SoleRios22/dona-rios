"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CategoryTag } from "@/types/database";

export interface ProductFormInput {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  origin: string;
  suitableFor: string;
  colorway: string;
  isBox: boolean;
  isActive: boolean;
  stock: number;
  tags: CategoryTag[];
  subcategoryIds: string[];
  variants: { label: string; priceDelta: number; isDefault: boolean }[];
  nutrition: { label: string; value: string }[];
}

// Chequeo de admin del lado del servidor, además de la política RLS
// (RLS es la última barrera, pero acá evitamos hacer consultas innecesarias si no corresponde).
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: "No iniciaste sesión." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { supabase, ok: false as const, error: "No tenés permisos de administrador." };

  return { supabase, ok: true as const, error: null };
}

export async function getAllProductsForAdmin() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return [];

  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, stock, is_active, is_box, product_tags(tag)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProductForEdit(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return null;

  const { data } = await supabase
    .from("products")
    .select(
      `id, slug, name, short_description, description, price, old_price, unit, origin, suitable_for, colorway, is_box, is_active, stock,
       product_tags(tag), product_subcategories(subcategory_id), product_variants(id, label, price_delta, is_default), product_nutrition(label, value, sort_order)`
    )
    .eq("id", id)
    .single();

  return data;
}

export async function createProduct(input: ProductFormInput) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription,
      description: input.description,
      price: input.price,
      old_price: input.oldPrice,
      unit: input.unit,
      origin: input.origin,
      suitable_for: input.suitableFor,
      colorway: input.colorway,
      is_box: input.isBox,
      is_active: input.isActive,
      stock: input.stock,
    })
    .select("id")
    .single();

  if (insertError || !product) {
    return { error: insertError?.message.includes("duplicate") ? "Ya existe un producto con ese slug." : "No se pudo crear el producto." };
  }

  await saveRelations(supabase, product.id, input);
  revalidatePath("/admin");
  return { error: null, id: product.id };
}

export async function updateProduct(id: string, input: ProductFormInput) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      short_description: input.shortDescription,
      description: input.description,
      price: input.price,
      old_price: input.oldPrice,
      unit: input.unit,
      origin: input.origin,
      suitable_for: input.suitableFor,
      colorway: input.colorway,
      is_box: input.isBox,
      is_active: input.isActive,
      stock: input.stock,
    })
    .eq("id", id);

  if (updateError) return { error: "No se pudo actualizar el producto." };

  // Reemplazamos las relaciones enteras (más simple y confiable que hacer diffs)
  await supabase.from("product_tags").delete().eq("product_id", id);
  await supabase.from("product_subcategories").delete().eq("product_id", id);
  await supabase.from("product_variants").delete().eq("product_id", id);
  await supabase.from("product_nutrition").delete().eq("product_id", id);
  await saveRelations(supabase, id, input);

  revalidatePath("/admin");
  revalidatePath(`/producto/${input.slug}`);
  return { error: null, id };
}

async function saveRelations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  input: ProductFormInput
) {
  if (input.tags.length > 0) {
    await supabase.from("product_tags").insert(input.tags.map((tag) => ({ product_id: productId, tag })));
  }
  if (input.subcategoryIds.length > 0) {
    await supabase
      .from("product_subcategories")
      .insert(input.subcategoryIds.map((subcategory_id) => ({ product_id: productId, subcategory_id })));
  }
  if (input.variants.length > 0) {
    await supabase.from("product_variants").insert(
      input.variants.map((v) => ({
        product_id: productId,
        label: v.label,
        price_delta: v.priceDelta,
        is_default: v.isDefault,
      }))
    );
  }
  if (input.nutrition.length > 0) {
    await supabase.from("product_nutrition").insert(
      input.nutrition.map((n, i) => ({
        product_id: productId,
        label: n.label,
        value: n.value,
        sort_order: i,
      }))
    );
  }
}

export async function deleteProduct(id: string) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
  if (deleteError) return { error: "No se pudo eliminar el producto." };

  revalidatePath("/admin");
  return { error: null };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin");
  return { error: null };
}

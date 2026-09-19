"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  imageUrl: string | null;
  isBox: boolean;
  isActive: boolean;
  stock: number;
  tags: CategoryTag[];
  subcategoryIds: string[];
  variants: { id?: string; label: string; priceDelta: number; isDefault: boolean }[];
  nutrition: { label: string; value: string }[];
  boxItems: { productId: string; quantity: number; name?: string }[];
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

// Para el buscador de "armar combo": productos individuales activos (nunca otros combos).
export async function getProductsForBoxPicker() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("is_active", true)
    .eq("is_box", false)
    .order("name");

  return data ?? [];
}

// Para el dashboard: productos activos con poco stock (umbral configurable).
export async function getLowStockProducts(threshold = 5) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("is_active", true)
    .lte("stock", threshold)
    .order("stock", { ascending: true });

  return data ?? [];
}

export async function getProductForEdit(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return null;

  const { data } = await supabase
    .from("products")
    .select(
      `id, slug, name, short_description, description, price, old_price, unit, origin, suitable_for, colorway, image_url, is_box, is_active, stock,
       product_tags(tag), product_subcategories(subcategory_id), product_variants(id, label, price_delta, is_default), product_nutrition(label, value, sort_order)`
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  // Consulta separada (más simple que desambiguar el doble FK de box_items -> products en un solo embed)
  const { data: boxItems } = await supabase
    .from("box_items")
    .select("included_product_id, quantity, products!box_items_included_fkey(name)")
    .eq("box_product_id", id);

  return { ...data, box_items: boxItems ?? [] };
}

export async function createProduct(
  input: ProductFormInput
) {
  const { ok, error } = await requireAdmin();

  if (!ok) {
    return { error };
  }

  const supabaseAdmin = createAdminClient();

  const { data: productId, error: saveError } =
    await supabaseAdmin.rpc(
      "save_product_atomic",
      buildProductRpcInput(null, input)
    );

  if (saveError || !productId) {
    return {
      error: mapProductSaveError(saveError),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/");

  return {
    error: null,
    id: productId as string,
  };
}

export async function updateProduct(
  id: string,
  input: ProductFormInput
) {
  const { ok, error } = await requireAdmin();

  if (!ok) {
    return { error };
  }

  const supabaseAdmin = createAdminClient();

  const { data: productId, error: saveError } =
    await supabaseAdmin.rpc(
      "save_product_atomic",
      buildProductRpcInput(id, input)
    );

  if (saveError || !productId) {
    return {
      error: mapProductSaveError(saveError),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath(`/producto/${input.slug}`);

  return {
    error: null,
    id,
  };
}

function buildProductRpcInput(
  productId: string | null,
  input: ProductFormInput
) {
  return {
    p_product_id: productId,
    p_name: input.name,
    p_slug: input.slug,
    p_short_description: input.shortDescription,
    p_description: input.description,
    p_price: input.price,
    p_old_price: input.oldPrice,
    p_unit: input.unit,
    p_origin: input.origin,
    p_suitable_for: input.suitableFor,
    p_colorway: input.colorway,
    p_image_url: input.imageUrl,
    p_is_box: input.isBox,
    p_is_active: input.isActive,
    p_stock: input.stock,
    p_tags: input.tags,
    p_subcategory_ids: input.subcategoryIds,

    p_variants: input.variants.map((variant) => ({
      id: variant.id ?? null,
      label: variant.label,
      price_delta: variant.priceDelta,
      is_default: variant.isDefault,
    })),

    p_nutrition: input.nutrition.map(
      (nutrition, index) => ({
        label: nutrition.label,
        value: nutrition.value,
        sort_order: index,
      })
    ),

    p_box_items: input.boxItems.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  };
}

function mapProductSaveError(
  error: {
    code?: string;
    message?: string;
  } | null
) {
  const message = error?.message ?? "";

  if (
    error?.code === "23505" ||
    message.includes("duplicate")
  ) {
    return "Ya existe un producto con ese slug o un dato repetido.";
  }

  if (error?.code === "23503") {
    return "No podés eliminar una variante que ya está usada en un carrito o pedido.";
  }

  if (message.includes("invalid_product_values")) {
    return "Revisá el precio y el stock del producto.";
  }

  if (message.includes("product_not_found")) {
    return "No encontramos el producto que querés editar.";
  }

  if (message.includes("invalid_box_item")) {
    return "Revisá los productos y cantidades del box.";
  }

  return "No se pudo guardar el producto.";
}

export async function deleteProduct(id: string) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
  if (deleteError) return { error: "No se pudo eliminar el producto." };

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  return { error: null };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { supabase, ok, error } = await requireAdmin();
  if (!ok) return { error };

  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  return { error: null };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PickupPoint } from "@/types/database";

// Lectura pública — usada tanto en el checkout como en el panel de admin
export async function getPickupPoints(onlyActive = false): Promise<PickupPoint[]> {
  const supabase = await createClient();
  let query = supabase.from("pickup_points").select("id, name, address, is_active, sort_order").order("sort_order");
  if (onlyActive) query = query.eq("is_active", true);

  const { data } = await query;
  return (data ?? []) as PickupPoint[];
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, ok: profile?.role === "admin" };
}

export async function createPickupPoint(name: string, address: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };
  if (!name.trim()) return { error: "El nombre no puede estar vacío." };

  const { data: existing } = await supabase
    .from("pickup_points")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("pickup_points").insert({
    name: name.trim(),
    address: address.trim() || null,
    sort_order: (existing?.sort_order ?? -1) + 1,
  });

  if (error) return { error: "No se pudo crear el punto de retiro." };

  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/checkout");
  return { error: null };
}

export async function updatePickupPoint(id: string, name: string, address: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };
  if (!name.trim()) return { error: "El nombre no puede estar vacío." };

  const { error } = await supabase
    .from("pickup_points")
    .update({ name: name.trim(), address: address.trim() || null })
    .eq("id", id);

  if (error) return { error: "No se pudo actualizar el punto de retiro." };

  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/checkout");
  return { error: null };
}

export async function togglePickupPointActive(id: string, isActive: boolean) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };

  await supabase.from("pickup_points").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/checkout");
  return { error: null };
}

export async function deletePickupPoint(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };

  await supabase.from("pickup_points").delete().eq("id", id);
  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/checkout");
  return { error: null };
}
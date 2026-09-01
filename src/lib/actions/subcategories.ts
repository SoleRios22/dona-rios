"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CategoryTag, Subcategory } from "@/types/database";

// Lectura pública — usada tanto en el filtro de categoría como en el form de admin.
export async function getSubcategories(parentTag?: CategoryTag): Promise<Subcategory[]> {
  const supabase = await createClient();
  let query = supabase.from("subcategories").select("id, name, slug, parent_tag").order("name");
  if (parentTag) query = query.eq("parent_tag", parentTag);

  const { data } = await query;
  return (data ?? []) as Subcategory[];
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function createSubcategory(name: string, parentTag: CategoryTag) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };
  if (!name.trim()) return { error: "El nombre no puede estar vacío." };

  const { error } = await supabase.from("subcategories").insert({
    name: name.trim(),
    slug: slugify(name),
    parent_tag: parentTag,
  });

  if (error) {
    return { error: error.message.includes("duplicate") ? "Ya existe una subcategoría con ese nombre en esta categoría." : "No se pudo crear la subcategoría." };
  }

  revalidatePath("/admin/subcategorias");
  return { error: null };
}

export async function deleteSubcategory(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };

  await supabase.from("subcategories").delete().eq("id", id);
  revalidatePath("/admin/subcategorias");
  return { error: null };
}

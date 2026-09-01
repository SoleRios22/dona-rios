"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(name: string, email: string, message: string) {
  if (!name.trim() || !email.trim() || !message.trim()) {
    return { error: "Completá todos los campos." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ingresá un email válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  });

  if (error) return { error: "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp." };

  revalidatePath("/admin/mensajes");
  return { error: null };
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

export async function getContactMessages() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return [];

  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function toggleMessageResolved(id: string, resolved: boolean) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };

  await supabase.from("contact_messages").update({ resolved }).eq("id", id);
  revalidatePath("/admin/mensajes");
  return { error: null };
}

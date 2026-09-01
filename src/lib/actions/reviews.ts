"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(productSlug: string, productId: string, rating: number, comment: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { error: "Tenés que iniciar sesión para dejar una valoración." };
  }
  if (rating < 1 || rating > 5) {
    return { error: "Elegí un puntaje de 1 a 5 estrellas." };
  }
  if (!comment.trim()) {
    return { error: "Contanos brevemente tu experiencia." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: auth.user.id,
      rating,
      comment: comment.trim(),
    },
    { onConflict: "product_id,user_id" }
  );

  if (error) return { error: "No pudimos guardar tu reseña. Probá de nuevo." };

  revalidatePath(`/producto/${productSlug}`);
  return { error: null };
}

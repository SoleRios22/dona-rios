import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Se ejecuta cuando Google/Facebook redirige de vuelta después del login.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falló, mandamos al login con un aviso.
  return NextResponse.redirect(`${origin}/login?error=No pudimos iniciar sesión`);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GUEST_COOKIE = "donarios_guest_cart";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";

  // Solo permite volver a una dirección interna del sitio.
  let destination = new URL("/", origin);

  if (requestedNext.startsWith("/")) {
    try {
      const candidate = new URL(requestedNext, origin);

      if (candidate.origin === origin) {
        destination = candidate;
      }
    } catch {
      // Si la dirección no es válida, vuelve al inicio.
    }
  }

  function loginError(message: string) {
    const url = new URL("/login", origin);

    url.searchParams.set("error", message);
    url.searchParams.set(
      "next",
      `${destination.pathname}${destination.search}`
    );

    return NextResponse.redirect(url);
  }

  if (!code) {
    return loginError("No pudimos iniciar sesión. Intentá nuevamente.");
  }

  const supabase = await createClient();

  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return loginError("No pudimos iniciar sesión. Intentá nuevamente.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();

    return loginError("No pudimos verificar tu cuenta. Intentá nuevamente.");
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value;

  if (guestToken && UUID_PATTERN.test(guestToken)) {
    try {
      const admin = createAdminClient();

      const { error: mergeError } = await admin.rpc(
        "merge_guest_cart_into_user",
        {
          p_guest_token: guestToken,
          p_user_id: user.id,
        }
      );

      if (mergeError) {
        console.error("Error al transferir el carrito:", {
          code: mergeError.code,
          message: mergeError.message,
        });

        await supabase.auth.signOut();

        return loginError(
          "No pudimos transferir tu carrito. Tus productos siguen guardados como invitado. Intentá ingresar nuevamente."
        );
      }

      cookieStore.delete(GUEST_COOKIE);
    } catch {
      await supabase.auth.signOut();

      return loginError(
        "No pudimos transferir tu carrito. Tus productos siguen guardados como invitado. Intentá ingresar nuevamente."
      );
    }
  } else if (guestToken) {
    cookieStore.delete(GUEST_COOKIE);
  }

  return NextResponse.redirect(destination);
}
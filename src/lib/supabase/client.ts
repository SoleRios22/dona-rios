import { createBrowserClient } from "@supabase/ssr";

// Nota: no usamos el genérico <Database> acá porque nuestro esquema tipado a mano
// no tiene el formato exacto que necesita supabase-js para inferir joins (.select con
// relaciones). El tipado real de los datos se hace a mano en src/lib/data y src/lib/actions.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

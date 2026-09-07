import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con Service Role Key: ignora RLS por completo.
// Usar SOLO en código de servidor (Server Actions), nunca en un componente cliente.
// Lo necesitamos para leer shipping_settings (precio de nafta, margen de ganancia)
// sin tener que darle permiso de lectura pública a esa tabla vía RLS.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
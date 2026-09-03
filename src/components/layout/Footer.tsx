import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import Logo from "@/components/Logo";

const WHATSAPP_NUMBER = "5493584315332";
const INSTAGRAM_HANDLE = "donarios_almacensaludable";
const FACEBOOK_URL = "https://www.facebook.com/donariosalmacensaludable"; // ajustá esta URL cuando tengas la página de Facebook creada

export default async function Footer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <footer className="mt-20 bg-forest px-6 py-14 text-cream md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* Marca */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Logo size={34} />
              <span className="font-display text-lg font-semibold">Doña Ríos</span>
            </div>
            <p className="mb-5 max-w-xs text-sm text-[#B7C0A6]">
              Selección de productos keto, low carb y sin gluten en Río Cuarto. No vendemos de todo. Elegimos lo mejor.
            </p>
            <div className="flex gap-3">
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Doña Ríos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Doña Ríos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Doña Ríos"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-6.5-3L3 20l1-3.5A8.38 8.38 0 013 12a8.5 8.5 0 018.5-8.5A8.38 8.38 0 0121 11.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#D8DFC8]">Contacto</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#C7D1B4]">
               <li>
              <Link href="/sobre-nosotros"  className="hover:text-cream">
                Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-cream">
                  Formulario de contacto
                </Link>
              </li>
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  WhatsApp: 358 431-5332
                </a>
              </li>
              <li>
                <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  @{INSTAGRAM_HANDLE}
                </a>
              </li>
              <li>Río Cuarto, Córdoba</li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#D8DFC8]">Tu cuenta</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#C7D1B4]">
              {user ? (
                <>
                  <li>
                    <Link href="/pedidos" className="hover:text-cream">
                      Mis pedidos
                    </Link>
                  </li>
                  <li>
                    <form action={signOut}>
                      <button type="submit" className="text-left hover:text-cream">
                        Cerrar sesión
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/login" className="hover:text-cream">
                    Ingresar
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

       <div className="flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-[#93A084] md:flex-row">
  <span>© {new Date().getFullYear()} Doña Ríos — Almacén Saludable</span>
  <span>No vendemos de todo. Elegimos lo mejor.</span>
  <Link href="/privacidad" className="hover:text-cream">
    Política de privacidad
  </Link>
  <Link href="/terminos" className="hover:text-cream">
  Términos y condiciones
</Link>
</div>
        
      </div>
    </footer>
  );
}

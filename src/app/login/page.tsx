import Link from "next/link";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <svg width="44" height="44" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="20" fill="#FBF6EA" stroke="#5C7A3F" strokeWidth="2" />
          <ellipse cx="21" cy="20" rx="11" ry="13" fill="#5C7A3F" />
          <ellipse cx="21" cy="20" rx="7.5" ry="9.5" fill="#A9C17A" />
          <circle cx="21" cy="21" r="4.5" fill="#8B4A2B" />
        </svg>
      </Link>

      <h1 className="text-3xl">Bienvenido a Doña Ríos</h1>
      <p className="mt-3 mb-8 max-w-xs text-[15px] text-forest/70">
        Iniciá sesión para guardar tu carrito, ver tu historial de pedidos y dejar tus valoraciones.
      </p>

      {error && (
        <p className="mb-6 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{decodeURIComponent(error)}</p>
      )}

      <div className="w-full">
        <SocialLoginButtons redirectTo={next ?? "/"} />
      </div>

      <p className="mt-8 max-w-xs text-xs text-forest/50">
        Al continuar, aceptás que usemos tu nombre y email para gestionar tu cuenta y tus pedidos.
      </p>
    </div>
  );
}

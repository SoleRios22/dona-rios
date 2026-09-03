import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-2xl">No tenés acceso acá</h1>
        <p className="text-sm text-forest/70">
          Esta sección es solo para el administrador de Doña Ríos. Si creés que es un error, contactanos.
        </p>
        <Link href="/" className="mt-6 rounded-full bg-avocado px-6 py-3 font-semibold text-cream">
          Volver a la tienda
        </Link>
      </div>
    );
  }

 const navLinks = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/subcategorias", label: "Subcategorías" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/productos/nuevo", label: "+ Nuevo producto" },
];

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-6 md:flex md:gap-10 md:py-8 md:px-8">
      {/* Nav mobile: tira horizontal scrolleable, solo visible debajo de md */}
      <nav className="mb-5 -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Nav desktop: sidebar fijo */}
      <aside className="hidden w-52 shrink-0 md:block">
        <div className="sticky top-24 flex flex-col gap-1">
          <div className="mb-5 flex items-center gap-2.5 px-2">
            <Logo size={30} />
            <div className="text-xs font-semibold uppercase tracking-wide text-avocado-dark">Panel admin</div>
          </div>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-cream-2">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="mt-4 rounded-xl px-3 py-2.5 text-sm text-forest/60 hover:bg-cream-2">
            ← Volver a la tienda
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

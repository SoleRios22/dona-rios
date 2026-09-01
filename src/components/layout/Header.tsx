import Link from "next/link";
import Logo from "@/components/Logo";
import UserMenu from "@/components/layout/UserMenu";
import MobileMenu from "@/components/layout/MobileMenu";
import { getCart } from "@/lib/actions/cart";
import { getFavoriteProductIds } from "@/lib/actions/favorites";

const links = [
  { href: "/categoria/keto", label: "Keto" },
  { href: "/categoria/low-carb", label: "Low carb" },
  { href: "/categoria/sin-gluten", label: "Sin gluten" },
  { href: "/categoria/seleccion", label: "Selección Doña Ríos" },
];

export default async function Header() {
  const [cart, favoriteIds] = await Promise.all([getCart(), getFavoriteProductIds()]);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="font-display text-base font-semibold sm:text-lg">Doña Ríos</div>
            <div className="hidden text-[11px] font-medium uppercase tracking-wider text-avocado-dark sm:block">
              Almacén Saludable
            </div>
          </div>
        </Link>

        <nav className="hidden gap-8 text-[15px] font-medium md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-avocado-dark">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <Link href="/favoritos" className="relative p-1 sm:p-1.5" aria-label="Ver favoritos">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2B3620" strokeWidth="1.8">
              <path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z" />
            </svg>
            {favoriteIds.size > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-honey text-[10px] font-bold text-forest">
                {favoriteIds.size}
              </span>
            )}
          </Link>
          <Link href="/carrito" className="relative p-1 sm:p-1.5" aria-label="Ver carrito">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2B3620" strokeWidth="1.8">
              <path d="M3 4h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
              <circle cx="10" cy="21" r="1.4" fill="#2B3620" />
              <circle cx="17" cy="21" r="1.4" fill="#2B3620" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-honey text-[10px] font-bold text-forest">
                {itemCount}
              </span>
            )}
          </Link>
          <UserMenu />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

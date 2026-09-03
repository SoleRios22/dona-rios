import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-forest/60">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-x-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-avocado-dark">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-forest">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-forest/30">/</span>}
        </span>
      ))}
    </div>
  );
}
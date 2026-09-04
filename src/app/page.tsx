import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { getFavoriteProductIds } from "@/lib/actions/favorites";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS, type CategoryTag } from "@/types/database";
import ConstructionBadge from "@/components/ConstructionBadge";

const CATEGORY_STRIP: CategoryTag[] = ["keto", "low-carb", "sin-gluten", "sin-azucar", "seleccion"];

export default async function HomePage() {
  const [allProducts, favoriteIds] = await Promise.all([getProducts(), getFavoriteProductIds()]);
  const featured = allProducts.filter((p) => !p.is_box).slice(0, 4);
  const boxes = allProducts.filter((p) => p.is_box).slice(0, 4);

  return (
    <div>
      {/* HERO */}
       <ConstructionBadge />
      <section className="px-6 pt-14 pb-6 md:px-8 md:pt-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
              <span className="h-0.5 w-4 rounded bg-honey" /> No vendemos de todo. Elegimos lo mejor.
            </p>
            <h1 className="mb-5 max-w-xl text-4xl leading-tight md:text-[52px]">
              Selección <em className="text-avocado not-italic italic">keto, low carb</em> y sin gluten.
            </h1>
            <p className="mb-8 max-w-md text-[17px] text-forest/70">
              Buscamos, probamos y seleccionamos productos que realmente valen la pena — para que no tengas
              que leer 15 etiquetas para saber si te sirve.
            </p>
            <div className="mb-8 flex flex-wrap gap-3.5">
              <Link
                href="/categoria/seleccion"
                className="rounded-full bg-avocado px-6 py-3.5 font-semibold text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5"
              >
                Ver selección
              </Link>
             <Link
  href="/guias"
  className="rounded-full border-2 border-forest px-6 py-3.5 font-semibold text-forest transition hover:-translate-y-0.5"
>
  Cómo elegimos
</Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest/60">
              <div><strong className="text-forest">1900+</strong> ya son parte de nuestra comunidad</div>
              <div><strong className="text-forest">Productos</strong> seleccionados</div>
              <div><strong className="text-forest">Envío</strong> o retiro</div>
            </div>
          </div>

          <div className="relative hidden h-[420px] md:block">
            <div className="absolute left-16 top-6 h-[280px] w-[280px] rounded-[60%_40%_55%_45%/45%_55%_40%_60%] bg-avocado" />
            <div className="absolute left-24 top-16 h-[196px] w-[196px] rounded-[60%_40%_55%_45%/45%_55%_40%_60%] bg-leaf-light" />
            <div className="absolute left-40 top-32 h-20 w-20 rounded-full bg-clay" />

            {/* Frasco grande */}
            <div className="absolute bottom-2 right-14 w-[110px] drop-shadow-lg">
              <svg viewBox="0 0 100 130" width="100%">
                <rect x="12" y="10" width="76" height="14" rx="4" fill="#3E5429" />
                <path
                  d="M20 24 h60 v86 a10 10 0 01-10 10 h-40 a10 10 0 01-10-10 z"
                  fill="#F6EFDD"
                  stroke="#D9CEA9"
                  strokeWidth="1.5"
                />
                <rect x="24" y="58" width="52" height="34" rx="3" fill="#5C7A3F" />
                <circle cx="50" cy="75" r="10" fill="#FBF6EA" />
              </svg>
            </div>

            {/* Frasco chico */}
            <div className="absolute right-0 top-10 w-[76px] drop-shadow-lg">
              <svg viewBox="0 0 100 130" width="100%">
                <rect x="16" y="8" width="68" height="12" rx="4" fill="#A87A28" />
                <path d="M22 20 h56 v92 a8 8 0 01-8 8 h-40 a8 8 0 01-8-8z" fill="#8B4A2B" />
                <rect x="26" y="52" width="48" height="30" rx="3" fill="#F6EFDD" />
              </svg>
            </div>

            <div className="absolute right-12 top-1 flex h-[100px] w-[100px] rotate-6 items-center justify-center rounded-full border-2 border-dashed border-honey-dark bg-white text-center font-display text-[13px] font-semibold text-forest shadow-lg">
              Elegido por
              <br />
              nosotros
            </div>
            <div className="absolute bottom-16 left-2 flex h-[92px] w-[92px] -rotate-6 items-center justify-center rounded-full bg-honey text-center font-display text-[13px] font-semibold text-forest shadow-lg">
              100%
              <br />
              seleccionado
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="mx-auto max-w-[1180px] px-6 pt-10 md:px-8">
        <div className="flex flex-wrap justify-between gap-4">
          {CATEGORY_STRIP.map((tag) => (
            <Link key={tag} href={`/categoria/${tag}`} className="flex w-[130px] flex-col items-center gap-3 text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-line bg-white text-2xl transition hover:-translate-y-1 hover:border-avocado">
                {CATEGORY_LABELS[tag].emoji}
              </div>
              <span className="text-sm font-semibold">{CATEGORY_LABELS[tag].label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
              <span className="h-0.5 w-4 rounded bg-honey" /> ⭐ Selección Doña Ríos
            </p>
            <h2 className="text-[30px]">Lo que nosotros elegiríamos</h2>
          </div>
          <Link href="/categoria/seleccion" className="border-b-2 border-honey pb-0.5 text-sm font-semibold">
            Ver todo el catálogo →
          </Link>
        </div>

        {featured.length === 0 ? (
          <EmptyCatalogNotice />
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} />
            ))}
          </div>
        )}
      </section>

      {/* BOXES */}
      <section className="mx-auto max-w-[1180px] px-6 py-6 md:px-8">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> ¿No sabés por dónde arrancar?
          </p>
          <h2 className="text-[30px]">Armamos el combo por vos</h2>
        </div>
        {boxes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-forest/60">
            Todavía no armamos ningún box. ¡Pronto vas a poder combinar varios productos con un solo click!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {boxes.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} />
            ))}
          </div>
        )}
      </section>

      {/* QUOTE BAND */}
      <section id="historia" className="mt-10 bg-avocado-dark px-6 py-20 text-center text-cream">
        <p className="font-script mx-auto max-w-xl text-[38px] leading-tight text-[#F0E9D2] md:text-[44px]">
          &quot;Un paso a la vez,
          <br />
          se llega a la cima.&quot;
        </p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#C7D1B4]">
          — Así arrancamos, y así seguimos
        </p>
      </section>

       {/* TRUST */}
      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> Cómo funciona
          </p>
          <h2 className="text-[30px]">Somos 100% online, y eso es una ventaja</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <TrustCard
            icon="truck"
            title="Envío o retiro"
            text="Elegís cómo recibir tu pedido: envío a domicilio en Río Cuarto o retiro coordinado por punto de encuentro."
          />
          <TrustCard
            icon="card"
            title="Todos los medios de pago"
            text="Efectivo, transferencia, débito, crédito y Mercado Pago con QR."
          />
          <TrustCard
            icon="chat"
            title="Dudas por WhatsApp"
            text="¿No sabés si un producto te sirve? Preguntanos directo, sin vueltas."
          />
        </div>
      </section>

      {/* APRENDÉ A ELEGIR */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-8">
        <div className="grid overflow-hidden rounded-[28px] border border-line bg-white md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center bg-gradient-to-br from-honey to-clay-light p-10">
            <svg width="140" height="140" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" fill="#FBF6EA" opacity="0.9" />
              <path d="M50 60c0-16 12-30 30-30s30 14 30 30-12 40-30 40-30-24-30-40z" fill="#5C7A3F" />
              <circle cx="80" cy="76" r="15" fill="#8B4A2B" />
            </svg>
          </div>
          <div className="p-8 md:p-12">
            <p className="mb-3.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
              <span className="h-0.5 w-4 rounded bg-honey" /> Aprendé a elegir
            </p>
            <h2 className="mb-3.5 text-[30px] leading-tight">¿Keto y low carb son lo mismo? Te lo explicamos simple.</h2>
            <p className="mb-6 max-w-md text-[15px] text-forest/60">
              Cada producto de nuestra selección viene con la info que necesitás para decidir — sin tecnicismos, sin
              promesas de salud, solo los datos de la etiqueta explicados claro.
            </p>
            <Link
  href="/guias"
  className="inline-block rounded-full bg-avocado px-6 py-3.5 font-semibold text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5"
>
  Ver guías
</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const TRUST_ICONS = {
  truck: "M3 12l2-7h14l2 7M5 12v7a1 1 0 001 1h2a1 1 0 001-1v-3h6v3a1 1 0 001 1h2a1 1 0 001-1v-7M5 12h14",
  card: "M2 6h20v14H2zM2 10h20",
  chat: "M21 11.5a8.38 8.38 0 01-9 8.5 8.5 8.5 0 01-6.5-3L3 20l1-3.5A8.38 8.38 0 013 12a8.5 8.5 0 018.5-8.5A8.38 8.38 0 0121 11.5z",
} as const;
 
function TrustCard({
  icon,
  title,
  text,
}: {
  icon: keyof typeof TRUST_ICONS;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] bg-cream-2 p-7">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-avocado">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d={TRUST_ICONS[icon]} />
        </svg>
      </div>
      <h3 className="mb-1.5 text-lg">{title}</h3>
      <p className="text-sm text-forest/60">{text}</p>
    </div>
  );
}

function EmptyCatalogNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-forest/60">
      Todavía no hay productos cargados. Si sos el admin,{" "}
      <Link href="/admin/productos/nuevo" className="font-semibold text-avocado-dark underline">
        cargá el primero acá
      </Link>
      .
    </div>
  );
}
import Link from "next/link";
import type { Metadata } from "next";
import ProductVisual from "@/components/ProductVisual";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Doña Ríos es una tienda curadora, no una fábrica: seleccionamos productos keto, low carb y sin gluten en Río Cuarto, Córdoba.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default function AboutPage() {
  return (
    <div>
      <div className="mx-auto max-w-[1180px] px-6 pt-6 md:px-8">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Sobre nosotros" }]} />
      </div>

      {/* HERO */}
      <section className="px-6 pt-6 pb-6 md:px-8 md:pt-10">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> Nuestra historia
          </p>
          <h1 className="mb-6 text-4xl leading-tight md:text-5xl">
            No fabricamos nada. <em className="not-italic text-avocado">Elegimos todo.</em>
          </h1>
          <p className="mx-auto max-w-lg text-[17px] text-forest/70">
            Doña Ríos nació en Río Cuarto como una <strong>tienda online de productos seleccionados</strong>, con una idea simple: ofrecer alternativas de alimentación saludable que realmente respondan a distintas necesidades, sin llenar el catálogo de productos porque sí.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-[720px] px-6 py-10 md:px-8">
        <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-forest/75">
          <p>
           Con el tiempo, entendimos que muchas personas no necesitan simplemente encontrar más opciones, sino <strong>encontrar opciones que puedan elegir con confianza</strong>. Personas que buscan productos keto, bajos en carbohidratos, sin gluten o sin azúcares agregados y que muchas veces tienen que dedicar tiempo a leer y comparar etiquetas para saber si un producto es adecuado para ellas.
          </p>
          <p>
            Por eso, en Doña Ríos <strong>elegimos antes de ofrecer</strong>. Analizamos la información de cada producto, revisamos su composición nutricional y sus ingredientes y evaluamos si cumple con los criterios que definimos para formar parte de nuestro catálogo.
          </p>
          <p>
            No fabricamos productos ni tenemos una marca propia. <strong>Trabajamos con productos elaborados por terceros, priorizando productores y marcas que compartan nuestros criterios de selección.</strong>
          </p>
          <p>Nuestro trabajo es hacer esa búsqueda y selección por vos, para que encuentres en un solo lugar <strong>productos elegidos con criterio y una propuesta pensada para tus necesidades</strong>.
          </p>
          <p style={{ textAlign: 'center' }}>
            <strong>No elegimos por tener más. Elegimos para ofrecer mejor.</strong>
          </p>
        </div>
      </section>

      {/* QUOTE */}
      <section className="mt-6 bg-avocado-dark px-6 py-20 text-center text-cream">
        <p className="font-script mx-auto max-w-xl text-[38px] leading-tight text-[#F0E9D2] md:text-[44px]">
          &quot;Un paso a la vez,
          <br />
          se llega a la cima.&quot;
        </p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#C7D1B4]">
          — Así arrancamos, y así seguimos
        </p>
      </section>

      {/* CÓMO ELEGIMOS */}
      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
            <span className="h-0.5 w-4 rounded bg-honey" /> Nuestros criterios
          </p>
          <h2 className="text-[32px]">No elegimos por tener más. Elegimos con criterio.</h2>
          <h3>Cada producto que llega a Doña Ríos tiene que tener una razón para estar ahí. Revisamos su composición, sus ingredientes y la información nutricional para construir una selección pensada para personas que buscan alternativas keto, low carb, sin gluten o sin azúcares agregados.</h3>
          <h2>Y lo más importante:<strong> no fabricamos los productos. Elegimos qué ofrecer.</strong></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="leaf" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">🏷️Miramos la etiqueta, no el packaging</h3>
            <p className="text-sm text-forest/60">
              Nos fijamos en lo que realmente importa: <strong>ingredientes, carbohidratos, azúcares, fibra y composición nutricional</strong>. La apariencia puede llamar la atención, pero la etiqueta es la que decide.
            </p>
          </div>
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="clay" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">🔎Seleccionamos antes de ofrecer</h3>
            <p className="text-sm text-forest/60">
              No incorporamos un producto simplemente porque está de moda. Evaluamos si cumple con los criterios de Doña Ríos y si tiene sentido dentro de nuestra propuesta.
            </p>
          </div>
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="honey" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">🌱Buscamos buenas opciones</h3>
            <p className="text-sm text-forest/60">
              Trabajamos con distintas marcas y elaboradores, dando especial valor a <strong>productores locales y regionales </strong>cuando encontramos productos que cumplen con nuestros criterios.
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link href="/guias" className="text-sm font-semibold text-avocado-dark underline">
           <strong>Conocé nuestros criterios de selección →</strong>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-8">
        <div className="rounded-[28px] bg-cream-2 px-8 py-14 text-center md:px-14">
          <h2 className="mb-3 text-3xl">¿Tenés dudas sobre qué elegir?</h2>
          <p className="mx-auto mb-7 max-w-md text-[15px] text-forest/60">
            En Instagram compartimos información, recetas, novedades y explicamos qué mirar en las etiquetas para que puedas elegir con más claridad.
          </p>
          <p className="mx-auto mb-7 max-w-md text-[15px] text-forest/60">Seguinos en <strong>Instagram </strong>y descubrí nuevas opciones.</p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/"
              className="rounded-full bg-avocado px-6 py-3.5 font-semibold text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5"
            >
              Ver productos
            </Link>
            <a
              href="https://instagram.com/donarios_almacensaludable"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-forest px-6 py-3.5 font-semibold text-forest transition hover:-translate-y-0.5"
            >
              Seguinos en Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
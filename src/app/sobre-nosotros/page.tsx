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
            Doña Ríos nació en Río Cuarto como un almacén de barrio, y hoy es una tienda 100% online curada por
            personas, no por un algoritmo de catálogo.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-[720px] px-6 py-10 md:px-8">
        <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-forest/75">
          <p>
            Empezamos como un almacén de productos naturales en Río Cuarto, de esos donde la dueña conoce a cada
            cliente por su nombre. Con el tiempo, notamos que la pregunta que más se repetía no era &quot;¿qué
            tenés?&quot;, sino &quot;¿esto me sirve a mí?&quot; — de gente buscando opciones keto, bajas en
            carbohidratos, sin gluten o sin azúcares agregadas, cansada de leer 15 etiquetas para descubrir que
            ninguna le servía.
          </p>
          <p>
            Ahí decidimos achicar el catálogo en vez de agrandarlo. En lugar de tener un poco de todo,
            empezamos a elegir con criterio: cada producto que entra a Doña Ríos pasa antes por nuestras manos,
            lo probamos, miramos su etiqueta nutricional en detalle, y recién ahí decidimos si lo sumamos.
          </p>
          <p>
            No somos una fábrica ni una marca propia — somos curadores. Los productos que vendemos los elaboran
            otros (productores locales, en su mayoría), y nuestro trabajo es hacer la selección para que vos no
            tengas que hacerla sola.
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
          <h2 className="text-[32px]">Cómo decidimos qué entra a la selección</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="leaf" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">Miramos la etiqueta, no el packaging</h3>
            <p className="text-sm text-forest/60">
              Gramos de carbohidratos, azúcares y fibra por porción — antes que las palabras de marketing.
            </p>
          </div>
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="clay" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">Lo probamos antes de venderlo</h3>
            <p className="text-sm text-forest/60">
              Si no lo compraríamos para nuestra propia mesa, no entra a la tienda.
            </p>
          </div>
          <div className="rounded-[20px] bg-cream-2 p-7">
            <div className="mb-4 h-11 w-11 overflow-hidden rounded-xl">
              <ProductVisual colorway="honey" size={26} />
            </div>
            <h3 className="mb-1.5 text-lg">Priorizamos lo local</h3>
            <p className="text-sm text-forest/60">
              La mayoría de nuestros productos vienen de elaboradores de Río Cuarto y la región.
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link href="/guias" className="text-sm font-semibold text-avocado-dark underline">
            Leé más sobre cómo elegimos en nuestras guías →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-8">
        <div className="rounded-[28px] bg-cream-2 px-8 py-14 text-center md:px-14">
          <h2 className="mb-3 text-3xl">¿Nos conocés de Instagram?</h2>
          <p className="mx-auto mb-7 max-w-md text-[15px] text-forest/60">
            Ahí compartimos recetas, novedades y respondemos dudas todos los días. Acá en la web armamos el
            catálogo completo, para cuando ya sabés lo que buscás.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/"
              className="rounded-full bg-avocado px-6 py-3.5 font-semibold text-cream shadow-[0_6px_0_var(--color-avocado-dark)] transition hover:-translate-y-0.5"
            >
              Ver selección
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
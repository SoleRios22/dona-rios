import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";

interface Guide {
  emoji: string;
  title: string;
  question: string; // formulada como pregunta, para el schema FAQPage
  body: string;
}

export const metadata: Metadata = {
  title: "Guías: cómo elegir keto, low carb y sin gluten",
  description:
    "Diferencias entre keto y low carb, azúcar agregada, grasas, gluten e índice glucémico explicados simple — los criterios que usamos para elegir qué vender.",
  alternates: { canonical: "/guias" },
};

const GUIDES: Guide[] = [
  {
    emoji: "🥑",
    title: "¿Keto y low carb son lo mismo?",
    question: "¿Keto y low carb son lo mismo?",
    body: "No exactamente. Low carb es un paraguas amplio: cualquier forma de comer con menos carbohidratos que el promedio. Keto es un caso particular y bastante más estricto, pensado para que el cuerpo entre en cetosis — un estado metabólico donde usa grasa como combustible principal en vez de glucosa. Todo lo keto es low carb, pero no todo lo low carb es keto. Si un producto dice \"keto\" tiene que cumplir proporciones bastante específicas de grasas, proteínas y carbohidratos; si dice \"low carb\", el margen es más amplio.",
  },
  {
    emoji: "🏷️",
    title: "Por qué miramos la etiqueta y no el marketing",
    question: "¿Por qué hay que mirar la etiqueta nutricional y no solo el packaging?",
    body: "\"Sin azúcar\", \"light\", \"natural\" son palabras que no tienen una definición legal estricta en todos los casos, y a veces se usan más para vender que para informar. Lo que sí es objetivo es la tabla nutricional: gramos de carbohidratos, de azúcares, de fibra, por porción. Por eso cuando elegimos un producto para la tienda, miramos esos números antes que el packaging — y por eso te los mostramos en la ficha de cada producto.",
  },
  {
    emoji: "🍬",
    title: "Azúcar agregada vs. azúcar natural",
    question: "¿Cuál es la diferencia entre azúcar agregada y azúcar natural?",
    body: "No es lo mismo el azúcar que ya trae una fruta entera que el azúcar que se agrega durante la fabricación de un producto procesado. La fruta entera viene con fibra, agua y otros nutrientes que hacen que el cuerpo la procese distinto. Cuando en un producto ves \"sin azúcares agregadas\", significa que no le sumaron azúcar extra en la elaboración — pero igual puede tener los azúcares propios de sus ingredientes naturales (como la fruta de una mermelada). Por eso preferimos aclarar bien qué significa cada etiqueta, en vez de dejar que la palabra \"sin azúcar\" haga todo el trabajo.",
  },
  {
    emoji: "🫒",
    title: "Grasas: no todas son iguales",
    question: "¿Todas las grasas son iguales en una alimentación low carb?",
    body: "Durante años a las grasas en general se las trató como el enemigo, pero hoy se distingue mucho más entre tipos. Las grasas de aceite de oliva, palta, frutos secos y pescados grasos son las que más se buscan en una alimentación baja en carbohidratos. Las grasas trans (presentes en muchos ultraprocesados) son las que conviene evitar siempre, sea cual sea tu forma de comer. Cuando seleccionamos productos, priorizamos los que usan grasas de la primera categoría.",
  },
  {
    emoji: "🌾",
    title: "Sin gluten no es sinónimo de saludable",
    question: "¿Un producto sin gluten es automáticamente más saludable?",
    body: "Un producto sin gluten puede tener exactamente los mismos (o más) carbohidratos y azúcares que su versión con gluten — simplemente reemplazaron la harina de trigo por otra. Sin gluten es información sobre un ingrediente puntual, no un sello general de \"más sano\". Por eso en la tienda separamos las etiquetas: un producto puede ser sin gluten y no ser low carb, o ser las dos cosas a la vez.",
  },
  {
    emoji: "📉",
    title: "Índice glucémico, en criollo",
    question: "¿Qué es el índice glucémico?",
    body: "Es una forma de medir qué tan rápido un alimento eleva el azúcar en sangre. Los alimentos de índice glucémico alto (pan blanco, azúcar de mesa, papa hervida) generan picos rápidos; los de índice bajo (legumbres, la mayoría de las verduras, frutos secos) lo hacen de forma más gradual. No es el único factor que importa a la hora de elegir qué comer, pero es un dato útil para entender por qué ciertos productos se recomiendan más que otros dentro de una alimentación low carb.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GUIDES.map((g) => ({
    "@type": "Question",
    name: g.question,
    acceptedAnswer: { "@type": "Answer", text: g.body },
  })),
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-[880px] px-6 py-12 md:px-8">
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guias` },
          ],
        }}
      />
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
        <span className="h-0.5 w-4 rounded bg-honey" /> Aprendé a elegir
      </p>
      <h1 className="mb-4 text-4xl">Guías simples, sin tecnicismos</h1>
      <p className="mb-12 max-w-xl text-[16px] text-forest/60">
        No somos nutricionistas ni médicos — esto no reemplaza una consulta profesional. Es la explicación llana
        de los conceptos que usamos todos los días para decidir qué entra a la selección de Doña Ríos.
      </p>

      <div className="flex flex-col gap-5">
        {GUIDES.map((g) => (
          <div key={g.title} className="rounded-[20px] border border-line bg-white p-7">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">{g.emoji}</span>
              <h2 className="text-xl">{g.title}</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-forest/70">{g.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-cream-2 p-7 text-center">
        <p className="mb-4 text-sm text-forest/70">¿Tenés una duda puntual sobre algún producto?</p>
        <Link
          href="https://wa.me/5493584315332"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-avocado px-6 py-3 font-semibold text-cream"
        >
          Preguntanos por WhatsApp
        </Link>
      </div>
    </div>
  );
}

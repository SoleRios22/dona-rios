import type { Metadata } from "next";

import { BUSINESS } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso y compra en Doña Ríos.",
  alternates: { canonical: "/terminos" },
  robots: { index: false, follow: true },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-forest/75">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-12 md:px-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Términos y condiciones" }]} />
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
        <span className="h-0.5 w-4 rounded bg-honey" /> Legal
      </p>
      <h1 className="mb-2 text-4xl">Términos y condiciones</h1>
      <p className="mb-10 text-sm text-forest/50">Última actualización: septiembre de 2026</p>

      <Section title="1. Quiénes somos">
        <p>
          {BUSINESS.name} es una tienda online que opera en {BUSINESS.city}, {BUSINESS.region}, Argentina. No
          contamos con local físico: los pedidos se coordinan por envío a domicilio o retiro en un punto de
          encuentro. Al usar este sitio o realizar un pedido, aceptás estos términos.
        </p>
      </Section>

      <Section title="2. Qué es Doña Ríos">
        <p>
          Somos una tienda curadora: seleccionamos y revendemos productos de terceros elaboradores que cumplen
          los criterios que usamos para armar el catálogo (composición nutricional, ausencia de azúcares
          agregadas, aptitud sin gluten, entre otros). No fabricamos los productos que vendemos.
        </p>
      </Section>

      <Section title="3. Cuentas de usuario">
        <p>
          Para comprar, guardar tu carrito, ver tu historial de pedidos o dejar reseñas, necesitás iniciar
          sesión con Google o Facebook. Sos responsable de la actividad que ocurra en tu cuenta. Si detectás un
          uso no autorizado, avisanos por WhatsApp o por el formulario de contacto.
        </p>
      </Section>

      <Section title="4. Precios y disponibilidad">
        <p>
          Los precios están expresados en pesos argentinos e incluyen los impuestos correspondientes. Pueden
          modificarse sin previo aviso, así como la disponibilidad de stock. El precio válido es el que figura
          en el momento de confirmar tu pedido.
        </p>
      </Section>

      <Section title="5. Cómo funciona la compra">
        <p>
          Agregás productos al carrito y completás el checkout eligiendo entrega y forma de pago preferida. El
          sitio no procesa pagos online: al confirmar, se genera un mensaje con el resumen de tu pedido que se
          envía por WhatsApp, y ahí coordinamos con vos los detalles finales y el pago. El pedido queda
          confirmado en firme una vez que lo validamos por ese medio.
        </p>
      </Section>

      <Section title="6. Envío y retiro">
        <p>
          Hacemos envíos a domicilio dentro de {BUSINESS.city} (con un costo adicional que se muestra en el
          checkout) o coordinamos el retiro en un punto de encuentro sin costo. No realizamos envíos fuera de
          esta zona por el momento.
        </p>
      </Section>

      <Section title="7. Medios de pago">
        <p>
          Aceptamos efectivo, transferencia bancaria, Mercado Pago (QR) y tarjeta de débito/crédito, según
          disponibilidad al momento de coordinar la entrega. El medio de pago se confirma por WhatsApp junto con
          el resto del pedido.
        </p>
      </Section>

      <Section title="8. Cambios y devoluciones">
        <p>
          Al tratarse de productos alimenticios, no aceptamos devoluciones una vez entregado el pedido, salvo
          error nuestro (producto equivocado) o que el producto haya llegado dañado. En esos casos, escribinos
          dentro de las 24 horas de recibido el pedido y lo resolvemos.
        </p>
      </Section>

      <Section title="9. Reseñas de productos">
        <p>
          Podés dejar una reseña por producto si iniciaste sesión. Las reseñas deben reflejar tu experiencia
          real con el producto; nos reservamos el derecho de eliminar reseñas ofensivas, falsas o que no
          correspondan a una compra real.
        </p>
      </Section>

      <Section title="10. Información nutricional y de salud">
        <p>
          La información nutricional y las guías que publicamos son de carácter general e informativo. No
          somos nutricionistas ni médicos, y nada de lo publicado en este sitio reemplaza una consulta
          profesional. Consultá con un profesional de la salud antes de modificar tu alimentación por
          condiciones médicas específicas.
        </p>
      </Section>

      <Section title="11. Propiedad intelectual">
        <p>
          El contenido de este sitio (textos, diseño, logo, ilustraciones) pertenece a {BUSINESS.name} o se usa
          con la debida autorización, y no puede reproducirse sin permiso.
        </p>
      </Section>

      <Section title="12. Modificaciones">
        <p>
          Podemos actualizar estos términos ocasionalmente. Los cambios importantes se van a reflejar en esta
          misma página con la fecha de actualización.
        </p>
      </Section>

      <Section title="13. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las
          partes se someten a los tribunales ordinarios de {BUSINESS.city}, {BUSINESS.region}.
        </p>
      </Section>

      <Section title="14. Contacto">
        <p>
          Para cualquier consulta sobre estos términos, escribinos por{" "}
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-avocado-dark underline">
            WhatsApp
          </a>{" "}
          o por el{" "}
          <a href="/contacto" className="text-avocado-dark underline">
            formulario de contacto
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
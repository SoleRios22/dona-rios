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
          {BUSINESS.name} es una tienda online que opera en {BUSINESS.city}, {BUSINESS.region}, Argentina.</p>
          <p>No contamos con local físico abierto al público. Los pedidos se coordinan mediante envío a domicilio o retiro en un punto de encuentro, según las opciones disponibles al momento de realizar la compra.
        </p>
        <p>Al utilizar este sitio o realizar un pedido, aceptás estos términos y condiciones.</p>
      </Section>

      <Section title="2. Qué es Doña Ríos">
        <p>
          Somos una tienda especializada en alimentación saludable. Seleccionamos y revendemos productos elaborados por terceros que cumplen con los criterios definidos para formar parte de nuestro catálogo, entre ellos composición nutricional, ingredientes, ausencia de azúcares agregados, aptitud sin gluten y otros criterios según cada producto.
        </p>
        <p><strong>No fabricamos los productos que vendemos ni contamos con una marca propia.</strong></p>
      </Section>

      <Section title="3. Cuentas de usuario">
        <p>
          Para determinadas funciones del sitio, como realizar compras, consultar el historial de pedidos o dejar reseñas, puede ser necesario iniciar sesión mediante los medios de autenticación disponibles.
        </p>
        <p>Sos responsable de mantener la seguridad de tu cuenta y de la actividad realizada desde ella. Si detectás un uso no autorizado, podés comunicarte con nosotros por WhatsApp o mediante el formulario de contacto.</p>
      </Section>

      <Section title="4. Precios y disponibilidad">
        <p>
          Los precios se expresan en<strong> pesos argentinos </strong>y corresponden al precio final informado en el sitio.

Los precios y la disponibilidad de los productos pueden modificarse. El precio aplicable al pedido será el informado al momento de confirmar la compra.

En caso de que un producto no se encuentre disponible, nos comunicaremos con vos para informarte las alternativas posibles.
        </p>
      </Section>

      <Section title="5. Cómo funciona la compra">
        <p>
          Agregás los productos al carrito y completás el proceso de compra, seleccionando la modalidad de entrega y los datos solicitados.

El sitio <strong>no procesa pagos online directamente</strong>. Al finalizar el pedido, se genera un mensaje con el resumen de la compra que se envía por WhatsApp. Por ese medio coordinamos los detalles finales, disponibilidad y forma de pago.

El pedido se considera confirmado una vez que <strong>Doña Ríos valida el pedido y acuerda con el cliente los detalles de la operación</strong>.
        </p>
      </Section>

      <Section title="6. Envío y retiro">
        <p>
          Realizamos envíos a domicilio dentro de  {BUSINESS.city}, con el costo correspondiente informado durante el proceso de compra.

También ofrecemos la posibilidad de retirar el pedido en un <strong>punto de encuentro previamente acordado</strong>.

Por el momento, no realizamos envíos fuera de  {BUSINESS.city}.
        
        </p>
      </Section>

      <Section title="7. Medios de pago">
        <p>
         Los medios de pago disponibles pueden incluir:

Efectivo,
Transferencia bancaria,
Mercado Pago,
QR,
Tarjetas de débito y crédito.

La disponibilidad de cada medio y las condiciones aplicables se informarán al momento de coordinar el pedido.
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
          La información nutricional, descripciones, recomendaciones y contenidos publicados en el sitio tienen<strong> carácter general e informativo</strong>.

Doña Ríos no brinda asesoramiento médico ni nutricional profesional. La información publicada no reemplaza la consulta con un médico, nutricionista u otro profesional de la salud.

Si tenés una condición médica específica, alergia, intolerancia o requerimiento alimentario particular, recomendamos consultar con un profesional antes de incorporar un producto a tu alimentación.
        </p>
      </Section>

      <Section title="11. Propiedad intelectual">
        <p>
          Los textos, fotografías, diseño, identidad visual, logotipo, ilustraciones y demás contenidos del sitio pertenecen a Doña Ríos o se utilizan con autorización de sus respectivos titulares.

No está permitida su reproducción, modificación o utilización comercial sin autorización previa.
        </p>
      </Section>

      <Section title="12. Modificaciones">
        <p>
         Doña Ríos podrá actualizar estos términos y condiciones cuando resulte necesario.

Las modificaciones serán publicadas en esta misma página indicando la fecha de actualización.
        </p>
      </Section>

      <Section title="13. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina y por las normas de protección de los consumidores que resulten aplicables.

Nada de lo establecido en estos términos limita los derechos que la legislación reconoce a los consumidores.
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
import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Doña Ríos recopila, usa y protege tus datos personales.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true }, // no aporta valor indexarla en buscadores
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-forest/75">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-12 md:px-8">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
        <span className="h-0.5 w-4 rounded bg-honey" /> Legal
      </p>
      <h1 className="mb-2 text-4xl">Política de privacidad</h1>
      <p className="mb-10 text-sm text-forest/50">Última actualización: septiembre de 2026</p>

      <Section title="1. Quién es responsable de tus datos">
        <p>
          {BUSINESS.name} ({BUSINESS.city}, {BUSINESS.region}, Argentina) es responsable del tratamiento de los
          datos personales que recopilamos a través de este sitio. Para cualquier consulta sobre esta política o
          sobre tus datos, podés escribirnos por{" "}
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-avocado-dark underline">
            WhatsApp
          </a>{" "}
          o a través del{" "}
          <a href="/contacto" className="text-avocado-dark underline">
            formulario de contacto
          </a>
          .
        </p>
      </Section>

      <Section title="2. Qué datos recopilamos">
        <p>Recopilamos distintos datos según cómo uses el sitio:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Al iniciar sesión</strong> (con Google o Facebook): nombre, dirección de email y, si tu
            cuenta lo provee, una foto de perfil. No accedemos a tu contraseña de esas plataformas ni a
            información adicional de tus redes.
          </li>
          <li>
            <strong>Al hacer un pedido</strong>: dirección y barrio (si elegís envío) o punto de retiro elegido,
            forma de pago preferida, y el detalle de los productos pedidos.
          </li>
          <li>
            <strong>Al interactuar con la tienda</strong>: productos que agregás a favoritos o al carrito, y las
            reseñas que publiques (que se muestran públicamente junto a tu nombre).
          </li>
          <li>
            <strong>Al escribirnos</strong>: nombre, email y el contenido del mensaje que envíes por el
            formulario de contacto.
          </li>
        </ul>
      </Section>

      <Section title="3. Para qué usamos tus datos">
        <ul className="list-disc pl-5">
          <li>Crear y gestionar tu cuenta, y mostrarte tu historial de pedidos.</li>
          <li>Procesar tus pedidos y coordinar la entrega o retiro por WhatsApp.</li>
          <li>Mostrar tus reseñas de productos de forma pública en el sitio.</li>
          <li>Responder tus consultas enviadas por el formulario de contacto.</li>
          <li>Mejorar el funcionamiento de la tienda.</li>
        </ul>
        <p>No usamos tus datos para publicidad ni los vendemos a terceros.</p>
      </Section>

      <Section title="4. Con quién compartimos datos">
        <ul className="list-disc pl-5">
          <li>
            <strong>Supabase</strong>, nuestro proveedor de base de datos y autenticación, que aloja la
            información técnicamente en nuestro nombre.
          </li>
          <li>
            <strong>Google y Facebook</strong>, únicamente como proveedores de inicio de sesión — no les
            compartimos datos adicionales de tu cuenta en Doña Ríos.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong>, al coordinar tu pedido por ese medio, ya que es la app que usamos
            para comunicarnos con vos.
          </li>
        </ul>
      </Section>

      <Section title="5. Cuánto tiempo conservamos tus datos">
        <p>
          Mientras tu cuenta esté activa. Los pedidos ya realizados los conservamos por más tiempo por motivos
          contables/impositivos, aún si eliminás tu cuenta, tal como exige la normativa vigente.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>
          De acuerdo a la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a acceder,
          rectificar y suprimir tus datos personales. La Agencia de Acceso a la Información Pública, en su
          carácter de órgano de control, tiene la atribución de atender denuncias y reclamos que interpongan
          quienes resulten afectados en sus derechos.
        </p>
      </Section>

      <Section title="7. Eliminación de tus datos">
        <p>
          Si querés que eliminemos tu cuenta y los datos asociados (perfil, favoritos, reseñas), escribinos por{" "}
          <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-avocado-dark underline">
            WhatsApp
          </a>{" "}
          o por el{" "}
          <a href="/contacto" className="text-avocado-dark underline">
            formulario de contacto
          </a>{" "}
          pidiendo la baja de tu cuenta. Vamos a eliminar tus datos dentro de los 10 días hábiles, excepto la
          información de pedidos ya realizados que debamos conservar por obligaciones legales o contables.
        </p>
        <p>
          Si iniciaste sesión con Facebook y preferís revocar el acceso directamente desde ahí, podés hacerlo
          desde Facebook → Configuración → Aplicaciones y sitios web, quitando el acceso de Doña Ríos. Eso
          revoca el permiso de inicio de sesión, pero para eliminar los datos ya guardados en nuestra base
          igual necesitamos que nos lo pidas por los medios de arriba.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Usamos únicamente una cookie técnica de sesión para mantenerte con la sesión iniciada. No usamos
          cookies de publicidad ni de seguimiento entre sitios.
        </p>
      </Section>

      <Section title="9. Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Si hacemos cambios importantes, lo vamos a indicar en
          esta misma página.
        </p>
      </Section>
    </div>
  );
}
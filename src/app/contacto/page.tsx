import ContactForm from "@/components/ContactForm";
import Breadcrumb from "@/components/Breadcrumb";

export default function ContactPage() {
  return (

    <div className="mx-auto max-w-[720px] px-6 py-12 md:px-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]} />
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-avocado-dark">
        <span className="h-0.5 w-4 rounded bg-honey" /> Contacto
      </p>
      <h1 className="mb-3 text-4xl">Escribinos</h1>
      <p className="mb-10 max-w-md text-[15px] text-forest/60">
        Para pedidos, lo más rápido es WhatsApp. Para otras consultas (proveedores, prensa, sugerencias), usá este
        formulario.
      </p>

      <ContactForm />

      <div className="mt-8 rounded-2xl bg-cream-2 p-6 text-center">
        <p className="mb-3 text-sm text-forest/70">¿Es sobre un pedido? Te respondemos más rápido por WhatsApp.</p>
        <a
          href="https://wa.me/5493584315332"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-honey px-6 py-3 font-semibold text-forest"
        >
          Abrir WhatsApp
        </a>
      </div>
    </div>
  );
}

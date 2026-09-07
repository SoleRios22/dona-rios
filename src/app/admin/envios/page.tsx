import { getShippingSettings } from "@/lib/actions/shipping";
import ShippingSettingsForm from "@/components/admin/ShippingSettingsForm";

export default async function AdminShippingPage() {
  const settings = await getShippingSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Configuración de envíos</h1>
        <p className="mt-1 text-sm text-forest/60">
          Definí cómo se calcula automáticamente el costo de envío según la distancia hasta cada cliente.
        </p>
      </div>
      <ShippingSettingsForm initial={settings} />
    </div>
  );
}
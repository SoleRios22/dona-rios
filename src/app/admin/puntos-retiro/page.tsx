import { getPickupPoints } from "@/lib/actions/pickup-points";
import PickupPointManager from "@/components/admin/PickupPointManager";

export default async function AdminPickupPointsPage() {
  const points = await getPickupPoints();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Puntos de retiro</h1>
        <p className="mt-1 text-sm text-forest/60">
          Los lugares que el cliente puede elegir cuando pide &quot;Retiro en punto&quot; en el checkout.
        </p>
      </div>
      <PickupPointManager initial={points} />
    </div>
  );
}
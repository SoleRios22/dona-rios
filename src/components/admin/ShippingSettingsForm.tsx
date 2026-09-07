"use client";

import { useState, useTransition } from "react";
import { geocodeOriginAddress, updateShippingSettings } from "@/lib/actions/shipping";
import { calculateShippingCost } from "@/lib/utils/shipping";
import { formatCurrency } from "@/lib/utils/currency";
import type { ShippingSettings } from "@/types/database";

export default function ShippingSettingsForm({ initial }: { initial: ShippingSettings }) {
  const [originAddress, setOriginAddress] = useState(initial.origin_address);
  const [originLat, setOriginLat] = useState(initial.origin_lat);
  const [originLng, setOriginLng] = useState(initial.origin_lng);
  const [fuelPrice, setFuelPrice] = useState(initial.fuel_price.toString());
  const [fuelConsumption, setFuelConsumption] = useState(initial.fuel_consumption.toString());
  const [profitType, setProfitType] = useState<"percentage" | "fixed">(initial.profit_type);
  const [profitValue, setProfitValue] = useState(initial.profit_value.toString());
  const [roundTrip, setRoundTrip] = useState(initial.round_trip);
  const [routeFactor, setRouteFactor] = useState(initial.route_factor.toString());
  const [minShippingCost, setMinShippingCost] = useState(initial.min_shipping_cost.toString());
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initial.free_shipping_threshold?.toString() ?? "");

  const [geocoding, startGeocoding] = useTransition();
  const [saving, startSaving] = useTransition();
  const [geocodeMsg, setGeocodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [simDistance, setSimDistance] = useState("5");

  function handleGeocode() {
    setGeocodeMsg(null);
    startGeocoding(async () => {
      const result = await geocodeOriginAddress(originAddress);
      if (result.error || result.lat === undefined || result.lng === undefined) {
        setGeocodeMsg({ text: result.error ?? "No se pudo geolocalizar.", ok: false });
        return;
      }
      setOriginLat(result.lat);
      setOriginLng(result.lng);
      setGeocodeMsg({ text: `Ubicación encontrada: ${result.displayName}`, ok: true });
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg(null);
    startSaving(async () => {
      const result = await updateShippingSettings({
        originAddress,
        originLat,
        originLng,
        fuelPrice: Number(fuelPrice),
        fuelConsumption: Number(fuelConsumption),
        profitType,
        profitValue: Number(profitValue),
        roundTrip,
        routeFactor: Number(routeFactor),
        minShippingCost: Number(minShippingCost),
        freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
      });
      setSaveMsg({ text: result.error ?? "✓ Configuración guardada.", ok: !result.error });
    });
  }

  const simulation = calculateShippingCost(Number(simDistance) || 0, {
    fuelPrice: Number(fuelPrice) || 0,
    fuelConsumptionKmPerLiter: Number(fuelConsumption) || 10,
    roundTrip,
    routeFactor: Number(routeFactor) || 1,
    profitType,
    profitValue: Number(profitValue) || 0,
    minShippingCost: Number(minShippingCost) || 0,
  });

  return (
    <form onSubmit={handleSave} className="max-w-2xl">
      <Section title="Punto de partida de los envíos">
        <Field label="Dirección de origen">
          <div className="flex gap-2">
            <input value={originAddress} onChange={(e) => setOriginAddress(e.target.value)} className={inputClass} />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="shrink-0 rounded-xl border-2 border-forest px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {geocoding ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </Field>
        {geocodeMsg && (
          <p className={`mt-2 text-xs ${geocodeMsg.ok ? "text-avocado-dark" : "text-clay"}`}>{geocodeMsg.text}</p>
        )}
        <p className="mt-2 text-xs text-forest/50">
          Coordenadas actuales: {originLat.toFixed(5)}, {originLng.toFixed(5)}
        </p>
      </Section>

      <Section title="Costo del combustible">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Precio de la nafta (por litro)">
            <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Rendimiento del vehículo (km por litro)">
            <input type="number" step="0.1" value={fuelConsumption} onChange={(e) => setFuelConsumption(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="h-4 w-4 accent-avocado" />
          Calcular ida y vuelta (recomendado)
        </label>
      </Section>

      <Section title="Ganancia por envío">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setProfitType("percentage")}
            className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold ${profitType === "percentage" ? "border-avocado bg-cream-2" : "border-line"}`}
          >
            % sobre el combustible
          </button>
          <button
            type="button"
            onClick={() => setProfitType("fixed")}
            className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold ${profitType === "fixed" ? "border-avocado bg-cream-2" : "border-line"}`}
          >
            Monto fijo
          </button>
        </div>
        <Field label={profitType === "percentage" ? "Porcentaje de ganancia (%)" : "Monto fijo ($)"}>
          <input type="number" value={profitValue} onChange={(e) => setProfitValue(e.target.value)} className={inputClass} />
        </Field>
      </Section>

      <Section title="Ajustes finos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Factor de ruta">
            <input type="number" step="0.05" value={routeFactor} onChange={(e) => setRouteFactor(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Costo mínimo de envío ($)">
            <input type="number" step="50" value={minShippingCost} onChange={(e) => setMinShippingCost(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Envío gratis a partir de ($, opcional)" className="sm:col-span-2">
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              placeholder="Dejalo vacío si no aplica"
              className={inputClass}
            />
          </Field>
        </div>
        <p className="mt-3 text-xs text-forest/50">
          El factor de ruta corrige la distancia en línea recta para aproximarla al recorrido real en auto por
          las calles. 1.3 es un buen punto de partida.
        </p>
      </Section>

      <Section title="Simulador">
        <Field label="Distancia de prueba (km, línea recta)">
          <input type="number" step="0.5" value={simDistance} onChange={(e) => setSimDistance(e.target.value)} className={inputClass} />
        </Field>
        <div className="mt-4 rounded-xl bg-cream-2 p-4 text-sm">
          <Row label="Distancia estimada de recorrido" value={`${simulation.estimatedRouteDistanceKm.toFixed(1)} km`} />
          <Row label="Distancia total (ida y vuelta)" value={`${simulation.totalDistanceKm.toFixed(1)} km`} />
          <Row label="Litros de nafta usados" value={`${simulation.litersUsed.toFixed(2)} L`} />
          <Row label="Costo de combustible" value={formatCurrency(simulation.fuelCost)} />
          <Row label="Ganancia" value={formatCurrency(simulation.profit)} />
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-base">
            <span className="font-semibold">Se le cobraría al cliente</span>
            <span className="font-display font-semibold text-avocado-dark">{formatCurrency(simulation.shippingCost)}</span>
          </div>
        </div>
      </Section>

      {saveMsg && (
        <p className={`mb-4 rounded-xl px-4 py-3 text-sm ${saveMsg.ok ? "bg-avocado/15 text-avocado-dark" : "bg-clay/10 text-clay"}`}>
          {saveMsg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-avocado px-8 py-3.5 font-semibold text-cream shadow-[0_5px_0_var(--color-avocado-dark)] disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-4 text-lg">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-forest/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
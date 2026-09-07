export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface ShippingCalcSettings {
  fuelPrice: number;
  fuelConsumptionKmPerLiter: number;
  roundTrip: boolean;
  routeFactor: number;
  profitType: "percentage" | "fixed";
  profitValue: number;
  minShippingCost: number;
}

export interface ShippingCalcResult {
  estimatedRouteDistanceKm: number; // distancia de ida, ya corregida por el factor de ruta
  totalDistanceKm: number; // considerando ida y vuelta si aplica
  litersUsed: number;
  fuelCost: number;
  profit: number;
  shippingCost: number;
}

export function calculateShippingCost(straightLineDistanceKm: number, settings: ShippingCalcSettings): ShippingCalcResult {
  const estimatedRouteDistanceKm = straightLineDistanceKm * settings.routeFactor;
  const totalDistanceKm = settings.roundTrip ? estimatedRouteDistanceKm * 2 : estimatedRouteDistanceKm;

  const consumption = settings.fuelConsumptionKmPerLiter > 0 ? settings.fuelConsumptionKmPerLiter : 10;
  const litersUsed = totalDistanceKm / consumption;
  const fuelCost = litersUsed * settings.fuelPrice;

  const profit = settings.profitType === "percentage" ? fuelCost * (settings.profitValue / 100) : settings.profitValue;

  let shippingCost = fuelCost + profit;
  shippingCost = Math.max(shippingCost, settings.minShippingCost);
  shippingCost = Math.round(shippingCost / 50) * 50; // número más "redondo" para cobrar

  return { estimatedRouteDistanceKm, totalDistanceKm, litersUsed, fuelCost, profit, shippingCost };
}
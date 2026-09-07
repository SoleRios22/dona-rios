"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { geocodeAddress } from "@/lib/utils/geocoding";
import { calculateShippingCost, haversineDistanceKm } from "@/lib/utils/shipping";
import type { ShippingSettings } from "@/types/database";

const DEFAULT_SETTINGS: Omit<ShippingSettings, "id" | "updated_at"> = {
  origin_address: "Río Cuarto, Córdoba, Argentina",
  origin_lat: -33.1232,
  origin_lng: -64.3492,
  fuel_price: 1000,
  fuel_consumption: 10,
  profit_type: "percentage",
  profit_value: 50,
  round_trip: true,
  route_factor: 1.3,
  min_shipping_cost: 1000,
  free_shipping_threshold: null,
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const supabaseAdmin = createAdminClient();
  const { data } = await supabaseAdmin.from("shipping_settings").select("*").limit(1).maybeSingle();
  if (data) return data as ShippingSettings;
  return { id: "default", updated_at: new Date().toISOString(), ...DEFAULT_SETTINGS };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, ok: profile?.role === "admin" };
}

export async function updateShippingSettings(input: {
  originAddress: string;
  originLat: number;
  originLng: number;
  fuelPrice: number;
  fuelConsumption: number;
  profitType: "percentage" | "fixed";
  profitValue: number;
  roundTrip: boolean;
  routeFactor: number;
  minShippingCost: number;
  freeShippingThreshold: number | null;
}) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "No tenés permisos de administrador." };

  const { data: existing } = await supabase.from("shipping_settings").select("id").limit(1).maybeSingle();

  const payload = {
    origin_address: input.originAddress,
    origin_lat: input.originLat,
    origin_lng: input.originLng,
    fuel_price: input.fuelPrice,
    fuel_consumption: input.fuelConsumption,
    profit_type: input.profitType,
    profit_value: input.profitValue,
    round_trip: input.roundTrip,
    route_factor: input.routeFactor,
    min_shipping_cost: input.minShippingCost,
    free_shipping_threshold: input.freeShippingThreshold,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("shipping_settings").update(payload).eq("id", existing.id)
    : await supabase.from("shipping_settings").insert(payload);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/envios");
  return { error: null };
}

export async function geocodeOriginAddress(address: string) {
  const result = await geocodeAddress(address);
  if (!result) return { error: "No pudimos encontrar esa dirección. Probá ser más específico." };
  return { error: null, lat: result.lat, lng: result.lng, displayName: result.displayName };
}

// Usada desde el checkout público
export async function calculateShippingForAddress(address: string, neighborhood: string, subtotal: number) {
  if (!address.trim()) return { error: "Ingresá una dirección." };

  const settings = await getShippingSettings();

  if (settings.free_shipping_threshold != null && subtotal >= settings.free_shipping_threshold) {
    return { error: null, cost: 0, distanceKm: null, freeShipping: true };
  }

  const fullAddress = neighborhood ? `${address}, ${neighborhood}` : address;
  const geocoded = await geocodeAddress(fullAddress);

  if (!geocoded) {
    return { error: "No pudimos encontrar esa dirección. Revisá que tenga calle y número." };
  }

  const straightLineDistanceKm = haversineDistanceKm(
    settings.origin_lat,
    settings.origin_lng,
    geocoded.lat,
    geocoded.lng
  );

  const result = calculateShippingCost(straightLineDistanceKm, {
    fuelPrice: settings.fuel_price,
    fuelConsumptionKmPerLiter: settings.fuel_consumption,
    roundTrip: settings.round_trip,
    routeFactor: settings.route_factor,
    profitType: settings.profit_type,
    profitValue: settings.profit_value,
    minShippingCost: settings.min_shipping_cost,
  });

  return {
    error: null,
    cost: result.shippingCost,
    distanceKm: Number(result.estimatedRouteDistanceKm.toFixed(1)), // distancia de ida, para mostrarle al cliente
    freeShipping: false,
  };
}
import { z } from "zod";

export const CriticalAssetSchema = z.object({
  id: z.string(),
  osm_id: z.number(),
  name: z.string(),
  category: z.enum(["HOSPITAL", "SUBSTATION", "CELL_TOWER", "SHELTER", "BRIDGE"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  ground_elevation_msl: z.number().default(2.5),
  distance_to_coast_km: z.number().nonnegative().default(2.5),
  critical_specs: z.object({
    plinth_height_meters: z.number().nonnegative().default(0.4),
    backup_power_type: z.enum(["ROOF_DG", "GROUND_DG", "UNDERGROUND_VAULT", "SOLAR_BATTERY"]).default("GROUND_DG"),
    backup_power_elevation: z.number().nonnegative().default(0.5),
    service_population_capacity: z.number().optional(),
    voltage_kv: z.number().optional(),
    mast_height_meters: z.number().optional(),
    battery_reserve_hours: z.number().optional(),
  }),
});

export const VillageDemographicSchema = z.object({
  census_code: z.string(),
  name: z.string(),
  vernacular_name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  population: z.number().int().nonnegative(),
  kutcha_houses: z.number().int().nonnegative(),
  pucca_houses: z.number().int().nonnegative(),
  commercial_shops_count: z.number().int().nonnegative().default(0),
  elevation_meters: z.number().default(2.0),
});

export const EvacuationRouteEdgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  source_node: z.string(),
  target_node: z.string(),
  length_km: z.number().positive(),
  min_elevation_meters: z.number(),
  capacity_vehicles_per_hour: z.number().positive(),
  is_bridge: z.boolean(),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});

export const StormTrackPointSchema = z.object({
  time_step: z.string(),
  step_index: z.number().int().min(0),
  timestamp_utc: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  central_pressure_hpa: z.number().positive(),
  max_sustained_wind_kmh: z.number().positive(),
  gust_wind_kmh: z.number().positive(),
  storm_category: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  wind_radii: z.object({
    gale_34kt_radius_km: z.number().nonnegative(),
    storm_50kt_radius_km: z.number().nonnegative(),
    hurricane_64kt_radius_km: z.number().nonnegative(),
  }),
  projected_surge_peak_meters: z.number().nonnegative(),
});

export const CommercialShopSchema = z.object({
  id: z.string(),
  osm_id: z.number(),
  name: z.string(),
  shop_type: z.enum(["GROCERY", "PHARMACY", "COLD_STORAGE", "GRAIN_WHOLESALE", "GENERAL"]),
  latitude: z.number(),
  longitude: z.number(),
  ground_elevation_msl: z.number(),
  distance_to_coast_km: z.number().nonnegative().default(1.5),
  inventory_value_inr: z.number().nonnegative(),
});

export const AssetEvaluationResultSchema = z.object({
  assetId: z.string(),
  status: z.enum(["OPERATIONAL", "WARNING", "CRITICAL_POWER_BREACH", "SUBMERGED", "STRUCTURAL_COLLAPSE"]),
  windSpeedKmh: z.number().nonnegative(),
  surgeHeightMeters: z.number().nonnegative(),
  inundationDepthMeters: z.number().nonnegative(),
  failureReason: z.string().nullable(),
  estimatedTimeToFailureHours: z.number().nullable(),
});

export const EvacuationNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation_meters: z.number(),
});

export const EvacuationNetworkSchema = z.object({
  corridor_id: z.string(),
  name: z.string(),
  origin_node: z.string(),
  destination_node: z.string(),
  nodes: z.array(EvacuationNodeSchema),
  edges: z.array(EvacuationRouteEdgeSchema),
  routing_rules: z.object({
    primary_route_id: z.string(),
    primary_edge_sequence: z.array(z.string()),
    detour_route_id: z.string(),
    detour_edge_sequence: z.array(z.string()),
    critical_chokepoint_edge_id: z.string(),
    submersion_threshold_meters: z.number(),
  }),
});

export const EvacuationRouteResultSchema = z.object({
  routeId: z.string(),
  isSafe: z.boolean(),
  totalDistanceKm: z.number().nonnegative(),
  estimatedClearanceHours: z.number().nonnegative(),
  blockedAtEdgeId: z.string().nullable(),
  chokepoints: z.array(
    z.object({
      edgeId: z.string(),
      name: z.string(),
      submersionDepthMeters: z.number(),
      submersionTimestamp: z.string(),
    })
  ),
  pathCoordinates: z.array(z.tuple([z.number(), z.number()])),
});

// Canonical Gemini Vision Triage Schema (imported and re-exported from ./triage)
export { TriageResponseSchema, type TriageResponse } from "./triage";

export const BPPTelemetrySchema = z.object({
  version: z.number().int().min(0).max(15),
  timeStepIndex: z.number().int().min(0).max(15),
  sectorId: z.number().int().min(0).max(65535),
  hazardBitmap: z.number().int().min(0).max(255),
  surgeDecimeters: z.number().int().min(0).max(255),
  safeRouteId: z.number().int().min(0).max(4095),
  shelterId: z.number().int().min(0).max(4095),
  populationAtRisk: z.number().int().min(0).max(4294967295),
});

export type BPPTelemetryPayload = z.infer<typeof BPPTelemetrySchema>;

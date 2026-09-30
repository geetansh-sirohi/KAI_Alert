export type AssetCategory = "HOSPITAL" | "SUBSTATION" | "CELL_TOWER" | "SHELTER" | "BRIDGE";

export type BackupPowerType = "ROOF_DG" | "GROUND_DG" | "UNDERGROUND_VAULT" | "SOLAR_BATTERY";

export type AssetOperationalStatus = "OPERATIONAL" | "WARNING" | "CRITICAL_POWER_BREACH" | "SUBMERGED" | "STRUCTURAL_COLLAPSE";

export interface CriticalAsset {
  id: string;
  osm_id: number;
  name: string;
  category: AssetCategory;
  latitude: number;
  longitude: number;
  ground_elevation_msl: number; // in meters above MSL
  distance_to_coast_km: number; // in kilometers from nearest coastal shoreline (for hydraulic surge attenuation)
  critical_specs: {
    plinth_height_meters: number;
    backup_power_type: BackupPowerType;
    backup_power_elevation: number; // relative to ground
    service_population_capacity?: number;
    voltage_kv?: number;
    mast_height_meters?: number;
    battery_reserve_hours?: number;
  };
}

export interface StormTrackPoint {
  time_step: string; // "T-24h", "T-18h", ..., "T-0h", "T+6h"
  step_index: number;
  timestamp_utc: string;
  latitude: number;
  longitude: number;
  central_pressure_hpa: number;
  max_sustained_wind_kmh: number;
  gust_wind_kmh: number;
  storm_category: 1 | 2 | 3 | 4 | 5;
  wind_radii: {
    gale_34kt_radius_km: number;
    storm_50kt_radius_km: number;
    hurricane_64kt_radius_km: number;
  };
  projected_surge_peak_meters: number;
}

export interface CommercialShop {
  id: string;
  osm_id: number;
  name: string;
  shop_type: "GROCERY" | "PHARMACY" | "COLD_STORAGE" | "GRAIN_WHOLESALE" | "GENERAL";
  latitude: number;
  longitude: number;
  ground_elevation_msl: number;
  distance_to_coast_km: number;
  inventory_value_inr: number;
}

export interface VillageDemographic {
  census_code: string;
  name: string;
  vernacular_name: string;
  latitude: number;
  longitude: number;
  population: number;
  kutcha_houses: number;
  pucca_houses: number;
  commercial_shops_count: number;
  elevation_meters: number;
}

export interface EvacuationNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
}

export interface EvacuationRouteEdge {
  id: string;
  name: string;
  source_node: string;
  target_node: string;
  length_km: number;
  min_elevation_meters: number;
  capacity_vehicles_per_hour: number;
  is_bridge: boolean;
  // Strict RFC 7946 GeoJSON standard: [longitude, latitude]
  coordinates: [longitude: number, latitude: number][];
}

export interface EvacuationNetwork {
  corridor_id: string;
  name: string;
  origin_node: string;
  destination_node: string;
  nodes: EvacuationNode[];
  edges: EvacuationRouteEdge[];
  routing_rules: {
    primary_route_id: string;
    primary_edge_sequence: string[];
    detour_route_id: string;
    detour_edge_sequence: string[];
    critical_chokepoint_edge_id: string;
    submersion_threshold_meters: number;
  };
}

export interface EvacuationRouteResult {
  routeId: string;
  isSafe: boolean;
  totalDistanceKm: number;
  estimatedClearanceHours: number;
  blockedAtEdgeId: string | null;
  chokepoints: {
    edgeId: string;
    name: string;
    submersionDepthMeters: number;
    submersionTimestamp: string;
  }[];
  pathCoordinates: [longitude: number, latitude: number][];
}

export interface AssetEvaluationResult {
  assetId: string;
  status: AssetOperationalStatus;
  windSpeedKmh: number;
  surgeHeightMeters: number;
  inundationDepthMeters: number;
  failureReason: string | null;
  estimatedTimeToFailureHours: number | null;
}

export interface BPPTelemetryPayload {
  version: number;
  timeStepIndex: number;
  sectorId: number;
  hazardBitmap: number;
  surgeDecimeters: number;
  safeRouteId: number;
  shelterId: number;
  populationAtRisk: number;
}

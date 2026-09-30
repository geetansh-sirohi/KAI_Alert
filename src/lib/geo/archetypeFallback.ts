import { AssetCategory, BackupPowerType, CriticalAsset } from "../types/disaster";

export interface ArchetypeDefaults {
  ground_elevation_msl: number;
  distance_to_coast_km: number;
  plinth_height_meters: number;
  backup_power_type: BackupPowerType;
  backup_power_elevation: number;
  service_population_capacity?: number;
  voltage_kv?: number;
  mast_height_meters?: number;
  battery_reserve_hours?: number;
}

export const ARCHETYPE_DEFAULTS: Record<AssetCategory, ArchetypeDefaults> = {
  HOSPITAL: {
    ground_elevation_msl: 4.5,
    distance_to_coast_km: 12.0,
    plinth_height_meters: 0.6,
    backup_power_type: "UNDERGROUND_VAULT",
    backup_power_elevation: -1.5,
    service_population_capacity: 500,
    battery_reserve_hours: 24,
  },
  SUBSTATION: {
    ground_elevation_msl: 3.2,
    distance_to_coast_km: 8.5,
    plinth_height_meters: 0.4,
    backup_power_type: "GROUND_DG",
    backup_power_elevation: 0.2,
    voltage_kv: 132,
    battery_reserve_hours: 12,
  },
  CELL_TOWER: {
    ground_elevation_msl: 5.0,
    distance_to_coast_km: 15.0,
    plinth_height_meters: 0.3,
    backup_power_type: "GROUND_DG",
    backup_power_elevation: 0.1,
    mast_height_meters: 45,
    battery_reserve_hours: 8,
  },
  SHELTER: {
    ground_elevation_msl: 8.0,
    distance_to_coast_km: 18.0,
    plinth_height_meters: 1.2,
    backup_power_type: "ROOF_DG",
    backup_power_elevation: 3.5,
    service_population_capacity: 1200,
    battery_reserve_hours: 48,
  },
  BRIDGE: {
    ground_elevation_msl: 2.1,
    distance_to_coast_km: 4.0,
    plinth_height_meters: 0.2,
    backup_power_type: "GROUND_DG",
    backup_power_elevation: 0.0,
    service_population_capacity: 0,
    battery_reserve_hours: 0,
  },
};

export function applyArchetypeFallback(partialAsset: Partial<CriticalAsset> & { id: string; name: string; category: AssetCategory }): CriticalAsset {
  const defaults = ARCHETYPE_DEFAULTS[partialAsset.category] || ARCHETYPE_DEFAULTS.HOSPITAL;

  return {
    id: partialAsset.id,
    osm_id: partialAsset.osm_id ?? Math.floor(Math.random() * 1000000),
    name: partialAsset.name,
    category: partialAsset.category,
    latitude: partialAsset.latitude ?? 20.3,
    longitude: partialAsset.longitude ?? 86.6,
    ground_elevation_msl: partialAsset.ground_elevation_msl ?? defaults.ground_elevation_msl,
    distance_to_coast_km: partialAsset.distance_to_coast_km ?? defaults.distance_to_coast_km,
    critical_specs: {
      plinth_height_meters: partialAsset.critical_specs?.plinth_height_meters ?? defaults.plinth_height_meters,
      backup_power_type: partialAsset.critical_specs?.backup_power_type ?? defaults.backup_power_type,
      backup_power_elevation: partialAsset.critical_specs?.backup_power_elevation ?? defaults.backup_power_elevation,
      service_population_capacity: partialAsset.critical_specs?.service_population_capacity ?? defaults.service_population_capacity,
      voltage_kv: partialAsset.critical_specs?.voltage_kv ?? defaults.voltage_kv,
      mast_height_meters: partialAsset.critical_specs?.mast_height_meters ?? defaults.mast_height_meters,
      battery_reserve_hours: partialAsset.critical_specs?.battery_reserve_hours ?? defaults.battery_reserve_hours,
    },
  };
}

import { CriticalAsset, StormTrackPoint, AssetEvaluationResult, AssetOperationalStatus } from "../types/disaster";
import { calculateHollandWindSpeed } from "./hollandWind";
import { calculateInlandSurge } from "./surgePhysics";

export function evaluateAssetVulnerability(
  asset: CriticalAsset,
  storm: StormTrackPoint,
  distanceToEyeKm: number,
  distanceToCoastKm: number
): AssetEvaluationResult {
  const windSpeedKmh = calculateHollandWindSpeed(
    distanceToEyeKm,
    storm.max_sustained_wind_kmh,
    storm.central_pressure_hpa,
    1013.25,
    35.0,
    storm.latitude
  );

  const inlandSurgeMeters = calculateInlandSurge(
    storm.projected_surge_peak_meters,
    distanceToCoastKm,
    0.6
  );

  const floodDepthGround = Math.max(0, inlandSurgeMeters - asset.ground_elevation_msl);
  let status: AssetOperationalStatus = "OPERATIONAL";
  let failureReason: string | null = null;
  let estimatedTimeToFailureHours: number | null = null;

  switch (asset.category) {
    case "HOSPITAL": {
      const genBaseElevation = asset.critical_specs.backup_power_elevation ?? 0.8;
      const genWaterDepth = floodDepthGround - genBaseElevation;

      if (genWaterDepth > 0.30) {
        status = "CRITICAL_POWER_BREACH";
        failureReason = `DG set submerged in ${genWaterDepth.toFixed(2)}m floodwater; ICU on emergency battery.`;
        estimatedTimeToFailureHours = 0.75; // 45-minute ventilator reserve
      } else if (floodDepthGround > asset.critical_specs.plinth_height_meters) {
        status = "WARNING";
        failureReason = `Compound water ingress (${floodDepthGround.toFixed(2)}m); ground floor plinth breached.`;
      } else if (windSpeedKmh > 130) {
        status = "WARNING";
        failureReason = `High wind structural buffer alert (${windSpeedKmh.toFixed(0)} km/h).`;
      }
      break;
    }

    case "SUBSTATION": {
      if (windSpeedKmh > 95) {
        status = "CRITICAL_POWER_BREACH";
        failureReason = `High wind shear / salt-spray busbar flashover trip (${windSpeedKmh.toFixed(0)} km/h).`;
      } else if (floodDepthGround > 0.40) {
        status = "CRITICAL_POWER_BREACH";
        failureReason = `Switchgear yard flooded by ${floodDepthGround.toFixed(2)}m surge.`;
      } else if (windSpeedKmh > 75) {
        status = "WARNING";
        failureReason = "Wind approaching trip threshold.";
      }
      break;
    }

    case "CELL_TOWER": {
      if (windSpeedKmh > 140) {
        status = "STRUCTURAL_COLLAPSE";
        failureReason = `Lattice mast structural buckling under ${windSpeedKmh.toFixed(0)} km/h cyclonic gusts.`;
      } else if (windSpeedKmh > 95) {
        status = "WARNING";
        failureReason = "Grid line outage; operating on internal battery reserve.";
        estimatedTimeToFailureHours = asset.critical_specs.battery_reserve_hours ?? 4.5;
      }
      break;
    }

    case "BRIDGE": {
      if (inlandSurgeMeters > asset.ground_elevation_msl) {
        status = "SUBMERGED";
        failureReason = `Bridge deck submerged under ${(inlandSurgeMeters - asset.ground_elevation_msl).toFixed(2)}m surge.`;
      }
      break;
    }

    case "SHELTER": {
      if (floodDepthGround > 1.5) {
        status = "WARNING";
        failureReason = `Deep surge waters (${floodDepthGround.toFixed(2)}m) surrounding shelter compound.`;
      }
      break;
    }
  }

  return {
    assetId: asset.id,
    status,
    windSpeedKmh,
    surgeHeightMeters: inlandSurgeMeters,
    inundationDepthMeters: floodDepthGround,
    failureReason,
    estimatedTimeToFailureHours,
  };
}

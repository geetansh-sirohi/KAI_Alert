import { describe, it, expect } from "vitest";
import { evaluateAssetVulnerability } from "../src/lib/physics/ivs";
import { CriticalAsset, StormTrackPoint } from "../src/lib/types/disaster";

describe("Gate 1: Physical Vulnerability Breach Verification", () => {
  it("triggers CRITICAL_POWER_BREACH when hospital generator is submerged", () => {
    const hospital: CriticalAsset = {
      id: "HOSP-01",
      osm_id: 10492811,
      name: "Paradip Port Sub-Divisional Hospital",
      category: "HOSPITAL",
      latitude: 20.2961,
      longitude: 86.6745,
      ground_elevation_msl: 1.6,
      distance_to_coast_km: 0.4,
      critical_specs: {
        plinth_height_meters: 0.4,
        backup_power_type: "GROUND_DG",
        backup_power_elevation: 0.8,
      },
    };

    const stormLandfall: StormTrackPoint = {
      time_step: "T-0h",
      step_index: 5,
      timestamp_utc: "2024-10-25T00:00:00Z",
      latitude: 20.35,
      longitude: 86.68,
      central_pressure_hpa: 942,
      max_sustained_wind_kmh: 165,
      gust_wind_kmh: 195,
      storm_category: 4,
      wind_radii: {
        gale_34kt_radius_km: 240,
        storm_50kt_radius_km: 140,
        hurricane_64kt_radius_km: 80,
      },
      projected_surge_peak_meters: 3.2,
    };

    const result = evaluateAssetVulnerability(hospital, stormLandfall, 6.0, 0.4);

    expect(result.status).toBe("CRITICAL_POWER_BREACH");
    expect(result.failureReason).toContain("submerged");
    expect(result.inundationDepthMeters).toBeGreaterThan(0.4);
  });
});

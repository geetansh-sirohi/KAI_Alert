import { describe, it, expect } from "vitest";
import { calculateSafeEvacuationRoute } from "../src/lib/geo/router";
import { EvacuationNetwork, AssetEvaluationResult } from "../src/lib/types/disaster";
import routesData from "../public/data/evacuation_routes_odisha.json";

describe("Gate 2: Evacuation Route Dynamic Pruning", () => {
  it("switches to inland detour when estuary bridge is submerged by 2.9m surge", () => {
    const network = routesData as unknown as EvacuationNetwork;
    const evaluations: Record<string, AssetEvaluationResult> = {
      "BRG-01": {
        assetId: "BRG-01",
        status: "SUBMERGED",
        windSpeedKmh: 140,
        surgeHeightMeters: 2.9,
        inundationDepthMeters: 0.9,
        failureReason: "Bridge deck submerged under 0.90m surge.",
        estimatedTimeToFailureHours: null,
      },
    };

    const result = calculateSafeEvacuationRoute(network, 2.9, evaluations);

    expect(result.isSafe).toBe(true);
    expect(result.routeId).toBe("ROUTE-INLAND-DETOUR");
    expect(result.blockedAtEdgeId).toBe("BRG-01");
    expect(result.totalDistanceKm).toBe(14.6);
  });
});

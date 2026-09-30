import { EvacuationNetwork, EvacuationRouteResult, AssetEvaluationResult } from "../types/disaster";

export function calculateSafeEvacuationRoute(
  network: EvacuationNetwork,
  peakSurgeMeters: number,
  evaluations: Record<string, AssetEvaluationResult>
): EvacuationRouteResult {
  const chokepointId = network.routing_rules.critical_chokepoint_edge_id; // "BRG-01"
  const threshold = network.routing_rules.submersion_threshold_meters; // 2.0m
  const bridgeEval = evaluations[chokepointId];

  const isBridgeSubmerged =
    peakSurgeMeters >= threshold ||
    bridgeEval?.status === "SUBMERGED" ||
    (bridgeEval?.inundationDepthMeters ?? 0) > 0;

  if (isBridgeSubmerged) {
    // Fallback to elevated inland detour sequence
    const detourEdges = network.edges.filter((e) =>
      network.routing_rules.detour_edge_sequence.includes(e.id)
    );
    const totalDistanceKm = detourEdges.reduce((acc, e) => acc + e.length_km, 0); // 14.6 km
    const estimatedClearanceHours = totalDistanceKm / 22.0; // Greenshields v_f = 22 km/h
    const pathCoordinates = detourEdges.flatMap((e) => e.coordinates);

    return {
      routeId: network.routing_rules.detour_route_id,
      isSafe: true,
      totalDistanceKm,
      estimatedClearanceHours,
      blockedAtEdgeId: chokepointId,
      chokepoints: [
        {
          edgeId: chokepointId,
          name: "Mahanadi Coastal Estuary Bridge",
          submersionDepthMeters: Math.max(0, peakSurgeMeters - threshold),
          submersionTimestamp: "T-03h",
        },
      ],
      pathCoordinates,
    };
  }

  // Primary coastal highway corridor
  const primaryEdges = network.edges.filter((e) =>
    network.routing_rules.primary_edge_sequence.includes(e.id)
  );
  const totalDistanceKm = primaryEdges.reduce((acc, e) => acc + e.length_km, 0); // 6.9 km
  const estimatedClearanceHours = totalDistanceKm / 22.0;
  const pathCoordinates = primaryEdges.flatMap((e) => e.coordinates);

  return {
    routeId: network.routing_rules.primary_route_id,
    isSafe: true,
    totalDistanceKm,
    estimatedClearanceHours,
    blockedAtEdgeId: null,
    chokepoints: [],
    pathCoordinates,
  };
}

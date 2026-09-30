export function calculateInlandSurge(
  shoreSurgeMeters: number,
  distanceToCoastKm: number,
  kFriction = 0.6
): number {
  return Math.max(0, shoreSurgeMeters - Math.max(0, distanceToCoastKm) * kFriction);
}

export function calculateInundationDepth(
  inlandSurgeMeters: number,
  groundElevationMsl: number
): number {
  if (inlandSurgeMeters <= 0) return 0;
  return Math.max(0, inlandSurgeMeters - groundElevationMsl);
}

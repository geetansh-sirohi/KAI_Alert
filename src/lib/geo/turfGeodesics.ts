import * as turf from "@turf/turf";

export function toLeafletLatLng(coord: [longitude: number, latitude: number]): [latitude: number, longitude: number] {
  return [coord[1], coord[0]];
}

export function toGeoJSONPosition(latitude: number, longitude: number): [longitude: number, latitude: number] {
  return [longitude, latitude];
}

export function calculateGeodesicDistanceKm(from: [number, number], to: [number, number]): number {
  return turf.distance(turf.point(from), turf.point(to), { units: "kilometers" });
}

export function calculateBearing(from: [number, number], to: [number, number]): number {
  return turf.bearing(turf.point(from), turf.point(to));
}

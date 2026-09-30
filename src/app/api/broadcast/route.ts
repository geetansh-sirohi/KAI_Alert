import { NextRequest, NextResponse } from "next/server";
import { generateVernacularAlerts } from "../../../lib/alerts/vernacularTemplates";
import { encodeBPP128, bpp128ToHex, bpp128ToBase64, decodeBPP128 } from "../../../lib/telecom/bpp128";
import cycloneData from "../../../../public/data/cyclone_benchmark_dana.json";
import villageData from "../../../../public/data/odisha_villages.json";
import { calculateInlandSurge } from "../../../lib/physics/surgePhysics";

function boundedInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stepIndex = boundedInteger(searchParams.get("stepIndex"), 4, 0, cycloneData.length - 1);
  const sectorId = boundedInteger(searchParams.get("sectorId"), 402, 0, 65535);

  const storm = cycloneData[stepIndex];
  const suppliedSurge = Number(searchParams.get("surgeMeters"));
  const surgeMeters = Number.isFinite(suppliedSurge) && suppliedSurge >= 0
    ? Math.min(25.5, suppliedSurge)
    : storm.projected_surge_peak_meters;
  const detourActive = surgeMeters >= 2.0;

  // Compute flooded villages & population at risk from odisha_villages.json
  const floodedVillages = villageData.filter((village) => {
    const distToCoastKm = Math.max(0.5, Math.abs(86.72 - village.longitude) * 90);
    const inlandSurge = calculateInlandSurge(surgeMeters, distToCoastKm);
    return inlandSurge > village.elevation_meters;
  });

  const populationAtRisk = floodedVillages.reduce((sum, v) => sum + v.population, 0);
  const hazardBitmap = (floodedVillages.length > 0 ? 0x02 : 0) | (detourActive ? 0x04 : 0);

  const alerts = generateVernacularAlerts(stepIndex, {
    stepIndex,
    surgeMeters,
    safeRouteName: detourActive ? "Inland Highway 5A Detour" : "NH-53 Coastal Highway",
    shelterName: "Kujang Multipurpose Cyclone Shelter (SHEL-01)",
    floodedVillagesCount: floodedVillages.length,
    populationAtRisk,
  });

  const bppPayload = {
    version: 1,
    timeStepIndex: stepIndex,
    sectorId,
    hazardBitmap,
    surgeDecimeters: Math.round(surgeMeters * 10),
    safeRouteId: detourActive ? 12 : 53,
    shelterId: 1,
    populationAtRisk,
  };

  const bppBuffer = encodeBPP128(bppPayload);

  return NextResponse.json({
    alerts,
    bppPayload,
    bpp128Hex: bpp128ToHex(bppBuffer),
    bpp128Base64: bpp128ToBase64(bppBuffer),
    decoded: decodeBPP128(bppBuffer),
  });
}

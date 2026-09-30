"use client";
import React from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { Wind, Gauge, Waves, Navigation, MapPin, AlertTriangle, ShieldAlert } from "lucide-react";

function getBeaufortScale(kmh: number): string {
  if (kmh < 1) return "Calm";
  if (kmh < 6) return "Light Air";
  if (kmh < 12) return "Light Breeze";
  if (kmh < 20) return "Gentle Breeze";
  if (kmh < 29) return "Moderate Breeze";
  if (kmh < 39) return "Fresh Breeze";
  if (kmh < 50) return "Strong Breeze";
  if (kmh < 62) return "High Wind";
  if (kmh < 75) return "Gale Force";
  if (kmh < 89) return "Severe Gale";
  if (kmh < 103) return "Storm Force";
  if (kmh < 118) return "Violent Storm";
  return "Hurricane Force";
}

function formatAviationCoords(lat: number, lon: number): string {
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.round((Math.abs(lat) - latDeg) * 60);
  const latDir = lat >= 0 ? "N" : "S";

  const lonDeg = Math.floor(Math.abs(lon));
  const lonMin = Math.round((Math.abs(lon) - lonDeg) * 60);
  const lonDir = lon >= 0 ? "E" : "W";

  return `${latDeg}°${latMin.toString().padStart(2, "0")}'${latDir} ${lonDeg}°${lonMin.toString().padStart(2, "0")}'${lonDir}`;
}

export function TelemetryBar() {
  const { timeSteps, currentTimeStepIndex, searchedLocation, assetEvaluations } = useDisasterStore();
  const storm = timeSteps[currentTimeStepIndex];

  const totalBreaches = Object.values(assetEvaluations).filter(
    (a) => a.status === "CRITICAL_POWER_BREACH" || a.status === "SUBMERGED" || a.status === "STRUCTURAL_COLLAPSE"
  ).length;

  // Use searched location live data if available, otherwise benchmark storm data
  const windSpeed = searchedLocation?.liveWind ?? storm.max_sustained_wind_kmh;
  const pressure = searchedLocation?.livePressure ?? storm.central_pressure_hpa;
  const gusts = searchedLocation?.liveGusts;
  const elevation = searchedLocation?.elevation ?? 4;
  const lat = searchedLocation?.lat ?? storm.latitude;
  const lon = searchedLocation?.lon ?? storm.longitude;

  const beaufortTag = getBeaufortScale(windSpeed);
  const coordsFormatted = formatAviationCoords(lat, lon);

  const floodRisk =
    searchedLocation
      ? elevation <= 5
        ? "HIGH SURGE RISK"
        : elevation <= 15
        ? "MODERATE SURGE RISK"
        : elevation <= 50
        ? "LOW INLAND RISK"
        : "MINIMAL FLOOD RISK"
      : storm.projected_surge_peak_meters > 2.5
      ? "CRITICAL SURGE"
      : "MODERATE SURGE";

  return (
    <div className="h-11 border-b border-[#383838]/20 px-4 flex items-center justify-between text-xs font-mono bg-[#FAF7F0]/90 backdrop-blur-md shadow-xs select-none cockpit-hud">
      <div className="flex items-center gap-5 overflow-x-auto scrollbar-none py-1">
        {/* Target Badge if custom location searched */}
        {searchedLocation ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-semibold shrink-0 animate-pulse">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span className="truncate max-w-[150px]">🎯 TARGET: {searchedLocation.name.split(",")[0]}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>BENCHMARK: CYCLONE DANA</span>
          </div>
        )}

        {/* Wind Speed Dial */}
        <div className="flex items-center gap-2 shrink-0">
          <Wind className="w-4 h-4 text-amber-500" />
          <span className="text-slate-500">WIND:</span>
          <strong className="text-slate-900 font-bold">{windSpeed} km/h</strong>
          {gusts !== undefined && (
            <span className="text-slate-500 text-[10px]">(Gusts: {gusts} km/h)</span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-sans font-medium">
            {beaufortTag}
          </span>
        </div>

        {/* Barometric Pressure Dial */}
        <div className="flex items-center gap-2 shrink-0">
          <Gauge className="w-4 h-4 text-blue-600" />
          <span className="text-slate-500">PRESSURE:</span>
          <strong className="text-slate-900 font-bold">{pressure} hPa</strong>
          <span className="text-slate-400 text-[10px] hidden sm:inline">MSL Trend</span>
        </div>

        {/* Surge / Elevation Dial */}
        <div className="flex items-center gap-2 shrink-0">
          <Waves className="w-4 h-4 text-cyan-600" />
          <span className="text-slate-500">ELEV / SURGE:</span>
          <strong className="text-slate-900 font-bold">
            {searchedLocation ? `${elevation}m MSL` : `${storm.projected_surge_peak_meters.toFixed(2)}m MSL`}
          </strong>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
              floodRisk.includes("HIGH") || floodRisk.includes("CRITICAL")
                ? "bg-red-100 text-red-700"
                : floodRisk.includes("MODERATE")
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {floodRisk}
          </span>
        </div>

        {/* Aviation Coordinates */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-600 shrink-0 border-l border-slate-200 pl-4">
          <Navigation className="w-3.5 h-3.5 text-slate-400" />
          <span>FIX: {coordsFormatted}</span>
        </div>
      </div>

      {/* Right side: Civil breaches status */}
      <div className="hidden md:flex items-center gap-4 shrink-0 border-l border-slate-200 pl-4">
        <div className="flex items-center gap-1.5 text-red-600 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>BREACHES: {totalBreaches}</span>
        </div>
      </div>
    </div>
  );
}


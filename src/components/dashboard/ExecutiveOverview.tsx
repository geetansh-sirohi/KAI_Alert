"use client";
import React, { useState } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { ShieldCheck, AlertTriangle, Activity, Navigation, Radio, Camera, ChevronRight, X, Layers, Cpu } from "lucide-react";
import { CriticalAsset } from "../../lib/types/disaster";

export function ExecutiveOverview() {
  const {
    assets,
    assetEvaluations,
    activeEvacuationRoute,
    timeSteps,
    currentTimeStepIndex,
    searchedLocation,
    setDroneModalOpen,
    setBroadcastModalOpen,
    setActiveTab,
  } = useDisasterStore();

  const [inspectAsset, setInspectAsset] = useState<CriticalAsset | null>(null);

  const storm = timeSteps[currentTimeStepIndex];

  const totalAssets = assets.length;
  const compromisedAssets = assets.filter((asset) => {
    const ev = assetEvaluations[asset.id];
    return ev && ev.status !== "OPERATIONAL";
  });

  const operationalCount = totalAssets - compromisedAssets.length;
  const systemHealthPct = Math.round((operationalCount / totalAssets) * 100);

  const wind = searchedLocation?.liveWind ?? storm.max_sustained_wind_kmh;
  const pressure = searchedLocation?.livePressure ?? storm.central_pressure_hpa;
  const surge = searchedLocation ? searchedLocation.elevation : storm.projected_surge_peak_meters;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#FAF7F0] text-[#0A0A0A] space-y-6">
      {/* Executive Hero Banner */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#383838]">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KAI ALERT CIVIL DEFENSE ACTIVE</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-sans text-white">
            {searchedLocation ? `Target Theater: ${searchedLocation.name}` : "Odisha Coastal Civil Defense Theater"}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Autonomous hyper-local disaster assessment, wind shear forecasting, and civil evacuation corridor monitoring.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setDroneModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Camera className="w-4 h-4 text-sky-400" />
            <span>Drone Triage</span>
          </button>
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>Radio Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab("MAP")}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <span>Open Map View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Key Executive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: System Health */}
        <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#E2DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="font-semibold uppercase tracking-wider">SYSTEM HEALTH</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{systemHealthPct}%</span>
            <span className="text-xs text-slate-500 font-sans font-medium">({operationalCount}/{totalAssets} Nominal)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${systemHealthPct}%` }} />
          </div>
        </div>

        {/* Metric 2: Live Wind Speed */}
        <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#E2DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="font-semibold uppercase tracking-wider">TELEMETRY WIND</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{wind} <span className="text-sm font-sans font-normal text-slate-500">km/h</span></span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold">{pressure} hPa</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">Barometric trend: MSL Hydrodynamic vector</p>
        </div>

        {/* Metric 3: Active Alerts */}
        <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#E2DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="font-semibold uppercase tracking-wider">CIVIL BREACHES</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600 font-mono">{compromisedAssets.length}</span>
            <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-sans font-bold">Action Required</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">Infrastructure failure breaches logged</p>
        </div>

        {/* Metric 4: Evacuation Corridor */}
        <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#E2DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="font-semibold uppercase tracking-wider">EVACUATION ROUTE</span>
            <Navigation className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {activeEvacuationRoute?.totalDistanceKm.toFixed(1) ?? 14.6} <span className="text-sm font-sans font-normal text-slate-500">km</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono font-bold">
              {activeEvacuationRoute?.estimatedClearanceHours.toFixed(1) ?? 0.7}h Clear
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans truncate">
            {activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR" ? "Inland Detour Engaged" : "Primary Corridor Clear"}
          </p>
        </div>
      </div>

      {/* Simple Human Language Status Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">Infrastructure Status Summary</h2>
            <p className="text-xs text-slate-500 font-sans">Simplified overview of critical services. Click any card for detailed engineering telemetry.</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Click card for 🔬 Technical Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const ev = assetEvaluations[asset.id];
            const isOperational = !ev || ev.status === "OPERATIONAL";
            const isCritical = ev?.status === "CRITICAL_POWER_BREACH" || ev?.status === "SUBMERGED" || ev?.status === "STRUCTURAL_COLLAPSE";

            return (
              <div
                key={asset.id}
                onClick={() => setInspectAsset(asset)}
                className={`p-4 rounded-2xl border bg-[#FAF5ED] cursor-pointer transition-all hover:shadow-md space-y-3 ${
                  isOperational
                    ? "border-[#E2DCCF] hover:border-emerald-300"
                    : isCritical
                    ? "border-red-200 hover:border-red-400 bg-gradient-to-br from-red-50/30 to-[#FAF5ED]"
                    : "border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50/30 to-[#FAF5ED]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-sans tracking-tight">{asset.name}</h3>
                    <span className="text-[11px] text-slate-500 font-mono uppercase">{asset.category}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isOperational
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isCritical
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isOperational ? "Operational" : isCritical ? "Alert: Action Needed" : "Warning"}
                  </span>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isOperational ? (
                    <p className="text-emerald-700 font-medium">✓ Facility operating nominally. Backup generators on standby.</p>
                  ) : (
                    <p className="font-medium text-slate-800">{ev.failureReason}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E2DCCF] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Ground MSL: {asset.ground_elevation_msl.toFixed(1)}m</span>
                  <span className="text-sky-600 font-sans font-semibold flex items-center gap-1">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Telemetry Inspector Modal (Progressive Disclosure) */}
      {inspectAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FAF7F0] border border-[#383838]/30 rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCCF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center shadow-xs">
                  <Cpu className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-sans">{inspectAsset.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Technical Telemetry & Physics Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setInspectAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF5ED] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E2DCCF] space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold block">HYDRAULIC & WIND SPECS</span>
                <div className="grid grid-cols-2 gap-3 text-slate-800">
                  <div>• Ground MSL: <strong>{inspectAsset.ground_elevation_msl.toFixed(1)}m</strong></div>
                  <div>• Coast Distance: <strong>{inspectAsset.distance_to_coast_km} km</strong></div>
                  <div>• Plinth Height: <strong>{inspectAsset.critical_specs.plinth_height_meters}m</strong></div>
                  <div>• Power Type: <strong>{inspectAsset.critical_specs.backup_power_type}</strong></div>
                </div>
              </div>

              {assetEvaluations[inspectAsset.id] && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 space-y-1 font-sans">
                  <strong className="block text-red-900 font-mono uppercase text-[10px]">Vulnerability Evaluation:</strong>
                  <p className="leading-relaxed text-xs">{assetEvaluations[inspectAsset.id].failureReason}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#0A0A0A] text-white space-y-2">
                <span className="text-[10px] text-sky-400 uppercase tracking-wider font-sans font-bold block">NDRF DISPATCH DIRECTIVE</span>
                <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                  Deploy SDRF battalion with 500kW mobile generator truck and inflatable combat boats. Establish perimeter flood barrier at plinth boundary.
                </p>
              </div>
            </div>

            <button
              onClick={() => setInspectAsset(null)}
              className="w-full py-2.5 rounded-xl bg-[#0A0A0A] text-white font-bold text-xs hover:bg-black transition-colors shadow-sm"
            >
              Close Technical Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

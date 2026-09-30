"use client";
import React, { useState } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import {
  Wind,
  Gauge,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Radio,
  Camera,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowRight,
  Info,
  CheckCircle2,
  CloudSun,
} from "lucide-react";

export function OverviewDashboard() {
  const {
    timeSteps,
    currentTimeStepIndex,
    assetEvaluations,
    assets,
    setActiveTab,
    setDroneModalOpen,
    setBroadcastModalOpen,
    setSelectedAssetId,
    userLiveLocation,
    searchedLocation,
    isSimulationMode,
    activeEvacuationRoute,
  } = useDisasterStore();

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const storm = timeSteps[currentTimeStepIndex];

  // Determine current active location data
  const locationName = searchedLocation
    ? searchedLocation.name
    : userLiveLocation
    ? `${userLiveLocation.city}, ${userLiveLocation.country}`
    : "Current Location";

  const liveWind = searchedLocation?.liveWind ?? (isSimulationMode ? storm.max_sustained_wind_kmh : userLiveLocation?.liveWind ?? 14);
  const livePressure = searchedLocation?.livePressure ?? (isSimulationMode ? storm.central_pressure_hpa : userLiveLocation?.livePressure ?? 1012);
  const elevation = searchedLocation?.elevation ?? (isSimulationMode ? 4 : userLiveLocation?.elevation ?? 12);
  const temp = searchedLocation?.temperature ?? userLiveLocation?.temperature ?? 28;

  // Active hazard check: ONLY true if simulation mode is ON or severe live wind/pressure drop detected
  const isHazardous = isSimulationMode || liveWind > 50;
  const routeIsDetour = activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR";
  const pressureDeficitPa = Math.max(0, Math.round((1013.25 - storm.central_pressure_hpa) * 100));

  const totalBreaches = Object.values(assetEvaluations).filter(
        (a) => a.status === "CRITICAL_POWER_BREACH" || a.status === "SUBMERGED" || a.status === "STRUCTURAL_COLLAPSE"
      ).length;
  const criticalAssetNames = assets
    .filter((asset) => {
      const status = assetEvaluations[asset.id]?.status;
      return status === "CRITICAL_POWER_BREACH" || status === "SUBMERGED" || status === "STRUCTURAL_COLLAPSE";
    })
    .slice(0, 2)
    .map((asset) => asset.name);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto space-y-7 font-sans bg-[#FAF7F0] text-[#0A0A0A] select-none">
      {/* 1. CLEAN HUMAN GREETING HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
            Good day, Welcome to KAI Alert
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Weather observations and benchmark assessments for{" "}
            <span className="font-bold text-[#0A0A0A]">{locationName}</span>.
          </p>
        </div>
      </div>

      {/* 2. 100% CONSISTENT SAFETY STATUS BANNER (NO CONTRADICTIONS!) */}
      {!isHazardous ? (
        <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] bg-[#FAF7F0] px-3 py-1 rounded-full border border-emerald-300">
                STATUS: NO SEVERE WEATHER SIGNAL
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#14532D] font-mono font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Location: {locationName}</span>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-[#052E16] tracking-tight">
            Conditions currently below the severe-wind threshold
          </h2>

          <p className="text-xs md:text-sm text-[#14532D] leading-relaxed max-w-4xl mt-1 font-medium">
            Reported wind is <strong>{liveWind} km/h</strong> and pressure is <strong>{livePressure} hPa</strong>. These local weather readings do not verify the operational status of every facility or road.
          </p>
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-[#FAF7F0] px-3 py-1 rounded-full border border-rose-300">
                {isSimulationMode ? "CYCLONE DANA BENCHMARK REPLAY" : "ELEVATED LOCAL WIND OBSERVATION"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-rose-700 font-mono font-bold">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Target Region: Paradip & Coastal Odisha</span>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-rose-950 tracking-tight">
            {isSimulationMode ? `Cyclone Dana benchmark · ${storm.time_step}` : `Local wind observation · ${locationName}`}
          </h2>

          <p className="text-xs md:text-sm text-rose-900 leading-relaxed max-w-4xl mt-1 font-medium">
            {isSimulationMode ? <>Benchmark winds of <strong>{storm.max_sustained_wind_kmh} km/h</strong> and modeled surge of <strong>{storm.projected_surge_peak_meters.toFixed(2)}m</strong>. Route assessment: <strong>{routeIsDetour ? "inland detour active" : "primary corridor"}</strong>.</> : <>Reported local wind is <strong>{liveWind} km/h</strong>. The Dana track below is a historical benchmark, not a live cyclone forecast.</>}
          </p>

          <div className="mt-3 pt-3 border-t border-rose-200/80">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-2 text-xs font-bold text-rose-800 hover:text-rose-950 transition-colors"
            >
              <Info className="w-4 h-4 text-rose-700" />
              <span>{showTechnicalDetails ? "Hide Technical Diagnostics" : "🔬 View Technical Diagnostics"}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 bg-[#FAF7F0] border border-rose-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Holland-B Pressure</span>
                  <div className="text-slate-900 font-bold text-sm">ΔP: {pressureDeficitPa.toLocaleString()} Pa</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">SLOSH Inland Surge</span>
                  <div className="text-slate-900 font-bold text-sm">S₀: {storm.projected_surge_peak_meters.toFixed(2)}m MSL</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Evacuation route</span>
                  <div className="text-slate-900 font-bold text-sm">{routeIsDetour ? "Inland detour" : "Primary corridor"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Assessment basis</span>
                  <div className="text-slate-900 font-bold text-sm">{isSimulationMode ? "Dana benchmark" : "Local weather + benchmark"}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FOUR WARM PEACH CARDS (GREEN FOR SAFE, RED ONLY FOR WARNING!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Live Wind Speed */}
        <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-600">Live Wind Speed</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F0] text-[#0A0A0A] flex items-center justify-center border border-[#383838]/20">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">{liveWind} km/h</div>
            <div className="text-xs text-slate-600 font-semibold mt-1">
              {liveWind < 20 ? "Light Breeze • Safe" : liveWind < 60 ? "Fresh Breeze • Normal" : "Severe Storm Wind"}
            </div>
          </div>
        </div>

        {/* Card 2: Air Pressure */}
        <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-600">Air Pressure</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F0] text-[#0A0A0A] flex items-center justify-center border border-[#383838]/20">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">{livePressure} hPa</div>
            <div className="text-xs text-slate-600 font-semibold mt-1">
              {livePressure > 1000 ? "Normal Atmospheric Pressure" : "Low Pressure Storm Center"}
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Centers & Risk (GREEN IF SAFE, RED IF HAZARD) */}
        <div
          className={`border rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all hover:scale-[1.01] ${
            isHazardous && totalBreaches > 0
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              {totalBreaches > 0 ? "Infrastructure Risk" : "Modeled Breaches"}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F0] flex items-center justify-center border border-[#383838]/20">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              {totalBreaches > 0 ? `${totalBreaches} At Risk` : "0 Modeled"}
            </div>
            <div className="text-xs font-bold mt-1">
              {totalBreaches > 0
                ? criticalAssetNames.join(" · ") + (totalBreaches > criticalAssetNames.length ? " · More" : "")
                : "No breach in the modeled benchmark at this time step"}
            </div>
          </div>
        </div>

        {/* Card 4: Temperature & Elevation */}
        <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-600">Elevation & Temp</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F0] text-[#0A0A0A] flex items-center justify-center border border-[#383838]/20">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">{temp}°C • {elevation}m</div>
            <div className="text-xs text-slate-600 font-semibold mt-1">
              Ground Elevation MSL • Comfortable
            </div>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN UN-CLUTTERED LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Interactive GIS Map Card */}
        <div className="lg:col-span-5 bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-base">Tactical GIS & Satellite Map</h3>
                <p className="text-xs text-slate-600 mt-0.5">Real-time GIS map, wind radius & emergency routes</p>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-[#0A0A0A] text-[#F0F0F0] font-mono font-bold rounded-full">
                LIVE GIS
              </span>
            </div>

            {/* Static Clean Preview */}
            <div
              onClick={() => setActiveTab("MAP")}
              className="relative w-full h-56 bg-slate-200 rounded-2xl overflow-hidden cursor-pointer group border border-[#383838]/20"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Map preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center text-white">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F0]/20 backdrop-blur-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-base">Launch Full GIS Tactical Map</div>
                <p className="text-xs text-slate-200 max-w-xs mt-1">
                  View interactive satellite imagery, wind radius cones, and hospital coordinates
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("MAP")}
            className="w-full mt-5 py-3 rounded-full bg-[#000000] text-[#F0F0F0] hover:bg-[#0A0A0A] transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
          >
            Launch Interactive Map <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Civil Infrastructure Feed */}
        <div className="lg:col-span-7 bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-base">Civil Infrastructure & Emergency Shelters</h3>
                <p className="text-xs text-slate-600 mt-0.5">Plain-language status of regional emergency centers</p>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Infrastructure List */}
            <div className="space-y-3">
              {assets.slice(0, 4).map((asset) => {
                const ev = assetEvaluations[asset.id];
                const isBreached = ev && ev.status !== "OPERATIONAL";

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAssetId(asset.id);
                      setActiveTab("MAP");
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isBreached
                        ? "bg-rose-50/80 border-rose-300 hover:border-rose-500"
                        : "bg-[#FAF7F0] border-[#383838]/20 hover:border-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isBreached ? "bg-rose-100 text-rose-700" : "bg-[#DCFCE7] text-[#14532D]"
                        }`}
                      >
                        {isBreached ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#0A0A0A]">{asset.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">({asset.category})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {isBreached
                            ? `${ev.failureReason ?? ev.status} • modeled water ${ev.inundationDepthMeters.toFixed(2)}m`
                            : `No modeled breach • Elevation ${asset.ground_elevation_msl.toFixed(1)}m MSL • verify with field telemetry.`}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isBreached ? "bg-rose-200 text-rose-900" : "bg-[#DCFCE7] text-[#14532D]"
                      }`}
                    >
                      {isBreached ? "REVIEW" : "NO BREACH"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Tools Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#383838]/20">
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#383838]/20 hover:bg-[#F2ECE1] transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-amber-400 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0A0A0A]">Broadcast Warning Siren</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Send Odia, Bengali & Hindi warnings</p>
              </div>
            </button>

            <button
              onClick={() => setDroneModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#383838]/20 hover:bg-[#F2ECE1] transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-sky-400 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0A0A0A]">Drone Vision Triage</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Upload photos for damage inspection</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

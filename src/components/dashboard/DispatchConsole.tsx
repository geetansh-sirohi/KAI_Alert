"use client";
import React, { useState } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import {
  Radio,
  Send,
  Volume2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Users,
  Navigation,
  CheckCircle2,
  History,
  FileCode,
} from "lucide-react";
import { generateVernacularAlerts } from "../../lib/alerts/vernacularTemplates";
import { encodeBPP128, bpp128ToHex, bpp128ToBase64, decodeBPP128 } from "../../lib/telecom/bpp128";
import { playBPP128AfskAudio } from "../../lib/radio/afskModulator";

export function DispatchConsole() {
  const {
    timeSteps,
    currentTimeStepIndex,
    activeEvacuationRoute,
    getFloodedVillages,
    getPopulationAtRisk,
    getHazardBitmap,
    addDispatchLog,
    dispatchLogs,
  } = useDisasterStore();

  const [activeLanguage, setActiveLanguage] = useState<"odia" | "hindi" | "english" | "bengali">("odia");
  const [copied, setCopied] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAfskPlaying, setIsAfskPlaying] = useState(false);
  const [showAdvancedBpp, setShowAdvancedBpp] = useState(false);

  const currentStorm = timeSteps[currentTimeStepIndex];
  const floodedVillages = getFloodedVillages();
  const populationAtRisk = getPopulationAtRisk();
  const hazardBitmap = getHazardBitmap();

  const routeName = activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR"
    ? "Inland Highway 5A Detour (NH-5A)"
    : "Primary Coastal Highway (NH-53)";

  const shelterName = "Kujang Multipurpose Cyclone Shelter (SHEL-01)";
  const surgeMeters = currentStorm.projected_surge_peak_meters;
  const isBridgeBlocked = !!activeEvacuationRoute?.blockedAtEdgeId;

  // Generate dynamic vernacular alerts
  const alerts = generateVernacularAlerts(currentTimeStepIndex, {
    stepIndex: currentTimeStepIndex,
    surgeMeters,
    safeRouteName: routeName,
    shelterName,
    floodedVillagesCount: floodedVillages.length,
    populationAtRisk,
  });

  const bppPayload = {
    version: 1,
    timeStepIndex: currentTimeStepIndex,
    sectorId: 402,
    hazardBitmap,
    surgeDecimeters: Math.round(surgeMeters * 10),
    safeRouteId: activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR" ? 12 : 53,
    shelterId: 1,
    populationAtRisk,
  };

  const bppBuffer = encodeBPP128(bppPayload);
  const bppHex = bpp128ToHex(bppBuffer);
  const bppBase64 = bpp128ToBase64(bppBuffer);
  const decodedBpp = decodeBPP128(bppBuffer);

  const handleAuthorizeDispatch = () => {
    const activeText = alerts[activeLanguage];
    void navigator.clipboard.writeText(activeText);

    addDispatchLog({
      timeStepIndex: currentTimeStepIndex,
      timeStepName: currentStorm.time_step,
      language: activeLanguage.toUpperCase(),
      targetVillagesCount: floodedVillages.length,
      populationAtRisk,
      routeName,
      shelterName,
      bppHex,
      smsText: activeText,
    });

    setDispatchedSuccess(true);
    setTimeout(() => setDispatchedSuccess(false), 4000);
  };

  const handleSpeechBroadcast = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const text = alerts[activeLanguage];
    const utterance = new SpeechSynthesisUtterance(text);

    if (activeLanguage === "hindi") utterance.lang = "hi-IN";
    else if (activeLanguage === "bengali") utterance.lang = "bn-IN";
    else if (activeLanguage === "odia") utterance.lang = "or-IN";
    else utterance.lang = "en-US";

    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAfsk = () => {
    playBPP128AfskAudio(bppBuffer);
    setIsAfskPlaying(true);
    setTimeout(() => setIsAfskPlaying(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto space-y-7 font-sans bg-[#FAF7F0] text-[#0A0A0A] select-none">
      {/* 1. Header & Situation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
              Ward Civil Emergency Dispatch Console
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Physics-driven alert drafting, field review, and BPP-128 radio packet preparation for the benchmark sector.
          </p>
        </div>

        {dispatchedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-2xl font-bold text-xs shadow-md animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>ALERT COPIED & AUTHORIZATION LOGGED LOCALLY</span>
          </div>
        )}
      </div>

      {/* 2. Situation Strip from Store */}
      <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-5 shadow-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Time Step</span>
          <strong className="text-slate-900 font-extrabold text-sm">{currentStorm.time_step}</strong>
        </div>

        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Surge Peak</span>
          <strong className="text-slate-900 font-extrabold text-sm">{surgeMeters.toFixed(2)}m MSL</strong>
        </div>

        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Chokepoint Bridge</span>
          <span className={`font-bold text-xs ${isBridgeBlocked ? "text-rose-700" : "text-emerald-700"}`}>
            {isBridgeBlocked ? "BRG-01 Submerged" : "BRG-01 Clear"}
          </span>
        </div>

        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Safe Corridor</span>
          <span className="font-bold text-xs text-sky-800 truncate block" title={routeName}>
            {activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR" ? "Inland Detour" : "Primary Coastal"}
          </span>
        </div>

        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Assigned Shelter</span>
          <span className="font-bold text-xs text-amber-800 truncate block">SHEL-01 Kujang</span>
        </div>

        <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/10">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Pop. At Risk</span>
          <strong className="text-rose-700 font-extrabold text-sm">{populationAtRisk.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      {/* 3. Main Grid: Left Target Villages + Right Vernacular SMS Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Targeted Flooded Villages Table */}
        <div className="lg:col-span-5 bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-600" /> Target Inundated Wards
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Villages with elevation &lt; inland surge height ({floodedVillages.length} active)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {floodedVillages.length} Flooded
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {floodedVillages.length === 0 ? (
                <div className="p-6 text-center text-xs text-emerald-800 font-semibold bg-[#DCFCE7] rounded-2xl border border-[#86EFAC]">
                  No village intersects the modeled surge at this replay step. This is not an all-clear; follow official local guidance.
                </div>
              ) : (
                floodedVillages.map((v) => (
                  <div
                    key={v.census_code}
                    className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#0A0A0A] flex items-center gap-2">
                        <span>{v.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({v.vernacular_name})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        Elev: <strong>{v.elevation_meters}m</strong> • Pop: <strong>{v.population.toLocaleString("en-IN")}</strong> • Kutcha: <strong>{v.kutcha_houses}</strong>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono text-[10px] font-bold rounded-full shrink-0">
                      INUNDATED
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Summary Footnote */}
          <div className="pt-3 border-t border-[#383838]/20 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Total Kutcha Houses Threatened:</span>
            <strong className="text-slate-900 font-bold font-mono">
              {floodedVillages.reduce((sum, v) => sum + v.kutcha_houses, 0).toLocaleString("en-IN")} Units
            </strong>
          </div>
        </div>

        {/* Right Column: Vernacular Multilingual SMS Generator & Action Bar */}
        <div className="lg:col-span-7 bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-base">Vernacular SMS & Radio Broadcast Draft</h3>
                <p className="text-xs text-slate-600 mt-0.5">Live interpolated emergency alert text</p>
              </div>

              {/* Language Selector */}
              <div className="flex border border-[#383838]/20 rounded-2xl p-1 bg-[#FAF7F0] text-xs font-bold gap-1">
                <button
                  onClick={() => setActiveLanguage("odia")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    activeLanguage === "odia" ? "bg-[#0A0A0A] text-[#F0F0F0]" : "text-slate-600 hover:text-black"
                  }`}
                >
                  ଓଡ଼ିଆ
                </button>
                <button
                  onClick={() => setActiveLanguage("hindi")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    activeLanguage === "hindi" ? "bg-[#0A0A0A] text-[#F0F0F0]" : "text-slate-600 hover:text-black"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setActiveLanguage("english")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    activeLanguage === "english" ? "bg-[#0A0A0A] text-[#F0F0F0]" : "text-slate-600 hover:text-black"
                  }`}
                >
                  ENG
                </button>
                <button
                  onClick={() => setActiveLanguage("bengali")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    activeLanguage === "bengali" ? "bg-[#0A0A0A] text-[#F0F0F0]" : "text-slate-600 hover:text-black"
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Broadcast Copy Box */}
            <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#383838]/30 text-sm text-[#0A0A0A] leading-relaxed font-sans font-semibold min-h-[110px] relative shadow-2xs">
              {alerts[activeLanguage]}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(alerts[activeLanguage]);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-3 right-3 p-2 bg-[#FAF5ED] hover:bg-[#EAE2D4] rounded-xl border border-[#383838]/20 text-slate-700 transition-colors"
                title="Copy SMS text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSpeechBroadcast}
              className={`py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                isSpeaking
                  ? "bg-amber-500 text-black border-amber-600 animate-pulse"
                  : "bg-[#FAF7F0] text-[#0A0A0A] border-[#383838]/30 hover:bg-[#F2ECE1]"
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>{isSpeaking ? "Speaking Audio Broadcast..." : "🔊 Speak Vernacular Broadcast"}</span>
            </button>

            <button
              onClick={handleAuthorizeDispatch}
              className="py-3.5 px-4 rounded-full bg-[#0A0A0A] text-[#F0F0F0] hover:bg-black font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all scale-[1.01]"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Authorize & Log Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Collapsible Advanced BPP-128 Payload Inspector (PRD requirement 2) */}
      <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs">
        <button
          onClick={() => setShowAdvancedBpp(!showAdvancedBpp)}
          className="w-full flex items-center justify-between font-bold text-xs text-[#0A0A0A] hover:text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2 font-mono">
            <FileCode className="w-4 h-4 text-amber-500" />
            <span>ADVANCED: BPP-128 TACTICAL RADIO PACKET INSPECTOR (RFC PACKET CHANNEL)</span>
          </div>
          {showAdvancedBpp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedBpp && (
          <div className="mt-4 pt-4 border-t border-[#383838]/20 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20">
                <span className="text-[10px] text-slate-500 block font-sans font-bold">14-Byte Hex String</span>
                <span className="font-extrabold text-slate-900 text-sm break-all">{bppHex}</span>
              </div>
              <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20">
                <span className="text-[10px] text-slate-500 block font-sans font-bold">Base64 Encoded</span>
                <span className="font-extrabold text-slate-900 text-sm break-all">{bppBase64}</span>
              </div>
              <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Modem Audio Siren</span>
                  <span className="text-slate-900 font-bold text-xs">Bell 202 AFSK 1200 Baud</span>
                </div>
                <button
                  onClick={handlePlayAfsk}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    isAfskPlaying ? "bg-amber-500 text-black animate-pulse" : "bg-[#0A0A0A] text-white hover:bg-black"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Decoded Field Table */}
            <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-slate-800 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Version</span>
                <strong className="text-slate-900">{decodedBpp.version}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Step Index</span>
                <strong className="text-slate-900">{decodedBpp.timeStepIndex}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Sector ID</span>
                <strong className="text-slate-900">{decodedBpp.sectorId}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Hazard Bitmap</span>
                <strong className="text-rose-700 font-bold">0x{decodedBpp.hazardBitmap.toString(16).toUpperCase()}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Surge Peak</span>
                <strong className="text-slate-900">{(decodedBpp.surgeDecimeters / 10).toFixed(1)}m</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Route / Shelter</span>
                <strong className="text-sky-800">R{decodedBpp.safeRouteId} / S{decodedBpp.shelterId}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Population</span>
                <strong className="text-slate-900">{decodedBpp.populationAtRisk.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Dispatch Authorization Logs History */}
      {dispatchLogs.length > 0 && (
        <div className="bg-[#FAF5ED] border border-[#383838]/20 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-[#0A0A0A] text-base flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" /> Authorized Dispatch Audit Log
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
            {dispatchLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#383838]/20 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-[#0A0A0A] flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0A0A0A] text-amber-400 rounded-md text-[10px]">
                      {log.language}
                    </span>
                    <span>{log.timeStepName}</span>
                    <span className="text-slate-400 text-[10px]">({log.timestamp})</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5 truncate max-w-xl font-sans">
                    {log.smsText}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-700 font-bold block">{log.targetVillagesCount} Wards Target</span>
                  <span className="text-[10px] text-slate-400">{log.populationAtRisk} Pop.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

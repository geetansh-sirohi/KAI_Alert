"use client";
import React, { useState } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { X, Copy, Radio, Check, Volume2 } from "lucide-react";
import { generateVernacularAlerts } from "../../lib/alerts/vernacularTemplates";
import { encodeBPP128, bpp128ToHex, bpp128ToBase64 } from "../../lib/telecom/bpp128";
import { playBPP128AfskAudio } from "../../lib/radio/afskModulator";

export function VernacularBroadcastModal() {
  const {
    isBroadcastModalOpen,
    setBroadcastModalOpen,
    currentTimeStepIndex,
    timeSteps,
    activeEvacuationRoute,
    getPopulationAtRisk,
    getHazardBitmap,
    getFloodedVillages,
  } = useDisasterStore();
  const [copied, setCopied] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [populationAtRisk, setPopulationAtRisk] = useState("");
  const [packetFormat, setPacketFormat] = useState<"hex" | "base64">("hex");
  const [activeTab, setActiveTab] = useState<"odia" | "hindi" | "english">("odia");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  if (!isBroadcastModalOpen) return null;

  const storm = timeSteps[currentTimeStepIndex];
  const routeIsDetour = activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR";
  const villagesAtRisk = getFloodedVillages();
  const confirmedHeadcount = Number(populationAtRisk) || getPopulationAtRisk();
  const alerts = generateVernacularAlerts(currentTimeStepIndex, {
    stepIndex: currentTimeStepIndex,
    surgeMeters: storm.projected_surge_peak_meters,
    safeRouteName: routeIsDetour ? "Inland Highway 5A Detour" : "Primary Coastal Highway",
    shelterName: "Kujang Multipurpose Cyclone Shelter (SHEL-01)",
    floodedVillagesCount: villagesAtRisk.length,
    populationAtRisk: confirmedHeadcount,
  });
  const hazardBitmap = getHazardBitmap();
  const bppBuffer = encodeBPP128({
    version: 1,
    timeStepIndex: currentTimeStepIndex,
    sectorId: 402,
    hazardBitmap,
    surgeDecimeters: Math.min(255, Math.round(storm.projected_surge_peak_meters * 10)),
    safeRouteId: routeIsDetour ? 12 : 53,
    shelterId: 1,
    populationAtRisk: confirmedHeadcount,
  });
  const bppHex = bpp128ToHex(bppBuffer);
  const bppBase64 = bpp128ToBase64(bppBuffer);
  const packetText = packetFormat === "hex" ? bppHex : bppBase64;

  const handlePlayAudio = () => {
    void playBPP128AfskAudio(bppBuffer);
    setIsAudioPlaying(true);
    setTimeout(() => setIsAudioPlaying(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#383838]/30 bg-[#FAF7F0] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#383838]/20 bg-[#0A0A0A] p-4 text-[#F0F0F0]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#383838] bg-[#141414]"><Radio className="h-4 w-4 text-amber-400" /></div>
            <div><h3 className="text-xs font-bold">Vernacular & Offline Broadcast</h3><p className="font-mono text-[10px] text-slate-400">Civilian copy + tactical radio frame</p></div>
          </div>
          <button onClick={() => setBroadcastModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-[#141414] hover:text-white" title="Close broadcast composer"><X className="h-4 w-4" /></button>
        </div>

        <div className="max-h-[min(80vh,720px)] space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-600">
            <span>{storm.time_step} · Surge {storm.projected_surge_peak_meters.toFixed(1)} m</span>
            <span className={routeIsDetour ? "font-bold text-amber-800" : "font-bold text-emerald-800"}>{routeIsDetour ? "INLAND DETOUR" : "PRIMARY CORRIDOR"}</span>
          </div>

          <div className="flex gap-2 border-b border-[#383838]/20 text-xs font-bold">
            {(["odia", "hindi", "english"] as const).map((language) => (
              <button key={language} onClick={() => setActiveTab(language)} className={`border-b-2 px-3 pb-2 capitalize ${activeTab === language ? "border-[#0A0A0A] text-[#0A0A0A]" : "border-transparent text-slate-500"}`}>
                {language === "odia" ? "ଓଡ଼ିଆ" : language === "hindi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#383838]/20 bg-[#FAF5ED] p-4 text-xs font-semibold leading-relaxed text-[#0A0A0A]">
            <div>{alerts[activeTab]}</div>
            <button onClick={() => { void navigator.clipboard.writeText(alerts[activeTab]); setCopiedAlert(true); setTimeout(() => setCopiedAlert(false), 2000); }} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-800 hover:text-sky-950">
              {copiedAlert ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copiedAlert ? "Alert copied" : "Copy civilian alert"}
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-500">14-byte BPP-128 tactical packet</span>
              <div className="flex gap-1" aria-label="Packet encoding">
                {(["hex", "base64"] as const).map((format) => <button key={format} onClick={() => setPacketFormat(format)} className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${packetFormat === format ? "bg-[#0A0A0A] text-white" : "bg-[#FAF5ED] text-slate-600"}`}>{format}</button>)}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#383838]/20 bg-[#FAF5ED] p-3">
              <span className="truncate font-extrabold text-[#0A0A0A]">{packetText}</span>
              <button onClick={() => { void navigator.clipboard.writeText(packetText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 shrink-0 rounded-xl border border-[#383838]/20 bg-[#FAF7F0] p-1.5 transition-colors hover:bg-[#EAE2D4]" title={`Copy ${packetFormat} packet`}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#0A0A0A]" />}
              </button>
            </div>
            <label className="block space-y-1 pt-1 font-sans">
              <span className="text-[10px] font-bold uppercase text-slate-600">Confirmed people requiring action</span>
              <input type="number" min={0} max={4294967295} step={1} inputMode="numeric" value={populationAtRisk} onChange={(event) => setPopulationAtRisk(event.target.value)} placeholder="Unknown: leave blank" className="w-full rounded-lg border border-[#383838]/25 bg-[#FAF7F0] px-3 py-2 font-mono text-xs outline-none focus:border-sky-700" />
              <span className="block text-[10px] leading-relaxed text-slate-500">Only enter a field-confirmed count. Blank encodes 0 (unknown), not zero affected.</span>
            </label>
          </div>

          <button onClick={handlePlayAudio} className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-bold shadow-xs transition-all ${isAudioPlaying ? "animate-pulse bg-amber-500 text-black" : "bg-[#0A0A0A] text-[#F0F0F0] hover:bg-black"}`}>
            <Volume2 className="h-4 w-4 text-amber-400" />{isAudioPlaying ? "Playing Bell 202 encoded packet..." : "Play BPP-128 VHF packet audio"}
          </button>
        </div>
      </div>
    </div>
  );
}

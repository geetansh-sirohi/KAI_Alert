"use client";
import React from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { AlertCircle, Camera, Radio } from "lucide-react";

export function ThreatRadar() {
  const { assets, assetEvaluations, setSelectedAssetId, setDroneModalOpen, setBroadcastModalOpen } = useDisasterStore();

  const compromisedAssets = assets.filter((asset) => {
    const evalResult = assetEvaluations[asset.id];
    return evalResult && evalResult.status !== "OPERATIONAL";
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF7F0]">
      <div className="p-3 border-b border-[#383838]/20 flex items-center justify-between bg-[#FAF5ED] shadow-2xs">
        <h3 className="font-bold text-xs tracking-tight text-[#0A0A0A] uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>Threat Radar</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-red-800 font-extrabold">
            {compromisedAssets.length}
          </span>
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDroneModalOpen(true)}
            className="p-1.5 bg-[#F2ECE1] hover:bg-[#EAE2D4] text-[#0A0A0A] rounded-lg transition-all text-xs flex items-center gap-1 font-sans font-semibold border border-[#383838]/20"
            title="Launch Drone Damage Triage"
          >
            <Camera className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Drone</span>
          </button>
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="p-1.5 bg-[#F2ECE1] hover:bg-[#EAE2D4] text-[#0A0A0A] rounded-lg transition-all text-xs flex items-center gap-1 font-sans font-semibold border border-[#383838]/20"
            title="Vernacular Radio & SMS Broadcast"
          >
            <Radio className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {compromisedAssets.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs font-sans bg-[#FAF5ED] rounded-2xl border border-[#383838]/20">
            <p className="font-bold text-[#0A0A0A]">All Systems Nominal</p>
            <p className="text-[11px] text-slate-600 mt-0.5">No critical infrastructure breaches detected in current time step.</p>
          </div>
        ) : (
          compromisedAssets.map((asset) => {
            const ev = assetEvaluations[asset.id];
            const isCritical = ev.status === "CRITICAL_POWER_BREACH" || ev.status === "SUBMERGED" || ev.status === "STRUCTURAL_COLLAPSE";
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                  isCritical
                    ? "border-red-300 bg-rose-50/80"
                    : "border-amber-300 bg-[#FFF3B0]/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 gap-2">
                  <span className="font-bold text-[#0A0A0A] truncate">{asset.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold shrink-0 ${
                      isCritical
                        ? "bg-red-200 text-red-900 border border-red-300"
                        : "bg-[#FFF3B0] text-[#713F12] border border-[#FDE047]"
                    }`}
                  >
                    {isCritical ? "Critical Alert" : "Warning"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 line-clamp-2 leading-snug font-medium">{ev.failureReason}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

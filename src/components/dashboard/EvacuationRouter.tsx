"use client";
import React from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { Navigation, AlertTriangle } from "lucide-react";

export function EvacuationRouter() {
  const { activeEvacuationRoute } = useDisasterStore();

  if (!activeEvacuationRoute) return null;

  const isDetour = activeEvacuationRoute.routeId === "ROUTE-INLAND-DETOUR";

  return (
    <div className="p-4 space-y-3 bg-[#FAF5ED] border-t border-[#383838]/20 shadow-2xs rounded-b-3xl font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-tight text-[#0A0A0A] flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-sky-600" />
          <span>Evacuation Corridor</span>
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
            isDetour
              ? "bg-[#FFF3B0] text-[#713F12] border border-[#FDE047]"
              : "bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC]"
          }`}
        >
          {activeEvacuationRoute.routeId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#383838]/20">
          <span className="text-[10px] text-slate-500 font-sans font-bold block uppercase tracking-wider">DISTANCE</span>
          <strong className="text-[#0A0A0A] text-sm font-extrabold">{activeEvacuationRoute.totalDistanceKm.toFixed(1)} km</strong>
        </div>
        <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#383838]/20">
          <span className="text-[10px] text-slate-500 font-sans font-bold block uppercase tracking-wider">CLEARANCE TIME</span>
          <strong className="text-[#0A0A0A] text-sm font-extrabold">{activeEvacuationRoute.estimatedClearanceHours.toFixed(2)} hrs</strong>
        </div>
      </div>

      {activeEvacuationRoute.blockedAtEdgeId && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-sans font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="leading-tight">Chokepoint {activeEvacuationRoute.blockedAtEdgeId} submerged. Inland detour engaged.</span>
        </div>
      )}
    </div>
  );
}

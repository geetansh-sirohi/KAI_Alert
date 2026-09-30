"use client";
import React from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { KaiLogo } from "../common/KaiLogo";
import {
  LayoutDashboard,
  Map as MapIcon,
  ShieldAlert,
  Camera,
  Radio,
  ChevronRight,
  Activity,
  Navigation,
  Send,
} from "lucide-react";

export function AppSidebar() {
  const {
    activeTab,
    setActiveTab,
    setDroneModalOpen,
    userLiveLocation,
  } = useDisasterStore();

  const generalNavItems = [
    { id: "OVERVIEW", label: "Dashboard", icon: LayoutDashboard },
    { id: "MAP", label: "Tactical GIS Map", icon: MapIcon },
    { id: "DISPATCH", label: "Ward Civil Dispatch", icon: Radio },
    { id: "RADAR", label: "Threat Radar & Detours", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-1.5rem)] my-3 ml-3 bg-[#0A0A0A] text-[#F0F0F0] flex flex-col justify-between p-5 rounded-3xl shrink-0 border border-[#383838]/80 shadow-2xl select-none z-30 font-sans">
      <div>
        {/* 1. Brand Logo Header */}
        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[#383838]/80">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] text-slate-950 flex items-center justify-center p-1.5 shadow-md shrink-0">
            <KaiLogo className="w-full h-full text-slate-950" />
          </div>
          <div className="truncate">
            <h1 className="font-extrabold text-base tracking-tight text-[#F0F0F0] flex items-center gap-1.5">
              KAI <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">ALERT</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase truncate">
              Live Command OS
            </p>
          </div>
        </div>

        {/* 2. General Category Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2 font-mono">
            General
          </div>

          {generalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as "OVERVIEW" | "MAP" | "RADAR" | "DISPATCH")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#141414] text-[#F0F0F0] shadow-md font-bold scale-[1.02] border border-[#383838]"
                    : "text-slate-400 hover:text-[#F0F0F0] hover:bg-[#141414]/60"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* 3. Operational Action Tools Category */}
        <div className="mt-7 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Tools
          </div>

          <button
            onClick={() => setDroneModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-[#F0F0F0] hover:bg-[#141414]/60 transition-colors"
          >
            <Camera className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Drone Damage Triage</span>
          </button>

          <button
            onClick={() => setActiveTab("DISPATCH")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-colors ${
              activeTab === "DISPATCH" ? "text-[#F0F0F0] bg-[#141414]/80 font-bold" : "text-slate-400 hover:text-[#F0F0F0] hover:bg-[#141414]/60"
            }`}
          >
            <Send className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Ward Dispatch Console</span>
          </button>

          <button
            onClick={() => setActiveTab("RADAR")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-[#F0F0F0] hover:bg-[#141414]/60 transition-colors"
          >
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Evacuation Routes</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom System Status Card */}
      <div className="pt-4 border-t border-[#383838]/80">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141414] border border-[#383838]">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-[#000000] flex items-center justify-center font-bold text-xs text-amber-400 border border-[#383838] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#F0F0F0] leading-tight truncate">
                {userLiveLocation ? userLiveLocation.city : "GPS Verified"}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Node Sync
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

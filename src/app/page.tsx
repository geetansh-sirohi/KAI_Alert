"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { AppSidebar } from "../components/layout/AppSidebar";
import { CommandHeader } from "../components/dashboard/CommandHeader";
import { OverviewDashboard } from "../components/dashboard/OverviewDashboard";
import { DispatchConsole } from "../components/dashboard/DispatchConsole";
import { ThreatRadar } from "../components/dashboard/ThreatRadar";
import { EvacuationRouter } from "../components/dashboard/EvacuationRouter";
import { DroneTriageModal } from "../components/dashboard/DroneTriageModal";
import { VernacularBroadcastModal } from "../components/dashboard/VernacularBroadcastModal";
import { AIChatDrawer } from "../components/dashboard/AIChatDrawer";
import { TelemetryBar } from "../components/dashboard/TelemetryBar";
import { TimeScrubber } from "../components/dashboard/TimeScrubber";
import { useDisasterStore } from "../lib/store/useDisasterStore";
import { LayoutDashboard, Map as MapIcon, ShieldAlert, Siren } from "lucide-react";

const DisasterMap = dynamic(
  () => import("../components/map/DisasterMap").then((mod) => mod.DisasterMap),
  { ssr: false }
);

export default function Home() {
  const { activeTab, setActiveTab, initializeUserLocation } = useDisasterStore();

  // Fetch real browser GPS live location on mount
  useEffect(() => {
    initializeUserLocation();
  }, [initializeUserLocation]);

  return (
    <main className="w-screen h-screen flex overflow-hidden bg-[#FAF7F0] text-slate-900 select-none relative font-sans">
      {/* 1. Left Dark Sidebar Navigation (KAI Alert Style) */}
      <div className="hidden md:block h-full">
        <AppSidebar />
      </div>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <CommandHeader />
        <TelemetryBar />

        <nav className="grid grid-cols-4 border-b border-[#383838]/20 bg-[#FAF7F0] md:hidden" aria-label="Main navigation">
          {[
            { id: "OVERVIEW", label: "Home", icon: LayoutDashboard },
            { id: "DISPATCH", label: "Dispatch", icon: Siren },
            { id: "MAP", label: "Map", icon: MapIcon },
            { id: "RADAR", label: "Radar", icon: ShieldAlert },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "OVERVIEW" | "MAP" | "RADAR" | "DISPATCH")}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${activeTab === id ? "text-[#0A0A0A]" : "text-slate-500"}`}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Viewport Dynamic Content Tabs */}
        <div className="flex-1 min-h-0 flex overflow-hidden relative z-0">
          {activeTab === "OVERVIEW" && (
            <OverviewDashboard />
          )}

          {activeTab === "DISPATCH" && <DispatchConsole />}

          {activeTab === "MAP" && (
            <div className="flex-1 relative overflow-hidden h-full z-0">
              <DisasterMap />
            </div>
          )}

          {activeTab === "RADAR" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 max-w-6xl mx-auto gap-6 w-full bg-[#FAF7F0]">
              <div className="flex-1 bg-[#FAF5ED] border border-[#E2DCCF] rounded-3xl shadow-xs overflow-hidden flex flex-col p-4">
                <ThreatRadar />
              </div>
              <div className="w-full md:w-96 bg-[#FAF5ED] border border-[#E2DCCF] rounded-3xl shadow-xs overflow-hidden flex flex-col p-4">
                <EvacuationRouter />
              </div>
            </div>
          )}
        </div>
        <TimeScrubber />
      </div>

      {/* 3. Modals & Bottom-Right Floating AI Copilot */}
      <DroneTriageModal />
      <VernacularBroadcastModal />
      <AIChatDrawer />
    </main>
  );
}

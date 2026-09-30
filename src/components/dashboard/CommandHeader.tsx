"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { Search, Navigation, Clock, Loader2, Radio, MapPin } from "lucide-react";
import { searchLocation, fetchLiveTelemetry, NominatimResult } from "../../lib/geo/liveTelemetry";

export function CommandHeader() {
  const {
    setSearchedLocation,
    userLiveLocation,
    activeMode,
    setActiveMode,
  } = useDisasterStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }) + " IST"
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Auto-Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchLocation(searchQuery);
      setResults(res);
      setLoading(false);
      setShowDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleSelectLocation(item: NominatimResult) {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setShowDropdown(false);
    setSearchQuery(item.display_name.split(",")[0]);

    const liveData = await fetchLiveTelemetry(lat, lon);
    setSearchedLocation({
      name: item.display_name.split(",")[0],
      lat,
      lon,
      elevation: liveData.elevationMsl,
      liveWind: liveData.windSpeedKmh,
      livePressure: liveData.surfacePressureHpa,
      liveGusts: liveData.windGustsKmh,
      temperature: liveData.temperatureC,
    });
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && results.length > 0) {
      await handleSelectLocation(results[0]);
    }
  }

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-[#FAF7F0] border-b border-[#383838]/20 select-none sticky top-0 z-40 font-sans">
      {/* 1. Left Search Bar with Quick Tags */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full max-w-sm" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search location (e.g. Delhi, Mumbai, Puri)..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-[#FAF5ED] text-[#0A0A0A] placeholder:text-slate-400 border border-[#383838]/30 focus:border-[#0A0A0A] rounded-full shadow-2xs outline-none transition-all font-sans"
            />
            {loading && (
              <Loader2 className="w-3.5 h-3.5 absolute right-3 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF7F0] rounded-2xl shadow-xl overflow-hidden z-50 border border-[#383838]/30">
              {results.map((item) => (
                <button
                  key={item.place_id}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full text-left px-4 py-2.5 text-xs text-[#0A0A0A] hover:bg-[#F2ECE1] flex items-center justify-between border-b border-[#383838]/10 last:border-0 transition-colors font-sans"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Navigation className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate font-medium">{item.display_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                    {parseFloat(item.lat).toFixed(2)}°, {parseFloat(item.lon).toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 2. Right Actions: User Live Location Badge & Simulation Switch */}
      <div className="flex items-center gap-3 shrink-0">
        {/* User GPS Live Location Badge */}
        {userLiveLocation ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            <span className="truncate max-w-[180px]">
              {userLiveLocation.city}, {userLiveLocation.country}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DBEAFE] border border-[#93C5FD] text-[#1E3A8A] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Fetching Live Location...</span>
          </div>
        )}

        <div className="flex items-center gap-1 rounded-full border border-[#383838]/25 bg-[#FAF5ED] p-1" aria-label="Operational data mode">
          <button
            onClick={() => setActiveMode("LIVE_SENTINEL")}
            aria-pressed={activeMode === "LIVE_SENTINEL"}
            title="Local weather observations; live cyclone track is not connected"
            className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-colors ${activeMode === "LIVE_SENTINEL" ? "bg-[#0A0A0A] text-white" : "text-slate-600 hover:bg-white"}`}
          >
            Live Weather
          </button>
          <button
            onClick={() => setActiveMode("REPLAY_DANA")}
            aria-pressed={activeMode === "REPLAY_DANA"}
            title="Replay the bundled Cyclone Dana benchmark"
            className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-colors ${activeMode === "REPLAY_DANA" ? "bg-rose-700 text-white" : "text-slate-600 hover:bg-white"}`}
          >
            Dana Replay
          </button>
        </div>

        {/* Live Clock Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-700 font-mono px-3 py-1.5 bg-[#FAF5ED] rounded-full border border-[#383838]/20">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime || "12:00 IST"}</span>
        </div>
      </div>
    </header>
  );
}

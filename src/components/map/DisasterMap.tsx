"use client";
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { CycloneConesLayer } from "./CycloneConesLayer";
import { MapPin, X, Info, CheckCircle2 } from "lucide-react";
import contoursData from "../../../public/data/coastal_contours_odisha.json";

export function DisasterMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const searchMarkerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    assets,
    villages,
    shops,
    assetEvaluations,
    timeSteps,
    currentTimeStepIndex,
    activeEvacuationRoute,
    selectedAssetId,
    setSelectedAssetId,
    mapLayer,
    setMapLayer,
    searchedLocation,
    geotaggedHazards,
    addDispatchLog,
  } = useDisasterStore();

  const [showInspectorTechnical, setShowInspectorTechnical] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const currentStorm = timeSteps[currentTimeStepIndex];

  // Map Initialization
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, { preferCanvas: true }).setView([20.32, 86.63], 11);
    mapInstanceRef.current = map;

    const initialUrl =
      mapLayer === "SATELLITE"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

    const initialAttr =
      mapLayer === "SATELLITE" ? "Tiles © Esri, Maxar" : "Tiles © Esri, DeLorme, NAVTEQ";

    const tile = L.tileLayer(initialUrl, { attribution: initialAttr }).addTo(map);
    tileLayerRef.current = tile;

    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Seamless Tile Layer Swapping
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl =
      mapLayer === "SATELLITE"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

    const tileAttr =
      mapLayer === "SATELLITE" ? "Tiles © Esri, Maxar" : "Tiles © Esri, DeLorme, NAVTEQ";

    tileLayerRef.current = L.tileLayer(tileUrl, { attribution: tileAttr }).addTo(map);
  }, [mapLayer, mapReady]);

  // Check if looking at benchmark storm zone
  const showCycloneCones =
    !searchedLocation ||
    (Math.abs(searchedLocation.lat - currentStorm.latitude) < 4 &&
      Math.abs(searchedLocation.lon - currentStorm.longitude) < 4);

  // Handle FlyTo on Searched Location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !searchedLocation) return;

    map.flyTo([searchedLocation.lat, searchedLocation.lon], 11, { duration: 1.5 });

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const group = L.layerGroup();

    const customIcon = L.divIcon({
      className: "custom-target-marker",
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(2, 132, 199, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 24px; height: 24px; background: #0f172a; border: 2px solid #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <div style="width: 8px; height: 8px; background: #38bdf8; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const targetMarker = L.marker([searchedLocation.lat, searchedLocation.lon], { icon: customIcon });
    targetMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; color: #0f172a;">
        <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 2px;">🎯 ${searchedLocation.name}</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          • <strong>Live Wind:</strong> ${searchedLocation.liveWind ?? 18} km/h<br/>
          • <strong>Barometric Pressure:</strong> ${searchedLocation.livePressure ?? 1010} hPa<br/>
          • <strong>Elevation:</strong> ${searchedLocation.elevation ?? 8}m MSL
        </div>
      </div>
    `);
    targetMarker.addTo(group);

    group.addTo(map);
    searchMarkerRef.current = group;
  }, [searchedLocation, mapReady]);

  // Render Surge Inundation Polygons, Infrastructure Markers, Villages, Shops, and Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const layerGroup = L.layerGroup();

    // 1. Surge Inundation Polygons Layer (from coastal_contours_odisha.json)
    if (showCycloneCones) {
      const isHighSurge = currentStorm.projected_surge_peak_meters > 2.0;
      L.geoJSON(contoursData as any, {
        style: (feature) => {
          const contourElev = feature?.properties?.elevation_contour_m || 2.0;
          const isFlooded = currentStorm.projected_surge_peak_meters > contourElev;
          return {
            color: isFlooded ? "#3b82f6" : "#94a3b8",
            weight: isFlooded ? 2 : 1,
            fillColor: isFlooded ? "#0284c7" : "#cbd5e1",
            fillOpacity: isFlooded ? (isHighSurge ? 0.35 : 0.2) : 0.05,
            interactive: false,
          };
        },
      }).addTo(layerGroup);
    }

    // 2. Evacuation Route Polyline
    if (showCycloneCones && activeEvacuationRoute && activeEvacuationRoute.pathCoordinates.length > 0) {
      const latLngs: [number, number][] = activeEvacuationRoute.pathCoordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      const routeColor = activeEvacuationRoute.routeId === "ROUTE-INLAND-DETOUR" ? "#d97706" : "#059669";
      L.polyline(latLngs, {
        color: routeColor,
        weight: 4.5,
        opacity: 0.85,
        dashArray: activeEvacuationRoute.routeId === "ROUTE-INLAND-DETOUR" ? "6, 6" : undefined,
      }).addTo(layerGroup);
    }

    // 3. Infrastructure Markers
    if (showCycloneCones) {
      assets.forEach((asset) => {
        const ev = assetEvaluations[asset.id];
        const isBreached = ev && ev.status !== "OPERATIONAL";

        let iconEmoji = "🛡️";
        if (asset.category === "HOSPITAL") iconEmoji = "🏥";
        if (asset.category === "SUBSTATION") iconEmoji = "⚡";
        if (asset.category === "CELL_TOWER") iconEmoji = "📡";

        const pinColor = isBreached ? "#e11d48" : "#059669";
        const pinBg = isBreached ? "#fff1f2" : "#ecfdf5";

        const facilityIcon = L.divIcon({
          className: "facility-pin",
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${isBreached ? '<div style="position: absolute; inset: -4px; background: rgba(225, 29, 72, 0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
              <div style="width: 26px; height: 26px; background: ${pinBg}; border: 2px solid ${pinColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                ${iconEmoji}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([asset.latitude, asset.longitude], { icon: facilityIcon });

        marker.on("click", () => {
          setSelectedAssetId(asset.id);
          setShowInspectorTechnical(false);
        });

        marker.addTo(layerGroup);
      });
    }

    // 4. Village Pins
    if (showCycloneCones && villages) {
      villages.forEach((village) => {
        const isFlooded = currentStorm.projected_surge_peak_meters > village.elevation_meters;
        const villageIcon = L.divIcon({
          className: "village-pin",
          html: `
            <div style="width: 20px; height: 20px; background: ${isFlooded ? '#fee2e2' : '#f0fdf4'}; border: 1.5px solid ${isFlooded ? '#ef4444' : '#16a34a'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">
              🏡
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const vMarker = L.marker([village.latitude, village.longitude], { icon: villageIcon });
        vMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #0f172a; padding: 2px;">
            <strong>🏡 Village: ${village.name} (${village.vernacular_name})</strong><br/>
            • Elevation: ${village.elevation_meters}m MSL<br/>
            • Population: ${village.population.toLocaleString()}<br/>
            • Kutcha Houses: ${village.kutcha_houses}<br/>
            • Status: <span style="color: ${isFlooded ? '#dc2626' : '#16a34a'}; font-weight: bold;">${isFlooded ? 'INUNDATION THREAT' : 'SECURE'}</span>
          </div>
        `);
        vMarker.addTo(layerGroup);
      });
    }

    // 5. Commercial Shops Pins
    if (showCycloneCones && shops) {
      shops.forEach((shop) => {
        const shopIcon = L.divIcon({
          className: "shop-pin",
          html: `
            <div style="width: 18px; height: 18px; background: #fef3c7; border: 1.5px solid #d97706; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 9px; box-shadow: 0 1px 4px rgba(0,0,0,0.15);">
              🏪
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const sMarker = L.marker([shop.latitude, shop.longitude], { icon: shopIcon });
        sMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #0f172a; padding: 2px;">
            <strong>🏪 ${shop.name}</strong><br/>
            • Type: ${shop.shop_type}<br/>
            • Elevation: ${shop.ground_elevation_msl}m MSL<br/>
            • Inventory Value: ₹${(shop.inventory_value_inr / 100000).toFixed(1)}L
          </div>
        `);
        sMarker.addTo(layerGroup);
      });
    }

    // 6. Geotagged Drone Hazard Pins
    if (geotaggedHazards && geotaggedHazards.length > 0) {
      geotaggedHazards.forEach((hazard) => {
        const hIcon = L.divIcon({
          className: "hazard-pin",
          html: `
            <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: -3px; background: rgba(225, 29, 72, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 24px; height: 24px; background: #fff1f2; border: 2px solid #e11d48; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                🚨
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const hMarker = L.marker([hazard.latitude, hazard.longitude], { icon: hIcon });
        hMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #0f172a; padding: 2px;">
            <strong style="color: #e11d48;">🚨 DRONE AI HAZARD PIN</strong><br/>
            • Hazard: ${hazard.hazardType}<br/>
            • Severity: ${hazard.severity}<br/>
            • Summary: ${hazard.summary}
          </div>
        `);
        hMarker.addTo(layerGroup);
      });
    }

    layerGroup.addTo(map);

    return () => {
      layerGroup.remove();
    };
  }, [
    mapReady,
    assets,
    villages,
    shops,
    assetEvaluations,
    activeEvacuationRoute,
    setSelectedAssetId,
    showCycloneCones,
    currentStorm,
    geotaggedHazards,
  ]);

  // Selected Asset Drawer
  const activeAsset = selectedAssetId ? assets.find((a) => a.id === selectedAssetId) : null;
  const activeEval = activeAsset ? assetEvaluations[activeAsset.id] : null;

  const handleMobileUnitDispatch = () => {
    if (!activeAsset) return;

    addDispatchLog({
      timeStepIndex: currentTimeStepIndex,
      timeStepName: currentStorm.time_step,
      language: "ENGLISH",
      targetVillagesCount: 1,
      populationAtRisk: activeAsset.critical_specs.service_population_capacity || 500,
      routeName: "Emergency Mobile Unit Priority Route",
      shelterName: activeAsset.name,
      bppHex: "0x01040207",
      smsText: `Mobile Dispatch Unit deployed to ${activeAsset.name} for emergency power/water isolation.`,
    });

    setDispatchConfirmed(true);
    setTimeout(() => setDispatchConfirmed(false), 3000);
  };

  return (
    <div className="w-full h-full relative select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* 1. Top-Left Location & Tactical Sector Banner */}
      <div className="absolute top-4 left-4 z-[400] bg-[#FAF7F0] border border-[#383838]/30 rounded-2xl p-3.5 shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
          <h2 className="font-bold text-xs text-[#0A0A0A] truncate">
            {searchedLocation ? searchedLocation.name : "Sector 402: Paradip Coast, Odisha"}
          </h2>
        </div>
        <p className="text-[11px] text-slate-600 pl-6 leading-tight font-medium">
          {searchedLocation
            ? `Live Telemetry Coordinates: ${searchedLocation.lat.toFixed(2)}°N, ${searchedLocation.lon.toFixed(2)}°E`
            : "Distance to Cyclone Eye: ~35 km • Landfall Expected: ~3 Hours"}
        </p>
      </div>

      {/* 2. Top-Right Satellite vs Street Switcher */}
      <div className="absolute top-4 right-4 z-[400] bg-[#FAF7F0] border border-[#383838]/30 rounded-full p-1 flex items-center gap-1 shadow-md">
        <button
          onClick={() => setMapLayer("STREET")}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
            mapLayer === "STREET" ? "bg-[#0A0A0A] text-[#F0F0F0] shadow-xs" : "text-slate-700 hover:text-[#0A0A0A]"
          }`}
        >
          🗺️ Street
        </button>
        <button
          onClick={() => setMapLayer("SATELLITE")}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
            mapLayer === "SATELLITE" ? "bg-[#0A0A0A] text-[#F0F0F0] shadow-xs" : "text-slate-700 hover:text-[#0A0A0A]"
          }`}
        >
          🛰️ Satellite
        </button>
      </div>

      {/* 3. Bottom-Left Map Legend Guide */}
      <div className="absolute bottom-6 left-4 z-[400] bg-[#FAF7F0] border border-[#383838]/30 rounded-2xl p-3.5 shadow-md text-xs text-slate-700 hidden md:block max-w-xs">
        <div className="font-bold text-[11px] text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Map Layer Legend</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-600 shrink-0" />
            <span>Surge Inundation Contour Polygons</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Green Line: Safe Evacuation Corridor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-rose-500 bg-rose-100 shrink-0" />
            <span>🏥 / ⚡: Critical Infrastructure Pins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-amber-600 bg-amber-100 shrink-0" />
            <span>🏡 / 🏪: Village & Commercial Shop Markers</span>
          </div>
        </div>
      </div>

      {/* 4. Cyclone Cones Overlay */}
      {mapReady && showCycloneCones && (
        <CycloneConesLayer map={mapInstanceRef.current} currentStorm={currentStorm} />
      )}

      {/* 5. Facility Detail Drawer */}
      {activeAsset && (
        <div className="absolute bottom-6 right-4 z-[400] w-96 max-w-[calc(100vw-2rem)] bg-[#FAF7F0] border border-[#383838]/30 rounded-3xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                {activeAsset.category} • ID: {activeAsset.id}
              </span>
              <h3 className="font-bold text-sm text-slate-900">{activeAsset.name}</h3>
            </div>
            <button
              onClick={() => setSelectedAssetId(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeEval?.status !== "OPERATIONAL"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {activeEval?.status !== "OPERATIONAL" ? "ACTION REQUIRED" : "OPERATIONAL & SECURE"}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Elevation: {activeAsset.ground_elevation_msl.toFixed(1)}m MSL
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {activeEval?.failureReason
                ? activeEval.failureReason
                : "This facility is operating normally with elevated flood barriers in place."}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowInspectorTechnical(!showInspectorTechnical)}
              className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 transition-colors mb-2"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showInspectorTechnical ? "Hide Engineering Diagnostics" : "🔬 View Technical Physics Telemetry"}</span>
            </button>

            {showInspectorTechnical && (
              <div className="bg-slate-50 rounded-xl p-3 font-mono text-[11px] text-slate-600 space-y-1 mb-2">
                <div>• Coastal Proximity: {activeAsset.distance_to_coast_km.toFixed(2)} km</div>
                <div>• Inundation Depth: {activeEval?.inundationDepthMeters?.toFixed(2) ?? "0.00"}m</div>
                <div>• Peak Surge Height: {activeEval?.surgeHeightMeters?.toFixed(2) ?? "0.15"}m MSL</div>
                <div>• Primary Hazard: {activeEval?.status ?? "NONE"}</div>
              </div>
            )}

            {activeEval?.status !== "OPERATIONAL" && (
              <button
                onClick={handleMobileUnitDispatch}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {dispatchConfirmed ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Mobile Unit Dispatched & Logged!
                  </span>
                ) : (
                  <span>Dispatch Mobile Unit ➔</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect } from "react";
import L from "leaflet";
import { StormTrackPoint } from "../../lib/types/disaster";

interface CycloneConesLayerProps {
  map: L.Map | null;
  currentStorm: StormTrackPoint;
}

export function CycloneConesLayer({ map, currentStorm }: CycloneConesLayerProps) {
  useEffect(() => {
    if (!map || !currentStorm) return;
    const layerGroup = L.layerGroup();

    // 1. 34kt Gale Alert Radius (Yellow / Amber - Minimalist)
    if (currentStorm.wind_radii.gale_34kt_radius_km > 0) {
      L.circle([currentStorm.latitude, currentStorm.longitude], {
        radius: currentStorm.wind_radii.gale_34kt_radius_km * 1000,
        interactive: false,
        color: "#d97706",
        fillColor: "#fbbf24",
        fillOpacity: 0.08,
        weight: 1.2,
        dashArray: "4, 6",
      }).addTo(layerGroup);
    }

    // 2. 50kt Storm Force Radius (Orange - Minimalist)
    if (currentStorm.wind_radii.storm_50kt_radius_km > 0) {
      L.circle([currentStorm.latitude, currentStorm.longitude], {
        radius: currentStorm.wind_radii.storm_50kt_radius_km * 1000,
        interactive: false,
        color: "#ea580c",
        fillColor: "#f97316",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(layerGroup);
    }

    // 3. 64kt Hurricane Core Radius (Red / Rose - Minimalist)
    if (currentStorm.wind_radii.hurricane_64kt_radius_km > 0) {
      L.circle([currentStorm.latitude, currentStorm.longitude], {
        radius: currentStorm.wind_radii.hurricane_64kt_radius_km * 1000,
        interactive: false,
        color: "#e11d48",
        fillColor: "#f43f5e",
        fillOpacity: 0.18,
        weight: 1.8,
      }).addTo(layerGroup);
    }

    // 4. Cyclone Eye Center Marker (Quiet Luxury Custom Pin)
    const eyeIcon = L.divIcon({
      className: "cyclone-eye-marker",
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(225, 29, 72, 0.25); border-radius: 50%; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 20px; height: 20px; background: #0f172a; border: 2px solid #e11d48; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
            <div style="width: 6px; height: 6px; background: #fb7185; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const eyeMarker = L.marker([currentStorm.latitude, currentStorm.longitude], { icon: eyeIcon });
    eyeMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; color: #0f172a;">
        <div style="font-weight: 800; color: #e11d48; font-size: 13px; margin-bottom: 2px;">Cyclone Vortex Center</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          • <strong>Time:</strong> ${currentStorm.time_step}<br/>
          • <strong>Max Winds:</strong> ${currentStorm.max_sustained_wind_kmh} km/h<br/>
          • <strong>Central Pressure:</strong> ${currentStorm.central_pressure_hpa} hPa<br/>
          • <strong>Surge Potential:</strong> ${currentStorm.projected_surge_peak_meters.toFixed(2)}m
        </div>
      </div>
    `);
    eyeMarker.addTo(layerGroup);

    layerGroup.addTo(map);
    return () => {
      layerGroup.remove();
    };
  }, [map, currentStorm]);

  return null;
}

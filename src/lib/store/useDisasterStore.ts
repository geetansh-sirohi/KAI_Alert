import { create } from "zustand";
import * as turf from "@turf/turf";
import {
  StormTrackPoint,
  CriticalAsset,
  EvacuationRouteResult,
  EvacuationNetwork,
  AssetEvaluationResult,
  VillageDemographic,
  CommercialShop,
} from "../types/disaster";
import cycloneData from "../../../public/data/cyclone_benchmark_dana.json";
import assetData from "../../../public/data/odisha_critical_infra.json";
import evacuationNetwork from "../../../public/data/evacuation_routes_odisha.json";
import villageData from "../../../public/data/odisha_villages.json";
import shopData from "../../../public/data/commercial_shops_paradip.json";
import { evaluateAssetVulnerability } from "../physics/ivs";
import { calculateSafeEvacuationRoute } from "../geo/router";
import { calculateInlandSurge, calculateInundationDepth } from "../physics/surgePhysics";
import { fetchDeviceLiveLocation, UserLiveLocationResult } from "../geo/liveTelemetry";

export interface SearchedLocation {
  name: string;
  lat: number;
  lon: number;
  elevation?: number;
  liveWind?: number;
  livePressure?: number;
  liveGusts?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DispatchLog {
  id: string;
  timeStepIndex: number;
  timeStepName: string;
  language: string;
  targetVillagesCount: number;
  populationAtRisk: number;
  routeName: string;
  shelterName: string;
  bppHex: string;
  smsText: string;
  timestamp: string;
}

export interface GeotaggedHazard {
  id: string;
  hazardType: string;
  severity: string;
  latitude: number;
  longitude: number;
  summary: string;
  timestamp: string;
}

interface DisasterState {
  currentTimeStepIndex: number;
  isPlaying: boolean;
  timeSteps: StormTrackPoint[];
  assets: CriticalAsset[];
  villages: VillageDemographic[];
  shops: CommercialShop[];
  assetEvaluations: Record<string, AssetEvaluationResult>;
  activeEvacuationRoute?: EvacuationRouteResult;
  selectedAssetId: string | null;
  activeMode: "REPLAY_DANA" | "LIVE_SENTINEL";
  isDroneModalOpen: boolean;
  isBroadcastModalOpen: boolean;

  // Location & Simulation Mode State
  mapLayer: "STREET" | "SATELLITE";
  searchedLocation: SearchedLocation | null;
  userLiveLocation: UserLiveLocationResult | null;
  isSimulationMode: boolean;
  isAIChatOpen: boolean;
  chatMessages: ChatMessage[];
  activeTab: "OVERVIEW" | "MAP" | "RADAR" | "DISPATCH";

  // Dispatch & Geotagged Hazards
  dispatchLogs: DispatchLog[];
  geotaggedHazards: GeotaggedHazard[];

  setTimeStepIndex: (index: number) => void;
  togglePlay: () => void;
  setSelectedAssetId: (id: string | null) => void;
  setActiveMode: (mode: "REPLAY_DANA" | "LIVE_SENTINEL") => void;
  setActiveEvacuationRoute: (route: EvacuationRouteResult) => void;
  setDroneModalOpen: (open: boolean) => void;
  setBroadcastModalOpen: (open: boolean) => void;
  recomputeEvaluations: () => void;

  setMapLayer: (layer: "STREET" | "SATELLITE") => void;
  setSearchedLocation: (loc: SearchedLocation | null) => void;
  setUserLiveLocation: (loc: UserLiveLocationResult | null) => void;
  setIsSimulationMode: (sim: boolean) => void;
  setAIChatOpen: (open: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setActiveTab: (tab: "OVERVIEW" | "MAP" | "RADAR" | "DISPATCH") => void;
  initializeUserLocation: () => Promise<void>;
  addDispatchLog: (log: Omit<DispatchLog, "id" | "timestamp">) => void;
  addGeotaggedHazard: (hazard: Omit<GeotaggedHazard, "id" | "timestamp">) => void;

  // Derived physics helpers
  getFloodedVillages: () => VillageDemographic[];
  getPopulationAtRisk: () => number;
  getHazardBitmap: () => number;
}

interface PrecomputedTimelineCache {
  evaluationsByTimeStep: Record<number, Record<string, AssetEvaluationResult>>;
  activeRoutesByTimeStep: Record<number, EvacuationRouteResult>;
}

export function precalculateAllTimeSteps(
  tracks: StormTrackPoint[],
  assets: CriticalAsset[],
  network: EvacuationNetwork
): PrecomputedTimelineCache {
  const evaluationsByTimeStep: Record<number, Record<string, AssetEvaluationResult>> = {};
  const activeRoutesByTimeStep: Record<number, EvacuationRouteResult> = {};

  tracks.forEach((storm, index) => {
    const stepEvals: Record<string, AssetEvaluationResult> = {};
    assets.forEach((asset) => {
      const fromPoint = turf.point([asset.longitude, asset.latitude]);
      const toPoint = turf.point([storm.longitude, storm.latitude]);
      const distKm = turf.distance(fromPoint, toPoint, { units: "kilometers" });
      stepEvals[asset.id] = evaluateAssetVulnerability(
        asset,
        storm,
        distKm,
        asset.distance_to_coast_km
      );
    });
    evaluationsByTimeStep[index] = stepEvals;
    activeRoutesByTimeStep[index] = calculateSafeEvacuationRoute(
      network,
      storm.projected_surge_peak_meters,
      stepEvals
    );
  });

  return { evaluationsByTimeStep, activeRoutesByTimeStep };
}

const precomputedCache = precalculateAllTimeSteps(
  cycloneData as StormTrackPoint[],
  assetData as CriticalAsset[],
  evacuationNetwork as unknown as EvacuationNetwork
);

export const useDisasterStore = create<DisasterState>((set, get) => ({
  currentTimeStepIndex: 4,
  isPlaying: false,
  timeSteps: cycloneData as StormTrackPoint[],
  assets: assetData as CriticalAsset[],
  villages: villageData as VillageDemographic[],
  shops: shopData as CommercialShop[],
  assetEvaluations: precomputedCache.evaluationsByTimeStep[4] || {},
  activeEvacuationRoute: precomputedCache.activeRoutesByTimeStep[4],
  selectedAssetId: null,
  activeMode: "LIVE_SENTINEL",
  isDroneModalOpen: false,
  isBroadcastModalOpen: false,

  mapLayer: "STREET",
  searchedLocation: null,
  userLiveLocation: null,
  isSimulationMode: false,
  isAIChatOpen: false,
  activeTab: "OVERVIEW",
  dispatchLogs: [],
  geotaggedHazards: [],

  chatMessages: [
    {
      role: "assistant",
      content: "Namaste! Main aapka KAI AI Copilot hu. Live disaster telemetry, ward dispatches, and safe evacuation routes ke baare me poochiye.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],

  setTimeStepIndex: (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, get().timeSteps.length - 1));
    set({
      currentTimeStepIndex: safeIndex,
      assetEvaluations: precomputedCache.evaluationsByTimeStep[safeIndex],
      activeEvacuationRoute: precomputedCache.activeRoutesByTimeStep[safeIndex],
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSelectedAssetId: (id: string | null) => set({ selectedAssetId: id }),
  setActiveMode: (mode) => set({ activeMode: mode, isSimulationMode: mode === "REPLAY_DANA" }),
  setActiveEvacuationRoute: (route) => set({ activeEvacuationRoute: route }),
  setDroneModalOpen: (open) => set({ isDroneModalOpen: open }),
  setBroadcastModalOpen: (open) => set({ isBroadcastModalOpen: open }),

  setMapLayer: (layer) => set({ mapLayer: layer }),
  setSearchedLocation: (loc) => set({ searchedLocation: loc }),
  setUserLiveLocation: (loc) => set({ userLiveLocation: loc }),
  setIsSimulationMode: (sim) => set({ isSimulationMode: sim }),
  setAIChatOpen: (open) => set({ isAIChatOpen: open }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  initializeUserLocation: async () => {
    const loc = await fetchDeviceLiveLocation();
    set({
      userLiveLocation: loc,
      searchedLocation: {
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
        elevation: loc.elevation,
        liveWind: loc.liveWind,
        livePressure: loc.livePressure,
        liveGusts: loc.liveGusts,
        temperature: loc.temperature,
      },
    });
  },

  addDispatchLog: (log) => {
    const newEntry: DispatchLog = {
      ...log,
      id: `DISPATCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    set((state) => ({ dispatchLogs: [newEntry, ...state.dispatchLogs] }));
  },

  addGeotaggedHazard: (hazard) => {
    const newEntry: GeotaggedHazard = {
      ...hazard,
      id: `HAZARD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    set((state) => ({ geotaggedHazards: [newEntry, ...state.geotaggedHazards] }));
  },

  recomputeEvaluations: () => {
    const { currentTimeStepIndex, timeSteps, assets } = get();
    const currentStorm = timeSteps[currentTimeStepIndex];
    const evaluations: Record<string, AssetEvaluationResult> = {};

    assets.forEach((asset) => {
      const fromPoint = turf.point([asset.longitude, asset.latitude]);
      const toPoint = turf.point([currentStorm.longitude, currentStorm.latitude]);
      const distanceKm = turf.distance(fromPoint, toPoint, { units: "kilometers" });

      evaluations[asset.id] = evaluateAssetVulnerability(
        asset,
        currentStorm,
        distanceKm,
        asset.distance_to_coast_km
      );
    });

    const updatedRoute = calculateSafeEvacuationRoute(
      evacuationNetwork as unknown as EvacuationNetwork,
      currentStorm.projected_surge_peak_meters,
      evaluations
    );

    set({ assetEvaluations: evaluations, activeEvacuationRoute: updatedRoute });
  },

  getFloodedVillages: () => {
    const { timeSteps, currentTimeStepIndex, villages } = get();
    const storm = timeSteps[currentTimeStepIndex];
    const shoreSurge = storm.projected_surge_peak_meters;

    return villages.filter((village) => {
      // Calculate distance to shoreline (approx coastline at ~86.72°E)
      const distToCoastKm = Math.max(0.5, Math.abs(86.72 - village.longitude) * 90);
      const inlandSurge = calculateInlandSurge(shoreSurge, distToCoastKm);
      const inundation = calculateInundationDepth(inlandSurge, village.elevation_meters);
      return inlandSurge > village.elevation_meters || inundation > 0;
    });
  },

  getPopulationAtRisk: () => {
    const flooded = get().getFloodedVillages();
    if (flooded.length === 0) return 0;
    return flooded.reduce((sum, v) => sum + v.population, 0);
  },

  getHazardBitmap: () => {
    const { assetEvaluations, activeEvacuationRoute, timeSteps, currentTimeStepIndex, assets } = get();
    const storm = timeSteps[currentTimeStepIndex];
    let bitmap = 0;

    // Bit 0: Grid Trip / Critical Power Breach
    const subBreached = assets.some(
      (asset) => asset.category === "SUBSTATION" && assetEvaluations[asset.id]?.status === "CRITICAL_POWER_BREACH"
    );
    if (subBreached) bitmap |= 0x01;

    // Bit 1: Modeled infrastructure inundation
    if (Object.values(assetEvaluations).some((evaluation) => evaluation.inundationDepthMeters > 0.05)) bitmap |= 0x02;

    // Bit 2: Bridge Submersion / Detour Active
    if (activeEvacuationRoute?.routeId === "ROUTE-INLAND-DETOUR" || activeEvacuationRoute?.blockedAtEdgeId) {
      bitmap |= 0x04;
    }

    // Bit 3: Generator Failure / Ground DG Breach
    const dgBreached = assets.some(
      (asset) => asset.category === "HOSPITAL" && assetEvaluations[asset.id]?.status === "CRITICAL_POWER_BREACH"
    );
    if (dgBreached) bitmap |= 0x08;

    return bitmap;
  },
}));

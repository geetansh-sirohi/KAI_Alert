export interface VernacularAlerts {
  odia: string;
  hindi: string;
  english: string;
  bengali: string;
}

export interface VernacularAlertParams {
  stepIndex: number;
  surgeMeters?: number;
  safeRouteName?: string;
  shelterName?: string;
  floodedVillagesCount?: number;
  populationAtRisk?: number;
}

export function generateVernacularAlerts(
  stepIndex: number,
  params?: VernacularAlertParams | number
): VernacularAlerts {
  // Backwards compatibility if passed single number sectorId
  const config: VernacularAlertParams =
    typeof params === "number" ? { stepIndex } : params || { stepIndex };

  const surge = (config.surgeMeters ?? (stepIndex >= 4 ? 3.2 : 1.5)).toFixed(1);
  const route = config.safeRouteName || "Inland Highway 5A Detour";
  const shelter = config.shelterName || "Kujang Multipurpose Cyclone Shelter (SHEL-01)";
  const villages = config.floodedVillagesCount ?? (stepIndex >= 4 ? 3 : 1);
  const routeIsDetour = config.safeRouteName
    ? config.safeRouteName.toLowerCase().includes("detour")
    : stepIndex >= 4;

  if (routeIsDetour) {
    return {
      odia: `ବାତ୍ୟା ସତର୍କ: ${shelter} କୁ ଯାଆନ୍ତୁ। ${route} ବ୍ୟବହାର କରନ୍ତୁ।`,
      hindi: `चक्रवात अलर्ट: ${shelter} जाएं। ${route} का उपयोग करें।`,
      english: `CYCLONE ALERT: Proceed to ${shelter}. Use ${route}.`,
      bengali: `ঘূর্ণিঝড় সতর্কতা: ${shelter}-এ যান। ${route} ব্যবহার করুন।`,
    };
  }

  return {
    odia: `ବାତ୍ୟା ସତର୍କତା: ${villages} ଗ୍ରାମ ସଜାଗ ରୁହନ୍ତୁ। ${route} ଖୋଲା; ${shelter} ପ୍ରସ୍ତୁତ।`,
    hindi: `चक्रवात चेतावनी: ${villages} गांव सतर्क रहें। ${route} खुला है; ${shelter} तैयार है।`,
    english: `CYCLONE WATCH: ${villages} villages on alert. ${route} open; ${shelter} ready.`,
    bengali: `ঘূর্ণিঝড় সতর্কতা: ${villages}টি গ্রাম সতর্ক থাকুন। ${route} খোলা; ${shelter} প্রস্তুত।`,
  };
}

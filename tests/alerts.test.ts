import { describe, expect, it } from "vitest";
import { generateVernacularAlerts } from "../src/lib/alerts/vernacularTemplates";

describe("scenario-linked broadcast instructions", () => {
  it("names the active inland detour rather than claiming the primary route is open", () => {
    const alerts = generateVernacularAlerts(4, {
      stepIndex: 4,
      surgeMeters: 2.9,
      safeRouteName: "Inland Highway 5A Detour (NH-5A)",
      shelterName: "Kujang Shelter (SHEL-01)",
      floodedVillagesCount: 2,
      populationAtRisk: 0,
    });

    for (const message of Object.values(alerts)) {
      expect(message).toContain("Inland Highway 5A Detour");
      expect(message).toContain("Kujang Shelter");
      expect(message).not.toContain("Primary Coastal Highway");
    }
  });

  it("uses the primary corridor only when the current route says it is open", () => {
    const alerts = generateVernacularAlerts(2, {
      stepIndex: 2,
      surgeMeters: 1.8,
      safeRouteName: "Primary Coastal Highway (NH-53)",
      shelterName: "Kujang Shelter (SHEL-01)",
      floodedVillagesCount: 0,
      populationAtRisk: 0,
    });

    expect(alerts.english).toContain("Primary Coastal Highway");
    expect(alerts.english).not.toContain("Inland Highway 5A Detour");
  });
});
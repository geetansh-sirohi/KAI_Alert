import { describe, it, expect } from "vitest";
import { TriageResponseSchema } from "../src/lib/types/triage";

describe("Gate 5: Zod Schema Validation Integrity", () => {
  it("throws ZodError on malformed JSON payload missing required hazard_type", () => {
    const invalidPayload = {
      severity: "P1_CRITICAL",
      life_safety_risk: true,
      // Missing hazard_type
    };

    expect(() => TriageResponseSchema.parse(invalidPayload)).toThrow();
  });

  it("successfully parses valid Gemini triage response", () => {
    const validPayload = {
      hazard_type: "DOWNED_POWERLINE",
      severity: "P1_CRITICAL",
      life_safety_risk: true,
      detected_features: ["Severed 11kV conductor line across flooded road"],
      recommended_machinery: ["ELECTRICAL_ISOLATION_UNIT", "CHAINSAW_CREW"],
      estimated_clearance_time_hours: 2.5,
      confidence_score: 0.94,
      triage_summary: "Live 11kV line submerged in floodwaters.",
    };

    const parsed = TriageResponseSchema.parse(validPayload);
    expect(parsed.hazard_type).toBe("DOWNED_POWERLINE");
    expect(parsed.confidence_score).toBe(0.94);
  });
});

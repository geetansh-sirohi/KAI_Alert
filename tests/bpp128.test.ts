import { describe, it, expect } from "vitest";
import { encodeBPP128, decodeBPP128, bpp128ToHex, bpp128ToBase64 } from "../src/lib/telecom/bpp128";
import { BPPTelemetryPayload } from "../src/lib/types/disaster";

describe("Gate 3: BPP-128 Binary Roundtrip & Golden Vector", () => {
  const goldenPayload: BPPTelemetryPayload = {
    version: 1,
    timeStepIndex: 5,
    sectorId: 402,
    hazardBitmap: 0x07,
    surgeDecimeters: 32,
    safeRouteId: 12,
    shelterId: 1,
    populationAtRisk: 14250,
  };

  it("encodes payload to exact 14-byte frame and golden hex", () => {
    const buffer = encodeBPP128(goldenPayload);
    expect(buffer.byteLength).toBe(14);

    const hex = bpp128ToHex(buffer);
    expect(hex).toBe("150192072000C001000037AA9D69");

    const base64 = bpp128ToBase64(buffer);
    expect(base64).toBe("FQGSByAAwAEAADeqnWk=");

    const decoded = decodeBPP128(hex);
    expect(decoded).toEqual(goldenPayload);
  });
});

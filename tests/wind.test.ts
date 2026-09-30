import { describe, it, expect } from "vitest";
import { calculateHollandWindSpeed } from "../src/lib/physics/hollandWind";

describe("Gate 4: Holland Wind Radial Decay", () => {
  it("calculates peak wind at eyewall and decays radially according to thermodynamic B profile", () => {
    // 165 km/h Category-4 cyclone at landfall (Dana parameters)
    const v_35 = calculateHollandWindSpeed(35.0, 165, 942, 1013.25, 35.0, 20.35);
    const v_140 = calculateHollandWindSpeed(140.0, 165, 942, 1013.25, 35.0, 20.35);
    const v_160 = calculateHollandWindSpeed(160.0, 165, 942, 1013.25, 35.0, 20.35);

    expect(v_35).toBeGreaterThan(140); // 168.70 km/h
    expect(v_140).toBeLessThan(115);    // 112.91 km/h
    expect(v_160).toBeLessThan(110);    // 105.09 km/h
  });
});

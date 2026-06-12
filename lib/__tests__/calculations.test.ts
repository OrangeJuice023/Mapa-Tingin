import { describe, it, expect } from "vitest";
import { computeHeatIndex, computeRiskScore } from "../calculations";

describe("computeHeatIndex (NWS Rothfusz)", () => {
  it("matches the NWS value for hot, humid tropical conditions (30°C / 75% RH)", () => {
    const hi = computeHeatIndex(30, 75);
    // NWS heat index for 86°F / 75% RH is ~97°F ≈ 36°C
    expect(hi).toBeGreaterThan(34.5);
    expect(hi).toBeLessThan(38);
  });

  it("returns roughly the air temperature in mild conditions (20°C / 50% RH)", () => {
    const hi = computeHeatIndex(20, 50);
    expect(hi).toBeGreaterThan(17);
    expect(hi).toBeLessThan(22);
  });

  it("produces a higher heat index for higher humidity at the same temperature", () => {
    const dry = computeHeatIndex(33, 40);
    const humid = computeHeatIndex(33, 90);
    expect(humid).toBeGreaterThan(dry);
  });

  it("never produces the old broken formula's inflated values (29.9°C / 75% must be far below 50°C)", () => {
    const hi = computeHeatIndex(29.9, 75);
    expect(hi).toBeLessThan(40);
  });
});

describe("computeRiskScore", () => {
  it("returns 0 for minimal conditions", () => {
    expect(computeRiskScore(20, 0, 0)).toBe(0);
  });

  it("returns 100 for maximum conditions", () => {
    expect(computeRiskScore(60, 100, 100)).toBe(100);
  });

  it("never exceeds 100 even with extreme inputs", () => {
    expect(computeRiskScore(80, 100, 100)).toBeLessThanOrEqual(100);
  });

  it("never goes below 0", () => {
    expect(computeRiskScore(-10, 0, 0)).toBeGreaterThanOrEqual(0);
  });

  it("weights heat index as the dominant factor", () => {
    const heatDriven = computeRiskScore(50, 0, 0);
    const humidityDriven = computeRiskScore(27, 100, 0);
    expect(heatDriven).toBeGreaterThan(humidityDriven);
  });
});

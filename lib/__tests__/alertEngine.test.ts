import { describe, it, expect } from "vitest";
import { evaluateAlerts, getCloudLabel } from "../alertEngine";

describe("evaluateAlerts heat index thresholds", () => {
  it("fires no heat alert below 32°C heat index", () => {
    const alerts = evaluateAlerts(30, 50, 0, 31.99);
    expect(alerts.find((a) => a.type === "heat_index")).toBeUndefined();
  });

  it("fires a MEDIUM heat alert at exactly 32°C", () => {
    const alerts = evaluateAlerts(30, 50, 0, 32);
    expect(alerts.find((a) => a.type === "heat_index")?.level).toBe("MEDIUM");
  });

  it("fires a MEDIUM (not HIGH) heat alert just below 41°C", () => {
    const alerts = evaluateAlerts(35, 60, 0, 40.99);
    expect(alerts.find((a) => a.type === "heat_index")?.level).toBe("MEDIUM");
  });

  it("fires a HIGH heat alert at 41°C and above", () => {
    const alerts = evaluateAlerts(38, 70, 0, 41);
    expect(alerts.find((a) => a.type === "heat_index")?.level).toBe("HIGH");
  });
});

describe("evaluateAlerts cloud and humidity", () => {
  it("fires a cloud cover alert above 85%", () => {
    const alerts = evaluateAlerts(25, 50, 86, 25);
    expect(alerts.find((a) => a.type === "cloud_cover")?.level).toBe("MEDIUM");
  });

  it("fires a humidity alert above 85%", () => {
    const alerts = evaluateAlerts(25, 86, 0, 25);
    expect(alerts.find((a) => a.type === "humidity")?.level).toBe("LOW");
  });

  it("returns no alerts in calm conditions", () => {
    expect(evaluateAlerts(24, 50, 30, 24)).toHaveLength(0);
  });

  it("can fire multiple alerts simultaneously", () => {
    const alerts = evaluateAlerts(38, 90, 95, 45);
    expect(alerts.length).toBe(3);
  });
});

describe("getCloudLabel", () => {
  it("labels the bands correctly", () => {
    expect(getCloudLabel(10)).toBe("Clear");
    expect(getCloudLabel(35)).toBe("Partly Cloudy");
    expect(getCloudLabel(70)).toBe("Mostly Cloudy");
    expect(getCloudLabel(95)).toBe("Overcast");
  });
});

export interface Alert {
  type: "heat_index" | "cloud_cover" | "humidity";
  level: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export function evaluateAlerts(
  temp: number,
  humidity: number,
  cloudCover: number,
  heatIndex: number
): Alert[] {
  const alerts: Alert[] = [];

  // Heat index bands (°C), per NWS heat-stress categories
  if (heatIndex >= 41) {
    alerts.push({
      type: "heat_index",
      level: "HIGH",
      message: "Dangerous heat index — heat stroke likely with prolonged exposure.",
    });
  } else if (heatIndex >= 32) {
    alerts.push({
      type: "heat_index",
      level: "MEDIUM",
      message: "Elevated heat index — heat exhaustion possible during activity.",
    });
  }

  if (cloudCover > 85) {
    alerts.push({
      type: "cloud_cover",
      level: "MEDIUM",
      message: "Heavy cloud cover may indicate storm activity.",
    });
  }

  if (humidity > 85) {
    alerts.push({
      type: "humidity",
      level: "LOW",
      message: "High humidity reduces evaporative cooling.",
    });
  }

  return alerts;
}

export function getCloudLabel(cloudCover: number): string {
  if (cloudCover < 20) return "Clear";
  if (cloudCover <= 50) return "Partly Cloudy";
  if (cloudCover <= 80) return "Mostly Cloudy";
  return "Overcast";
}

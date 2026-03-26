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

  if (heatIndex > 40) {
    alerts.push({
      type: "heat_index",
      level: "HIGH",
      message: "Extreme heat index detected. Health risk.",
    });
  }

  if (cloudCover > 80) {
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
      message: "High humidity levels detected.",
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

import dbConnect from "./mongodb";
import RawData from "@/models/RawData";
import ProcessedData from "@/models/ProcessedData";
import PipelineLog from "@/models/PipelineLog";
import { evaluateAlerts, getCloudLabel } from "./alertEngine";

export interface PipelineResult {
  location: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  cloud: number;
  heatIndex: number;
  riskScore: number;
  cloudLabel: string;
  alerts: any[];
  timestamp: Date;
  stage: string;
  status: "success" | "error";
  message?: string;
  duration_ms: number;
}

/**
 * NWS Heat Index (Rothfusz regression). Inputs in °C / %RH, output in °C.
 * Uses the simple formula at lower temps and the full regression at/above 80°F,
 * matching the National Weather Service algorithm.
 */
function computeHeatIndex(tempC: number, rh: number): number {
  const T = (tempC * 9) / 5 + 32; // °C -> °F
  let hiF = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);

  if ((T + hiF) / 2 >= 80) {
    hiF =
      -42.379 +
      2.04901523 * T +
      10.14333127 * rh -
      0.22475541 * T * rh -
      0.00683783 * T * T -
      0.05481717 * rh * rh +
      0.00122874 * T * T * rh +
      0.00085282 * T * rh * rh -
      0.00000199 * T * T * rh * rh;

    if (rh < 13 && T >= 80 && T <= 112) {
      hiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (rh > 85 && T >= 80 && T <= 87) {
      hiF += ((rh - 85) / 10) * ((87 - T) / 5);
    }
  }

  const hiC = ((hiF - 32) * 5) / 9;
  return Number(hiC.toFixed(2));
}

/**
 * Composite environmental risk on a true 0–100 scale.
 * Heat index is mapped onto NWS heat-stress bands (27°C = none, 54°C = extreme danger),
 * then combined with humidity and cloud cover.
 */
function computeRiskScore(heatIndex: number, humidity: number, cloud: number): number {
  const heatNorm = Math.max(0, Math.min(100, ((heatIndex - 27) / (54 - 27)) * 100));
  const raw = 0.6 * heatNorm + 0.25 * humidity + 0.15 * cloud;
  return Number(Math.min(100, Math.max(0, raw)).toFixed(2));
}

export async function runPipeline(
  lat: number,
  lon: number,
  name: string
): Promise<PipelineResult> {
  const startTime = Date.now();
  let currentStage = "fetch";

  try {
    await dbConnect();

    // Stage 1: API Fetch
    currentStage = "fetch";
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,cloud_cover&forecast_days=1&timezone=Asia%2FManila`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch from Open-Meteo: ${res.statusText}`);
    }
    const rawContent = await res.json();

    // Stage 2: Data Cleaning
    currentStage = "cleaning";
    const hourly = rawContent.hourly;
    if (!hourly) {
      throw new Error("Open-Meteo response missing hourly data");
    }
    const temp = Number((hourly.temperature_2m?.[0] ?? 0).toFixed(2));
    const humidity = Number((hourly.relative_humidity_2m?.[0] ?? 0).toFixed(2));
    const cloud = Number((hourly.cloud_cover?.[0] ?? 0).toFixed(2));

    if (isNaN(temp) || isNaN(humidity) || isNaN(cloud)) {
      throw new Error("Invalid data types detected after cleaning.");
    }

    // Stage 3: Feature Engineering
    currentStage = "processing";
    const heatIndex = computeHeatIndex(temp, humidity);
    const riskScore = computeRiskScore(heatIndex, humidity, cloud);
    const cloudLabel = getCloudLabel(cloud);

    // Stage 4: Alert Engine
    currentStage = "alerts";
    const alerts = evaluateAlerts(temp, humidity, cloud, heatIndex);

    // Stage 5: Storage
    currentStage = "storage";
    const fetchedAt = new Date();

    await RawData.create({ location: name, lat, lon, raw: rawContent, fetchedAt });

    const processedDoc = await ProcessedData.create({
      location: name,
      lat,
      lon,
      temp,
      humidity,
      cloud,
      heatIndex,
      riskScore,
      cloudLabel,
      alerts,
      timestamp: fetchedAt,
    });

    const duration = Date.now() - startTime;

    await PipelineLog.create({
      location: name,
      status: "success",
      stage: "storage",
      message: "Pipeline completed successfully",
      duration_ms: duration,
      timestamp: fetchedAt,
    });

    return {
      ...processedDoc.toObject(),
      stage: "storage",
      status: "success",
      duration_ms: duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    await PipelineLog.create({
      location: name,
      status: "error",
      stage: currentStage,
      message: error.message,
      duration_ms: duration,
      timestamp: new Date(),
    });

    return {
      location: name,
      lat,
      lon,
      temp: 0,
      humidity: 0,
      cloud: 0,
      heatIndex: 0,
      riskScore: 0,
      cloudLabel: "Error",
      alerts: [],
      timestamp: new Date(),
      stage: currentStage,
      status: "error",
      message: error.message,
      duration_ms: duration,
    };
  }
}

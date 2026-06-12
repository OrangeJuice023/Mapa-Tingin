import dbConnect from "./mongodb";
import RawData from "@/models/RawData";
import ProcessedData from "@/models/ProcessedData";
import PipelineLog from "@/models/PipelineLog";
import { evaluateAlerts, getCloudLabel } from "./alertEngine";
import { computeHeatIndex, computeRiskScore } from "./calculations";

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

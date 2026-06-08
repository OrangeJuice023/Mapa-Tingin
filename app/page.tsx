"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Map as MapIcon,
  RefreshCw,
  Wind,
  Thermometer,
  Cloud,
  Tornado,
  ChevronRight,
  Database,
  Globe,
  Settings,
  Bell,
  Cpu,
} from "lucide-react";
import { format } from "date-fns";

// Components
import MetricCard from "@/components/MetricCard";
import LocationOverview from "@/components/LocationOverview";
import AlertPanel from "@/components/AlertPanel";
import PipelineVisualizer, { PipelineStage } from "@/components/PipelineVisualizer";
import TemperatureChart from "@/components/TemperatureChart";
import LocationMap from "@/components/LocationMap";
import GlobalAlertBanner from "@/components/GlobalAlertBanner";
import AdHocAnalysisPanel from "@/components/AdHocAnalysisPanel";

export default function MissionControl() {
  const [activeLocationName, setActiveLocationName] = useState("Quezon City");
  const [locationsData, setLocationsData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [pipelineState, setPipelineState] = useState<{
    stage: PipelineStage;
    status: "idle" | "running" | "error" | "success";
  }>({ stage: "idle", status: "idle" });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [adHocResult, setAdHocResult] = useState<any>(null);
  const [adHocLoading, setAdHocLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchHistory = useCallback(async (location: string) => {
    try {
      const res = await fetch(`/api/data?location=${encodeURIComponent(location)}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      console.error("Fetch History Error:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      setLocationsData(data);
      if (data.length > 0) {
        setLastSync(new Date());
      }
      return data;
    } catch (err) {
      console.error("Fetch Data Error:", err);
      return [];
    }
  }, []);

  const runAllPipelines = useCallback(async () => {
    setPipelineState({ stage: "fetch", status: "running" });
    try {
      const res = await fetch("/api/fetch-all", { method: "POST" });
      const results = await res.json();

      const sequence: PipelineStage[] = ["fetch", "cleaning", "processing", "alerts", "storage"];
      for (const step of sequence) {
        setPipelineState({ stage: step, status: "running" });
        await new Promise((r) => setTimeout(r, 600));
      }

      setPipelineState({ stage: "storage", status: "success" });
      fetchData();
      if (activeLocationName) fetchHistory(activeLocationName);

      setTimeout(() => setPipelineState({ stage: "idle", status: "idle" }), 2000);
    } catch (err) {
      setPipelineState({ stage: "idle", status: "error" });
    }
  }, [fetchData, activeLocationName, fetchHistory]);

  // Initial Load & Empty State check
  useEffect(() => {
    const init = async () => {
      const data = await fetchData();
      if (data && data.length === 0) {
        runAllPipelines();
      }
    };
    init();
  }, [fetchData, runAllPipelines]);

  useEffect(() => {
    if (activeLocationName) fetchHistory(activeLocationName);
  }, [activeLocationName, fetchHistory]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      runAllPipelines();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [autoRefresh, runAllPipelines]);

  // Ad-hoc location analysis via double-click on map
  const handleMapDoubleClick = useCallback(
    async (lat: number, lon: number) => {
      setPipelineState({ stage: "fetch", status: "running" });
      setAdHocLoading(true);
      setAdHocResult(null);

      try {
        let placeName = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
          );
          const geoData = await geoRes.json();
          if (geoData.display_name) {
            const parts = geoData.display_name.split(",");
            placeName = parts.slice(0, 2).join(",").trim();
          }
        } catch {
          // fall back to coordinate name
        }

        setPipelineState({ stage: "cleaning", status: "running" });
        await new Promise((r) => setTimeout(r, 400));
        setPipelineState({ stage: "processing", status: "running" });

        const res = await fetch("/api/fetch-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon, name: placeName }),
        });
        const result = await res.json();

        setPipelineState({ stage: "alerts", status: "running" });
        await new Promise((r) => setTimeout(r, 400));
        setPipelineState({ stage: "storage", status: "success" });

        setLocationsData((prev) => [result, ...prev.filter((d) => d.location !== placeName)]);
        setActiveLocationName(placeName);
        fetchHistory(placeName);
        setAdHocResult(result);

        setTimeout(() => setPipelineState({ stage: "idle", status: "idle" }), 2000);
      } catch (err) {
        console.error("Ad-hoc analysis failed:", err);
        setPipelineState({ stage: "idle", status: "error" });
      } finally {
        setAdHocLoading(false);
      }
    },
    [fetchHistory]
  );

  const activeData = locationsData.find((d) => d.location === activeLocationName) || locationsData[0];
  const highAlertLocations = locationsData
    .filter((d) => d.alerts.some((a: any) => a.level === "HIGH"))
    .map((d) => d.location);

  // Real trend: compare the two most recent readings for the active location.
  // historyData is sorted newest-first, so [0] is latest and [1] is previous.
  const trendFor = (key: "temp" | "humidity" | "cloud" | "heatIndex"): "up" | "down" | "none" => {
    if (historyData.length < 2) return "none";
    const latest = historyData[0]?.[key];
    const prev = historyData[1]?.[key];
    if (typeof latest !== "number" || typeof prev !== "number") return "none";
    if (latest > prev) return "up";
    if (latest < prev) return "down";
    return "none";
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen space-y-6 p-6 font-sans text-ink-muted">
      <GlobalAlertBanner highAlertLocations={highAlertLocations} />

      {/* Header */}
      <header className="relative mb-4 flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-elevated">
            <Globe className="h-7 w-7 text-telemetry" />
          </div>
          <div>
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-ink">
              Earth Observation Platform
              <span className="mt-1 self-start rounded bg-signal/15 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-signal">
                v1.0.4
              </span>
            </h1>
            <div className="mt-1.5 flex items-center gap-3 font-mono text-xs text-ink-faint">
              <span className="flex items-center gap-1.5 text-telemetry">
                <Activity className="h-3.5 w-3.5" /> Data stream active
              </span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <span>Last sync {format(lastSync, "HH:mm:ss")} PHT</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-panel px-4 py-2.5">
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? "animate-pulse bg-telemetry" : "bg-ink-faint"}`}></span>
            <span className="font-mono text-xs tracking-wide text-ink-muted">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`ml-1 cursor-pointer rounded-md px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
                autoRefresh ? "bg-telemetry/15 text-telemetry" : "bg-elevated text-ink-faint"
              }`}
            >
              {autoRefresh ? "ON" : "OFF"}
            </button>
          </div>

          <button
            onClick={runAllPipelines}
            disabled={pipelineState.status === "running"}
            className="group flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                pipelineState.status === "running"
                  ? "animate-spin"
                  : "transition-transform duration-500 group-hover:rotate-180"
              }`}
            />
            Run Pipeline
          </button>

          <button className="cursor-pointer rounded-lg border border-line bg-panel p-2.5 text-ink-muted transition-colors hover:border-signal/40 hover:text-ink">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Ad-hoc scan result */}
      {(adHocResult || adHocLoading) && (
        <div className="w-full pb-6">
          <AdHocAnalysisPanel
            result={adHocResult}
            isLoading={adHocLoading}
            onClose={() => {
              setAdHocResult(null);
              setAdHocLoading(false);
            }}
          />
        </div>
      )}

      {/* Hero Stats */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Ambient Temperature" value={activeData?.temp ?? "--"} unit="°C" icon={Thermometer} trend={trendFor("temp")} />
        <MetricCard label="Atmospheric Humidity" value={activeData?.humidity ?? "--"} unit="%" icon={Wind} trend={trendFor("humidity")} />
        <MetricCard label="Satellite Cloud Index" value={activeData?.cloud ?? "--"} unit="%" icon={Cloud} trend={trendFor("cloud")} />
        <MetricCard label="Computed Heat Intensity" value={activeData?.heatIndex ?? "--"} unit="°C" icon={Tornado} trend={trendFor("heatIndex")} />
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 items-stretch gap-8 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          <PipelineVisualizer currentStage={pipelineState.stage} status={pipelineState.status} />

          <div className="grid h-full grow grid-cols-1 gap-6 lg:grid-cols-2">
            <TemperatureChart data={historyData} location={activeLocationName} />
            <LocationMap locations={locationsData} onDoubleClick={handleMapDoubleClick} />
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-4">
          <AlertPanel
            alerts={locationsData.flatMap((d) =>
              d.alerts.map((a: any) => ({ ...a, location: d.location, timestamp: d.timestamp }))
            )}
          />
          <LocationOverview
            locations={locationsData}
            onSelect={setActiveLocationName}
            selectedLocation={activeLocationName}
          />
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-line pb-6 pt-12 text-ink-faint md:flex-row">
        <div className="flex items-center gap-6 font-mono text-[11px] tracking-wide">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-ink-faint" />
            <span>Core: Open-Meteo API</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-ink-faint" />
            <span>Storage: MongoDB Atlas</span>
          </div>
        </div>
        <p className="font-mono text-[11px]">Built for global environmental surveillance &copy; 2026</p>
      </footer>
    </div>
  );
}

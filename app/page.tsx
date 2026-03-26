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
  Cpu
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
        await new Promise(r => setTimeout(r, 600));
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
  const handleMapDoubleClick = useCallback(async (lat: number, lon: number) => {
    // Show loading in the main dashboard visualizer
    setPipelineState({ stage: "fetch", status: "running" });
    
    try {
      // Reverse geocode to get place name
      let placeName = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const geoData = await geoRes.json();
        if (geoData.display_name) {
          const parts = geoData.display_name.split(",");
          placeName = parts.slice(0, 2).join(",").trim();
        }
      } catch {
        // Use coordinate name if reverse geocoding fails
      }

      setPipelineState({ stage: "cleaning", status: "running" });
      await new Promise(r => setTimeout(r, 400));
      setPipelineState({ stage: "processing", status: "running" });

      // Run pipeline for this ad-hoc location
      const res = await fetch("/api/fetch-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, name: placeName }),
      });
      const result = await res.json();
      
      setPipelineState({ stage: "alerts", status: "running" });
      await new Promise(r => setTimeout(r, 400));
      setPipelineState({ stage: "storage", status: "success" });

      // Dynamically add the new scan to the main dashboard!
      setLocationsData(prev => [result, ...prev.filter(d => d.location !== placeName)]);
      setActiveLocationName(placeName);
      fetchHistory(placeName);

      setTimeout(() => setPipelineState({ stage: "idle", status: "idle" }), 2000);
    } catch (err) {
      console.error("Ad-hoc analysis failed:", err);
      setPipelineState({ stage: "idle", status: "error" });
    }
  }, [fetchHistory]);

  const activeData = locationsData.find(d => d.location === activeLocationName) || locationsData[0];
  const highAlertLocations = locationsData
    .filter(d => d.alerts.some((a: any) => a.level === "HIGH"))
    .map(d => d.location);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 font-sans selection:bg-cyan-500 selection:text-white p-6 space-y-6">
      <GlobalAlertBanner highAlertLocations={highAlertLocations} />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1f2937] pb-8 mb-4 relative">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-cyan-900/20 border-2 border-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Globe className="w-10 h-10 text-cyan-500 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase flex items-center gap-3">
                    Earth Observation Platform
                    <span className="bg-cyan-500 text-black text-[10px] px-2 py-0.5 rounded font-black tracking-normal self-start mt-1">v1.0.4</span>
                </h1>
                <div className="flex items-center gap-4 mt-1 text-gray-500 font-mono text-xs font-bold uppercase tracking-widest">
                    <span className="text-cyan-500/80 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Satellite Data Stream Active
                    </span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span>Last Sync: {format(lastSync, "HH:mm:ss")} PHT</span>
                </div>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] border border-[#1f2937] rounded-xl group transition-all hover:border-cyan-500/50">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoRefresh ? 'bg-cyan-400' : 'bg-gray-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${autoRefresh ? 'bg-cyan-500' : 'bg-gray-600'}`}></span>
            </div>
            <span className="text-xs font-bold font-mono tracking-tighter text-gray-400 uppercase">Auto-Refresh</span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`ml-1 px-3 py-1 rounded-md text-[10px] font-black transition-all ${autoRefresh ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-500'}`}
            >
              {autoRefresh ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <button 
            onClick={runAllPipelines}
            disabled={pipelineState.status === "running"}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold rounded-xl border border-cyan-400/30 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_15px_rgba(6,182,212,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-100 ${pipelineState.status === "running" ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            Run System Pipeline
          </button>
          
          <div className="p-2.5 bg-[#111827] border border-[#1f2937] rounded-xl hover:text-white cursor-pointer transition-all">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Hero Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Ambient Temperature" 
          value={activeData?.temp ?? "--"} 
          unit="°C" 
          icon={Thermometer} 
          trend="up"
        />
        <MetricCard 
          label="Atmospheric Humidity" 
          value={activeData?.humidity ?? "--"} 
          unit="%" 
          icon={Wind} 
          trend="none"
        />
        <MetricCard 
          label="Satellite Cloud Index" 
          value={activeData?.cloud ?? "--"} 
          unit="%" 
          icon={Cloud} 
          trend="down"
        />
        <MetricCard 
          label="Computed Heat Intensity" 
          value={activeData?.heatIndex ?? "--"} 
          unit="°C" 
          icon={Tornado} 
          trend="up"
        />
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <PipelineVisualizer currentStage={pipelineState.stage} status={pipelineState.status} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full grow">
            <TemperatureChart data={historyData} location={activeLocationName} />
            <LocationMap locations={locationsData} onDoubleClick={handleMapDoubleClick} />
          </div>
        </div>
        
        <div className="xl:col-span-4 flex flex-col gap-6">
          <AlertPanel alerts={locationsData.flatMap(d => d.alerts.map((a: any) => ({ ...a, location: d.location, timestamp: d.timestamp })))} />
          <LocationOverview 
            locations={locationsData} 
            onSelect={setActiveLocationName} 
            selectedLocation={activeLocationName} 
          />
        </div>
      </div>

      <footer className="pt-12 pb-6 border-t border-[#1f2937] flex flex-col md:flex-row justify-between items-center text-gray-500 gap-4">
        <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span>Core Logic: Open-Meteo API</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600" />
            <span>Storage: MongoDB Atlas Cluster</span>
          </div>
        </div>
        <p className="text-[10px] font-mono tracking-tighter">DESIGNED BY ANTIGRAVITY FOR GLOBAL ENVIRONMENTAL SURVEILLANCE &copy; 2026</p>
      </footer>
    </div>
  );
}

"use client";
import React from "react";
import { X, MapPin, Thermometer, Wind, Cloud, Tornado, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface AdHocResult {
  location: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  cloud: number;
  heatIndex: number;
  riskScore: number;
  cloudLabel: string;
  alerts: { type: string; level: string; message: string }[];
  status: string;
}

interface AdHocAnalysisPanelProps {
  result: AdHocResult | null;
  isLoading: boolean;
  onClose: () => void;
}

const AdHocAnalysisPanel: React.FC<AdHocAnalysisPanelProps> = ({ result, isLoading, onClose }) => {
  if (!isLoading && !result) return null;

  const getRiskColor = (score: number) => {
    if (score < 30) return { text: "text-emerald-500", bg: "bg-emerald-500", label: "LOW" };
    if (score < 60) return { text: "text-amber-500", bg: "bg-amber-500", label: "MODERATE" };
    return { text: "text-rose-500", bg: "bg-rose-500", label: "HIGH" };
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "HIGH": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case "MEDIUM": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl shadow-xl w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-5 py-3 border-b border-[#1f2937] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight truncate max-w-[300px] md:max-w-[600px] uppercase">
              {isLoading ? "Scanning Target Sector..." : result?.location || "Scan Complete"}
            </h3>
            {result && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">
                  Target Coordinates: {result.lat.toFixed(4)}°N, {result.lon.toFixed(4)}°E
                </p>
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Running pipeline...
          </p>
          <div className="flex gap-1.5 mt-1">
            {["F", "C", "P", "A", "S"].map((s, i) => (
              <div key={s} className="w-6 h-6 bg-cyan-900/20 border border-cyan-500/30 rounded flex items-center justify-center text-[9px] font-mono text-cyan-500 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : result ? (
        <div className="p-5 space-y-4">
          {/* Risk Level */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            result.riskScore < 30 ? "bg-emerald-500/10 border-emerald-500/30" :
            result.riskScore < 60 ? "bg-amber-500/10 border-amber-500/30" :
            "bg-rose-500/10 border-rose-500/30"
          }`}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Risk Level</p>
              <p className={`text-xl font-black ${getRiskColor(result.riskScore).text}`}>
                {getRiskColor(result.riskScore).label}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-black font-mono ${getRiskColor(result.riskScore).text}`}>
                {Math.round(result.riskScore)}
              </p>
              <p className="text-[9px] text-gray-500 font-bold">/ 100</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a0e1a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Temp</span>
              </div>
              <p className="text-lg font-black text-white">{result.temp}<span className="text-xs text-gray-500">°C</span></p>
            </div>
            <div className="bg-[#0a0e1a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Wind className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Humidity</span>
              </div>
              <p className="text-lg font-black text-white">{result.humidity}<span className="text-xs text-gray-500">%</span></p>
            </div>
            <div className="bg-[#0a0e1a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Cloud className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Cloud</span>
              </div>
              <p className="text-lg font-black text-white">{result.cloud}<span className="text-xs text-gray-500">%</span></p>
              <p className="text-[9px] text-gray-600">{result.cloudLabel}</p>
            </div>
            <div className="bg-[#0a0e1a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Tornado className="w-3 h-3 text-rose-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Heat Idx</span>
              </div>
              <p className="text-lg font-black text-white">{result.heatIndex}<span className="text-xs text-gray-500">°C</span></p>
            </div>
          </div>

          {/* Alerts */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Alerts</p>
            {result.alerts.length === 0 ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-bold">No threats detected</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {result.alerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                    alert.level === "HIGH" ? "bg-rose-500/10 border-rose-500/30" :
                    alert.level === "MEDIUM" ? "bg-amber-500/10 border-amber-500/30" :
                    "bg-cyan-500/10 border-cyan-500/30"
                  }`}>
                    {getAlertIcon(alert.level)}
                    <div>
                      <p className="text-[10px] font-bold text-white">{alert.type.replace("_", " ").toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdHocAnalysisPanel;

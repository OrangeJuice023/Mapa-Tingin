import React from "react";
import { formatDistanceToNow } from "date-fns";

export interface DashboardLocation {
  location: string;
  riskScore: number;
  alerts: any[];
  timestamp: string | Date;
}

interface LocationOverviewProps {
  locations: DashboardLocation[];
  onSelect: (name: string) => void;
  selectedLocation: string;
}

const LocationOverview: React.FC<LocationOverviewProps> = ({ locations, onSelect, selectedLocation }) => {
  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-emerald-500";
    if (score < 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return "LOW";
    if (score < 60) return "MODERATE";
    return "HIGH";
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-[#1f2937]">
        <h3 className="text-xl font-bold text-white tracking-wide">Location Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Risk Score</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Alerts</th>
              <th className="px-6 py-3 text-right">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Waiting for pipeline sequence...
                  </div>
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr 
                  key={loc.location} 
                  onClick={() => onSelect(loc.location)}
                  className={`group cursor-pointer hover:bg-[#1e293b]/50 transition-colors ${selectedLocation === loc.location ? "bg-cyan-950/20" : ""}`}
                >
                  <td className="px-6 py-4 font-semibold text-white">
                    {loc.location}
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${getRiskColor(loc.riskScore)}`}
                          style={{ width: `${loc.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400">{Math.round(loc.riskScore)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                      loc.riskScore < 30 ? "bg-emerald-500/10 text-emerald-500" :
                      loc.riskScore < 60 ? "bg-amber-500/10 text-amber-500" :
                      "bg-rose-500/10 text-rose-500"
                    }`}>
                      {getRiskLevel(loc.riskScore)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${loc.alerts.length > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                      {loc.alerts.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                    {formatDistanceToNow(new Date(loc.timestamp), { addSuffix: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationOverview;

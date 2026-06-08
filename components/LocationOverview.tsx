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
  const getRiskBar = (s: number) => (s < 30 ? "bg-ok" : s < 60 ? "bg-warn" : "bg-critical");
  const getRiskPill = (s: number) => (s < 30 ? "bg-ok/10 text-ok" : s < 60 ? "bg-warn/10 text-warn" : "bg-critical/10 text-critical");
  const getRiskLevel = (s: number) => (s < 30 ? "LOW" : s < 60 ? "MODERATE" : "HIGH");

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-display text-sm font-semibold tracking-wide text-ink">Location Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-elevated text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Risk Score</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Alerts</th>
              <th className="px-5 py-3 text-right font-semibold">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink-muted">
                  <div className="flex flex-col items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-telemetry" />
                    Waiting for pipeline sequence…
                  </div>
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr
                  key={loc.location}
                  onClick={() => onSelect(loc.location)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") onSelect(loc.location); }}
                  className={`cursor-pointer outline-none transition-colors hover:bg-elevated focus-visible:bg-elevated ${selectedLocation === loc.location ? "bg-signal/10" : ""}`}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-ink">{loc.location}</td>
                  <td className="w-48 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                        <div className={`h-full transition-all duration-1000 ${getRiskBar(loc.riskScore)}`} style={{ width: `${Math.min(100, loc.riskScore)}%` }} />
                      </div>
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{Math.round(loc.riskScore)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide ${getRiskPill(loc.riskScore)}`}>
                      {getRiskLevel(loc.riskScore)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-sm font-semibold ${loc.alerts.length > 0 ? "text-critical" : "text-ok"}`}>
                      {loc.alerts.length}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-xs text-ink-faint">
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

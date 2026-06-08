import React from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export interface GlobalAlert {
  location: string;
  type: string;
  level: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  timestamp: string | Date;
}

interface AlertPanelProps {
  alerts: GlobalAlert[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const getAlertStyles = (level: string) => {
    switch (level) {
      case "HIGH":
        return { bg: "bg-critical/10", border: "border-critical/40", text: "text-critical", icon: ShieldAlert };
      case "MEDIUM":
        return { bg: "bg-warn/10", border: "border-warn/40", text: "text-warn", icon: AlertTriangle };
      case "LOW":
        return { bg: "bg-telemetry/10", border: "border-telemetry/40", text: "text-telemetry", icon: Info };
      default:
        return { bg: "bg-elevated", border: "border-line", text: "text-ink-faint", icon: Info };
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wide text-ink">
          Critical Events
          {alerts.length > 0 && (
            <span className="rounded-full bg-critical/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-critical">
              {alerts.length} LIVE
            </span>
          )}
        </h3>
        <span className="font-mono text-xs text-ink-faint">{alerts.length} active</span>
      </div>
      <div className="max-h-[400px] flex-1 space-y-2.5 overflow-y-auto p-4">
        {alerts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-ok/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-ok" />
            </div>
            <p className="text-sm font-medium text-ink">No active alerts</p>
            <p className="text-xs text-ink-faint">System status optimal</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const styles = getAlertStyles(alert.level);
            const Icon = styles.icon;
            return (
              <div key={`${alert.location}-${idx}`} className={`flex gap-3 rounded-lg border ${styles.border} ${styles.bg} p-4`}>
                <div className={`mt-0.5 ${styles.text}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${styles.text}`}>{alert.level} risk</span>
                    <span className="font-mono text-[11px] text-ink-faint">{format(new Date(alert.timestamp), "HH:mm:ss")}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{alert.location}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertPanel;

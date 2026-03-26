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
        return { bg: "bg-rose-500/10", border: "border-rose-500/50", text: "text-rose-500", icon: ShieldAlert };
      case "MEDIUM":
        return { bg: "bg-amber-500/10", border: "border-amber-500/50", text: "text-amber-500", icon: AlertTriangle };
      case "LOW":
        return { bg: "bg-cyan-500/10", border: "border-cyan-500/50", text: "text-cyan-500", icon: Info };
      default:
        return { bg: "bg-gray-500/10", border: "border-gray-500/50", text: "text-gray-500", icon: Info };
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col h-full shadow-xl">
      <div className="px-6 py-4 border-b border-[#1f2937] flex justify-between items-center bg-[#0f172a]">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Critical Events
          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
            LIVE
          </span>
        </h3>
        <span className="text-gray-500 text-xs font-mono">{alerts.length} active alerts</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
            <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <p className="font-medium">No active alerts</p>
            <p className="text-xs">System status optimal</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const styles = getAlertStyles(alert.level);
            const Icon = styles.icon;
            return (
              <div 
                key={`${alert.location}-${idx}`} 
                className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300`}
              >
                <div className={`mt-1 ${styles.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-black uppercase tracking-widest ${styles.text}`}>
                      {alert.level} RISK
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {format(new Date(alert.timestamp), "HH:mm:ss")}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm mt-1">{alert.location}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{alert.message}</p>
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

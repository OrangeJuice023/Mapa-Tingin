import React from "react";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "none";
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon: Icon, trend }) => {
  const isLive = value !== "--";
  return (
    <div className="group relative rounded-lg border border-line bg-panel p-5 transition-colors duration-200 hover:border-signal/40">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-medium tracking-wide text-ink-muted">{label}</span>
        <div className={`rounded-md p-2 ${isLive ? "bg-telemetry/10" : "bg-elevated"}`}>
          <Icon className={`h-4 w-4 ${isLive ? "text-telemetry" : "text-ink-faint"}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tabular-nums text-ink">{value}</span>
        <span className="text-sm font-medium text-ink-faint">{unit}</span>
      </div>
      {trend && trend !== "none" && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-ok" : "text-critical"}`}>
          {trend === "up" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          <span>{trend === "up" ? "Rising" : "Falling"}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

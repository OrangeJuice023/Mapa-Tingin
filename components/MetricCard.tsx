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
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">{label}</span>
        <div className="p-2 bg-cyan-900/20 rounded-lg">
          <Icon className="w-5 h-5 text-cyan-500" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-gray-500 mb-1 text-sm font-medium">{unit}</span>
      </div>
      {trend && trend !== "none" && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
          {trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{trend === "up" ? "Rising" : "Falling"}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

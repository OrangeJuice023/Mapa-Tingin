import React from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

interface ChartData {
  timestamp: string | Date;
  temp: number;
  heatIndex: number;
}

interface TemperatureChartProps {
  data: ChartData[];
  location: string;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, location }) => {
  const chartData = [...data].reverse().map((d) => ({
    ...d,
    timeLabel: format(new Date(d.timestamp), "HH:mm"),
  }));

  return (
    <div className="flex h-full min-h-[400px] grow flex-col rounded-lg border border-line bg-panel p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-ink">Trend Analysis</h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">{location} · 24h profile</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-telemetry" />
            <span className="text-xs font-medium text-ink-muted">Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-critical" />
            <span className="text-xs font-medium text-ink-muted">Heat Index</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232c3d" />
            <XAxis dataKey="timeLabel" stroke="#5b6677" fontSize={11} tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} />
            <YAxis stroke="#5b6677" fontSize={11} tickLine={false} axisLine={false} unit="°C" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a2333", border: "1px solid #232c3d", color: "#e8edf4", fontSize: "12px", borderRadius: "8px" }}
              itemStyle={{ color: "#e8edf4" }}
              cursor={{ stroke: "#232c3d" }}
            />
            <Area type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" dot={{ fill: "#22d3ee", r: 3 }} activeDot={{ fill: "#22d3ee", r: 5, stroke: "#0b0f1a", strokeWidth: 2 }} animationDuration={1200} />
            <Area type="monotone" dataKey="heatIndex" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorHeat)" dot={false} animationDuration={1600} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;

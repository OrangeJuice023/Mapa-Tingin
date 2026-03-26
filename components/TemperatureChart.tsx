import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
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
  const chartData = [...data].reverse().map(d => ({
    ...d,
    timeLabel: format(new Date(d.timestamp), "HH:mm")
  }));

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 shadow-xl flex flex-col h-full grow min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">Trend Analysis</h3>
          <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">{location} • 24H Profile</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs text-gray-400 font-medium">Internal Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-gray-400 font-medium">Computed Heat Index</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#4b5563" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              unit="°C"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937', color: '#fff', fontSize: '12px', borderRadius: '8px' }}
              itemStyle={{ color: '#06b6d4' }}
              cursor={{ stroke: '#1f2937' }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#06b6d4" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ fill: '#06b6d4', r: 6, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="heatIndex" 
              stroke="#f43f5e" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorHeat)" 
              dot={false}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;

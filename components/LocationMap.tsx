"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Neural Link Handshake...</span>
            </div>
        </div>
    )
});

interface MapLocation {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  heatIndex: number;
  riskScore: number;
  alerts: any[];
}

interface LocationMapProps {
  locations: MapLocation[];
  onDoubleClick?: (lat: number, lon: number) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ locations, onDoubleClick }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return (
    <div className="w-full h-[500px] bg-[#111827] rounded-xl flex items-center justify-center text-gray-400">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Connecting Satellite Relay...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 shadow-2xl relative overflow-hidden h-full flex flex-col">
        <div className="absolute top-4 left-4 z-[1000] bg-[#0a0e1a]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-[10px] uppercase font-bold text-cyan-400 tracking-tighter">
            Satellite View
        </div>
        <div className="absolute top-4 right-4 z-[1000] bg-[#0a0e1a]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 text-[10px] uppercase font-medium text-gray-500 tracking-tighter">
            Double-click to analyze
        </div>
      <div className="flex-1 w-full rounded-lg overflow-hidden border border-gray-800 min-h-[300px]">
        <MapInner locations={locations} onDoubleClick={onDoubleClick} />
      </div>
    </div>
  );
};

export default LocationMap;

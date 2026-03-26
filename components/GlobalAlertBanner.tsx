import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface GlobalAlertBannerProps {
  highAlertLocations: string[];
}

const GlobalAlertBanner: React.FC<GlobalAlertBannerProps> = ({ highAlertLocations }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (highAlertLocations.length > 0) {
      setIsVisible(true);
    }
  }, [highAlertLocations]);

  if (!isVisible || highAlertLocations.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 animate-in slide-in-from-top duration-500">
      <div className="bg-rose-600/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(225,29,72,0.4)] border border-rose-500/50 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Critical Environmental Alert</p>
            <p className="font-semibold text-lg drop-shadow-md">
              Extreme conditions detected in: <span className="underline decoration-2 underline-offset-4">{highAlertLocations.join(", ")}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GlobalAlertBanner;

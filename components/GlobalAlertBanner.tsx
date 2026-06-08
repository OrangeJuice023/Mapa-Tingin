import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface GlobalAlertBannerProps {
  highAlertLocations: string[];
}

const GlobalAlertBanner: React.FC<GlobalAlertBannerProps> = ({ highAlertLocations }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (highAlertLocations.length > 0) setIsVisible(true);
  }, [highAlertLocations]);

  if (!isVisible || highAlertLocations.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-20 z-[100] w-full max-w-3xl -translate-x-1/2 px-4">
      <div className="flex items-center justify-between gap-6 rounded-lg border border-critical/50 bg-critical/95 px-5 py-4 text-white shadow-[0_10px_40px_rgba(244,63,94,0.3)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="rounded-md bg-white/15 p-2">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider opacity-90">Critical environmental alert</p>
            <p className="font-display text-base font-semibold">
              Extreme conditions in <span className="underline decoration-2 underline-offset-4">{highAlertLocations.join(", ")}</span>
            </p>
          </div>
        </div>
        <button onClick={() => setIsVisible(false)} className="shrink-0 cursor-pointer rounded-md p-2 transition-colors hover:bg-white/15">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default GlobalAlertBanner;

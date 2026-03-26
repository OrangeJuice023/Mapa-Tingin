import React from "react";
import { CheckCircle2, Circle, XCircle, Activity, Database, Search, FlaskConical, AlertCircle } from "lucide-react";

export type PipelineStage = "fetch" | "cleaning" | "processing" | "alerts" | "storage" | "idle";

const stages = [
  { id: "fetch", label: "API Fetch", icon: Search },
  { id: "cleaning", label: "Cleaning", icon: FlaskConical },
  { id: "processing", label: "Processing", icon: Activity },
  { id: "alerts", label: "Risk Eval", icon: AlertCircle },
  { id: "storage", label: "Storage", icon: Database },
];

interface PipelineVisualizerProps {
  currentStage: PipelineStage;
  status: "idle" | "running" | "error" | "success";
}

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ currentStage, status }) => {
  const getStageStatus = (stageId: string) => {
    const stageIdx = stages.findIndex(s => s.id === stageId);
    const currentIdx = stages.findIndex(s => s.id === currentStage);

    if (status === "idle") return "idle";
    if (stageId === currentStage) {
        if (status === "error") return "error";
        return "active";
    }
    if (currentIdx === -1 || stageIdx < currentIdx) return "completed";
    return "pending";
  };

  const colors = {
    idle: "text-gray-600 border-gray-800",
    active: "text-cyan-500 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse",
    completed: "text-emerald-500 border-emerald-500",
    error: "text-rose-500 border-rose-500",
    pending: "text-gray-500 border-gray-700",
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600 animate-pulse pointer-events-none" />
      <div className="flex items-center justify-between relative z-10 w-full">
        {stages.map((stage, idx) => {
          const sStatus = getStageStatus(stage.id);
          const Icon = stage.icon;
          
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-4 relative">
                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center bg-[#0a0e1a] transition-all duration-500 ${colors[sStatus as keyof typeof colors]}`}>
                  {sStatus === "completed" ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : sStatus === "error" ? (
                    <XCircle className="w-8 h-8" />
                  ) : (
                    <Icon className="w-8 h-8" />
                  )}
                </div>
                <div className="text-center">
                    <p className={`text-xs font-bold tracking-widest uppercase ${sStatus === 'active' ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {stage.label}
                    </p>
                </div>
              </div>
              
              {idx < stages.length - 1 && (
                <div className="flex-1 h-0.5 max-w-[120px] bg-gray-800 relative mx-4">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-700 ${sStatus === 'completed' || (sStatus === 'active' && status === 'running') ? 'bg-cyan-500 w-full' : 'w-0'}`} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0e1a] rounded-full border border-gray-800">
          <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-cyan-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-[10px] uppercase tracking-tighter font-extrabold text-gray-500">
            Pipeline {status === 'idle' ? 'Ready' : status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualizer;

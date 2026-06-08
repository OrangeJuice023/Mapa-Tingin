import React from "react";
import { CheckCircle2, XCircle, Activity, Database, Search, FlaskConical, AlertCircle } from "lucide-react";

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
    const stageIdx = stages.findIndex((s) => s.id === stageId);
    const currentIdx = stages.findIndex((s) => s.id === currentStage);
    if (status === "idle") return "idle";
    if (stageId === currentStage) return status === "error" ? "error" : "active";
    if (currentIdx === -1 || stageIdx < currentIdx) return "completed";
    return "pending";
  };

  const colors = {
    idle: "text-ink-faint border-line bg-base",
    active: "text-telemetry border-telemetry bg-telemetry/5 ring-2 ring-telemetry/20",
    completed: "text-ok border-ok/60 bg-ok/5",
    error: "text-critical border-critical bg-critical/5",
    pending: "text-ink-faint border-line bg-base",
  };

  return (
    <div className="rounded-lg border border-line bg-panel p-6">
      <div className="mb-6 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${status === "running" ? "animate-pulse bg-telemetry" : status === "error" ? "bg-critical" : "bg-ok"}`} />
        <h3 className="font-display text-sm font-semibold tracking-wide text-ink">Processing Pipeline</h3>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {status === "idle" ? "Ready" : status}
        </span>
      </div>
      <div className="relative z-10 flex w-full items-start justify-between">
        {stages.map((stage, idx) => {
          const sStatus = getStageStatus(stage.id);
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500 ${colors[sStatus as keyof typeof colors]}`}>
                  {sStatus === "completed" ? <CheckCircle2 className="h-6 w-6" /> : sStatus === "error" ? <XCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <p className={`text-center text-[11px] font-medium tracking-wide ${sStatus === "active" ? "text-telemetry" : sStatus === "completed" ? "text-ink-muted" : "text-ink-faint"}`}>
                  {stage.label}
                </p>
              </div>
              {idx < stages.length - 1 && (
                <div className="relative mx-3 mt-6 h-0.5 max-w-[120px] flex-1 bg-line">
                  <div className={`absolute left-0 top-0 h-full bg-telemetry transition-all duration-700 ${sStatus === "completed" || (sStatus === "active" && status === "running") ? "w-full" : "w-0"}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualizer;

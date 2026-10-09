import React from "react";
import { ClipboardList, Radar, Microscope, BarChart3, LayoutGrid, MousePointerClick, Rocket, TrendingUp, Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Onboarding", icon: ClipboardList, desc: "Share your vision" },
  { id: 2, label: "Skip Trace", icon: Radar, desc: "Intelligence enrichment" },
  { id: 3, label: "Research", icon: Microscope, desc: "10 strategies generated" },
  { id: 4, label: "Simulation", icon: BarChart3, desc: "100-site benchmark + scaling" },
  { id: 5, label: "Mockups", icon: LayoutGrid, desc: "10 website designs via GPT Sync" },
  { id: 6, label: "Selection", icon: MousePointerClick, desc: "Pick your favorite" },
  { id: 7, label: "Provisioning", icon: Rocket, desc: "Website + portal + social + agents" },
  { id: 8, label: "Scaling", icon: TrendingUp, desc: "Hundreds of programmatic sites" },
];

export default function PipelineTimeline({ currentStep, completedSteps = [] }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start justify-between min-w-[760px] md:min-w-0 px-2">
        {STEPS.map((step, i) => {
          const isComplete = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isComplete
                      ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30"
                      : isCurrent
                      ? "border-cyan-400 bg-[#0d141e] shadow-lg shadow-cyan-500/40 animate-pulse"
                      : "border-slate-700 bg-[#0d141e]"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5 text-cyan-300" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? "text-cyan-300" : "text-slate-600"}`} />
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    isComplete ? "text-cyan-300" : isCurrent ? "text-cyan-200" : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
                <span className={`text-[9px] text-center leading-tight hidden md:block ${isUpcoming ? "text-slate-700" : "text-slate-500"}`}>
                  {step.desc}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mt-[22px] mx-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isComplete ? "bg-gradient-to-r from-cyan-500 to-cyan-400" : "bg-slate-800"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export { STEPS };
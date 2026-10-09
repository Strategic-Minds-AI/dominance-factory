import React from "react";
import { User, Eye, Search, Brain, Rocket, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Onboarding", icon: User },
  { number: 2, label: "Vision", icon: Eye },
  { number: 3, label: "Topics", icon: Search },
  { number: 4, label: "Research", icon: Brain },
  { number: 5, label: "Strategy", icon: Rocket },
];

export default function PipelineTimeline({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="border-b border-white/10 bg-zinc-950 sticky top-0 z-20">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 pt-2 sm:hidden">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="truncate pl-2 text-[11px] font-medium text-white/60">
          {STEPS[currentStep - 1]?.label || ""}
        </span>
      </div>

      {/* Horizontal step strip */}
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1.5">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCurrent = step.number === currentStep;
          const isCompleted = completedSteps.includes(step.number);
          const isAccessible = step.number <= currentStep || isCompleted;
          return (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => isAccessible && onStepClick?.(step.number)}
                disabled={!isAccessible}
                className={cn(
                  "group flex cursor-pointer flex-col items-center gap-1 shrink-0",
                  !isAccessible && "cursor-not-allowed opacity-40"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all sm:h-10 sm:w-10",
                    isCurrent && "border-blue-500 bg-blue-500 text-white",
                    !isCurrent && isCompleted && "border-green-500 bg-green-500 text-black",
                    !isCurrent && !isCompleted && isAccessible && "border-white/15 bg-zinc-900 text-white/40 hover:border-blue-500/40 hover:text-blue-300",
                    !isAccessible && "border-white/10 bg-zinc-900 text-white/20"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span
                  className={cn(
                    "hidden whitespace-nowrap text-[11px] font-medium sm:block",
                    isCurrent ? "text-blue-400" : isCompleted ? "text-green-400" : "text-white/30"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-0.5 h-0.5 w-3 shrink-0 rounded-full sm:mx-1 sm:w-5",
                    isCompleted || (isCurrent && i < currentStep - 1) ? "bg-green-500" : "bg-white/10"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
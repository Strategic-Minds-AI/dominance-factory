import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import PipelineTimeline, { STEPS } from "@/components/godmode/PipelineTimeline";
import OnboardingStep from "@/components/godmode/OnboardingStep";
import AutomatedStep from "@/components/godmode/AutomatedStep";
import SelectionStep from "@/components/godmode/SelectionStep";
import ProvisioningStep from "@/components/godmode/ProvisioningStep";
import ScalingStep from "@/components/godmode/ScalingStep";
import { base44 } from "@/api/base44Client";

export default function GodModePipeline() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [session, setSession] = useState(null);
  const [stepStatus, setStepStatus] = useState({});
  const [stepOutput, setStepOutput] = useState({});
  const [selectedDesign, setSelectedDesign] = useState(null);

  const markComplete = (step) => {
    setCompleted((c) => (c.includes(step) ? c : [...c, step]));
  };

  const runAutomatedStep = useCallback(async (stepNum, fn) => {
    setStepStatus((s) => ({ ...s, [stepNum]: "running" }));
    try {
      const result = await fn();
      setStepOutput((o) => ({ ...o, [stepNum]: result }));
      setStepStatus((s) => ({ ...s, [stepNum]: "complete" }));
      markComplete(stepNum);
      return result;
    } catch (err) {
      setStepStatus((s) => ({ ...s, [stepNum]: "error" }));
      setStepOutput((o) => ({ ...o, [stepNum]: err.message }));
      throw err;
    }
  }, []);

  const handleOnboardingComplete = async (newSession) => {
    setSession(newSession);
    markComplete(1);
    setCurrentStep(2);

    // Step 2: Skip Trace
    try {
      await runAutomatedStep(2, async () => {
        await base44.entities.OnboardingSession.update(newSession.id, { skip_trace_status: "running" });
        const res = await base44.functions.invoke("onboardingAI", {
          action: "skip_trace",
          session_id: newSession.id,
        });
        return res;
      });
      setCurrentStep(3);
    } catch {
      return; // stays on step 2 showing error
    }

    // Step 3: Research (10 strategies)
    try {
      await runAutomatedStep(3, async () => {
        const res = await base44.functions.invoke("autonomousResearchEngine", {
          action: "generate_strategies",
          session_id: newSession.id,
        });
        return res;
      });
      setCurrentStep(4);
    } catch {
      return;
    }

    // Step 4: Simulation (100-site benchmark)
    try {
      await runAutomatedStep(4, async () => {
        const res = await base44.functions.invoke("godModeSeo", {
          action: "run_simulation",
          session_id: newSession.id,
          benchmark_sites: 100,
        });
        return res;
      });
      setCurrentStep(5);
    } catch {
      return;
    }

    // Step 5: Mockups via GPT Sync
    try {
      await runAutomatedStep(5, async () => {
        const res = await base44.functions.invoke("ingestPack", {
          action: "generate_mockups",
          session_id: newSession.id,
          count: 10,
        });
        return res;
      });
      setCurrentStep(6);
    } catch {
      return;
    }
  };

  const handleDesignSelected = (design) => {
    setSelectedDesign(design);
    markComplete(6);
    setCurrentStep(7);
  };

  const handleProvisioningComplete = () => {
    markComplete(7);
    setCurrentStep(8);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep onComplete={handleOnboardingComplete} />;
      case 2:
      case 3:
      case 4:
      case 5:
        return (
          <AutomatedStep
            stepNum={currentStep}
            stepLabel={STEPS[currentStep - 1].label}
            stepDesc={STEPS[currentStep - 1].desc}
            status={stepStatus[currentStep] || "running"}
            output={stepOutput[currentStep]}
            onDone={stepStatus[currentStep] === "complete" ? () => {} : undefined}
          />
        );
      case 6:
        return <SelectionStep onSelect={handleDesignSelected} />;
      case 7:
        return <ProvisioningStep onComplete={handleProvisioningComplete} />;
      case 8:
        return <ScalingStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Sticky timeline header */}
      <div className="sticky top-0 z-20 bg-[#05070a]/95 backdrop-blur border-b border-cyan-500/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold tracking-wider text-cyan-300">GOD MODE PIPELINE</span>
            </div>
          </div>
          <PipelineTimeline currentStep={currentStep} completedSteps={completed} />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-6xl mx-auto px-4 py-12 min-h-[60vh]">
        {renderStep()}
      </div>
    </div>
  );
}
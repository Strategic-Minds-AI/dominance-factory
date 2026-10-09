import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PipelineTimeline from "@/components/onboarding/PipelineTimeline";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import VisionPanel from "@/components/onboarding/VisionPanel";
import GoogleRequirements from "@/components/onboarding/GoogleRequirements";
import TopicDiscovery from "@/components/onboarding/TopicDiscovery";
import WebsiteBlueprint from "@/components/onboarding/WebsiteBlueprint";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, ArrowRight, ArrowLeft, Rocket, RefreshCw, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

export default function OnboardingPipeline() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [skipTraceStatus, setSkipTraceStatus] = useState("pending");
  const [skipTraceResults, setSkipTraceResults] = useState(null);
  const [skipTraceError, setSkipTraceError] = useState("");

  const [onboardingData, setOnboardingData] = useState({
    full_name: "", phone: "", email: "", business_address: "", business_type: "",
  });
  const [vision, setVision] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const context = {
    ...onboardingData,
    vision_statement: vision,
    selected_topic: selectedTopic,
  };

  const runSkipTrace = useCallback(async () => {
    if (skipTraceStatus === "running" || skipTraceStatus === "complete") return;
    setSkipTraceStatus("running");
    setSkipTraceError("");
    try {
      const res = await base44.functions.invoke("onboardingAI", { action: "skip_trace", context });
      const results = res?.results || res?.data?.results;
      if (results) {
        setSkipTraceResults(results);
        setSkipTraceStatus("complete");
        if (sessionId) {
          await base44.entities.OnboardingSession.update(sessionId, {
            skip_trace_results: JSON.stringify(results),
            skip_trace_status: "complete",
            compounded_context: JSON.stringify(context),
          });
        }
      } else {
        setSkipTraceStatus("failed");
        setSkipTraceError("Skip trace returned no results");
      }
    } catch (e) {
      setSkipTraceStatus("failed");
      setSkipTraceError(e.message || "Skip trace failed");
    }
  }, [skipTraceStatus, sessionId, context]);

  const goToStep = (step) => {
    if (step <= currentStep || completedSteps.includes(step)) setCurrentStep(step);
  };

  const markComplete = (step) => setCompletedSteps((prev) => [...new Set([...prev, step])]);

  const completeStep1 = async () => {
    markComplete(1);
    try {
      const session = await base44.entities.OnboardingSession.create({
        session_label: `${onboardingData.full_name} — ${onboardingData.business_type}`,
        full_name: onboardingData.full_name, phone: onboardingData.phone, email: onboardingData.email,
        business_address: onboardingData.business_address, business_type: onboardingData.business_type,
        compounded_context: JSON.stringify(context), current_step: 2, skip_trace_status: "pending",
      });
      setSessionId(session.id);
    } catch (e) { console.error("Failed to create session:", e); }
    runSkipTrace();
    setCurrentStep(2);
  };

  const completeStep2 = async () => {
    markComplete(2);
    if (sessionId) await base44.entities.OnboardingSession.update(sessionId, { vision_statement: vision, compounded_context: JSON.stringify(context), current_step: 3 });
    setCurrentStep(3);
  };

  const completeStep3 = () => { markComplete(3); setCurrentStep(4); };

  const completeStep4 = async () => {
    markComplete(4);
    if (sessionId) await base44.entities.OnboardingSession.update(sessionId, { selected_topic: selectedTopic, compounded_context: JSON.stringify(context), current_step: 5 });
    setCurrentStep(5);
  };

  const completeStep5 = () => { markComplete(5); setCurrentStep(6); };

  const completeStep6 = () => { markComplete(6); setCurrentStep(7); };

  const finishPipeline = async () => {
    markComplete(7);
    if (sessionId) await base44.entities.OnboardingSession.update(sessionId, { status: "completed", compounded_context: JSON.stringify(context), current_step: 7 });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <PipelineTimeline currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <div className="p-6">
        {/* Skip Trace Status Banner */}
        {(skipTraceStatus === "running" || skipTraceStatus === "complete" || skipTraceStatus === "failed") && currentStep >= 2 && (
          <div className={`max-w-3xl mx-auto mb-4 p-3 rounded-lg border flex items-center gap-3 ${
            skipTraceStatus === "running" ? "border-blue-500/30 bg-blue-500/5" :
            skipTraceStatus === "complete" ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
          }`}>
            {skipTraceStatus === "running" && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            {skipTraceStatus === "complete" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {skipTraceStatus === "failed" && <AlertCircle className="w-4 h-4 text-red-400" />}
            <p className="text-sm font-medium text-white flex-1">
              {skipTraceStatus === "running" && "Skip Trace Running — researching your info in the background..."}
              {skipTraceStatus === "complete" && "Skip Trace Complete — research results ready in Step 5"}
              {skipTraceStatus === "failed" && `Skip Trace Failed — ${skipTraceError}`}
            </p>
            {skipTraceStatus === "failed" && (
              <Button variant="outline" size="sm" onClick={runSkipTrace} className="border-white/10 text-white text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            )}
          </div>
        )}

        {/* Step 1: Onboarding */}
        {currentStep === 1 && (
          <OnboardingForm data={onboardingData} onChange={setOnboardingData} context={context} onComplete={completeStep1} />
        )}

        {/* Step 2: Vision */}
        {currentStep === 2 && (
          <VisionPanel vision={vision} onChange={setVision} context={context} onComplete={completeStep2} onBack={() => setCurrentStep(1)} />
        )}

        {/* Step 3: Google Requirements */}
        {currentStep === 3 && (
          <GoogleRequirements context={context} onComplete={completeStep3} onBack={() => setCurrentStep(2)} />
        )}

        {/* Step 4: Topics */}
        {currentStep === 4 && (
          <TopicDiscovery selectedTopic={selectedTopic} onSelect={setSelectedTopic} context={context} onComplete={completeStep4} onBack={() => setCurrentStep(3)} />
        )}

        {/* Step 5: Skip Trace Research */}
        {currentStep === 5 && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                <Brain className="w-4 h-4" /> Step 5: Skip Trace Research
              </div>
              <h2 className="text-xl font-bold text-white">Background Research Results</h2>
              <p className="text-sm text-white/50 mt-1">AI-powered research on your business, industry, competitors, and market opportunities.</p>
            </div>

            {skipTraceStatus === "running" && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-sm text-white/50 mt-3">Analyzing your business and researching opportunities...</p>
              </div>
            )}

            {skipTraceStatus === "failed" && (
              <Card className="p-6 bg-red-500/5 border-red-500/30 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-300 mb-3">{skipTraceError}</p>
                <Button variant="outline" onClick={runSkipTrace} className="border-white/10 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry Skip Trace
                </Button>
              </Card>
            )}

            {skipTraceStatus === "complete" && skipTraceResults && (
              <div className="space-y-4">
                {skipTraceResults.research_summary && (
                  <Card className="p-5 bg-blue-500/5 border-blue-500/30"><p className="text-sm text-white/80">{skipTraceResults.research_summary}</p></Card>
                )}
                {skipTraceResults.business_analysis && (
                  <Card className="p-5 bg-zinc-900 border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-3">Business Analysis</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <p><span className="text-white/50">Industry Outlook:</span> {skipTraceResults.business_analysis.industry_outlook}</p>
                      <p><span className="text-white/50">Target Market:</span> {skipTraceResults.business_analysis.target_market}</p>
                      <p><span className="text-white/50">Competitive Landscape:</span> {skipTraceResults.business_analysis.competitive_landscape}</p>
                      {skipTraceResults.business_analysis.key_differentiators?.length > 0 && (
                        <div><span className="text-white/50">Key Differentiators:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {skipTraceResults.business_analysis.key_differentiators.map((d, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-blue-300 border-blue-500/30">{d}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                {skipTraceResults.market_opportunities && (
                  <Card className="p-5 bg-zinc-900 border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-3">Market Opportunities</h3>
                    <div className="space-y-2 text-sm text-white/70">
                      {skipTraceResults.market_opportunities.top_opportunities?.map((o, i) => <p key={i}>• {o}</p>)}
                      <p><span className="text-white/50">Local SEO:</span> {skipTraceResults.market_opportunities.local_seo_potential}</p>
                      {skipTraceResults.market_opportunities.content_gaps?.length > 0 && (
                        <div><span className="text-white/50">Content Gaps:</span>
                          {skipTraceResults.market_opportunities.content_gaps.map((g, i) => <p key={i} className="ml-2">• {g}</p>)}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                {skipTraceResults.recommended_next_steps?.length > 0 && (
                  <Card className="p-5 bg-green-500/5 border-green-500/30">
                    <h3 className="text-sm font-semibold text-white mb-3">Recommended Next Steps</h3>
                    <div className="space-y-1.5 text-sm text-white/70">
                      {skipTraceResults.recommended_next_steps.map((s, i) => <p key={i}>• {s}</p>)}
                    </div>
                  </Card>
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(4)} className="border-white/10 text-white/70 hover:bg-white/5">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={completeStep5} className="bg-blue-600 hover:bg-blue-500 text-white">
                    Continue to Blueprint <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Website Blueprint */}
        {currentStep === 6 && (
          <WebsiteBlueprint onComplete={completeStep6} onBack={() => setCurrentStep(5)} />
        )}

        {/* Step 7: Contents & Gap Analysis */}
        {currentStep === 7 && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                <BookOpen className="w-4 h-4" /> Step 7: Contents & Gap Analysis
              </div>
              <h2 className="text-xl font-bold text-white">System Contents & Gap Analysis</h2>
              <p className="text-sm text-white/50 mt-1">
                Your onboarding is complete. The system has compounded all your answers and generated a full catalog of every system, intelligence, and capability — plus a gap analysis identifying what's needed to achieve a fully autonomous programmatic SEO/AEO/GEO platform.
              </p>
            </div>

            <Card className="p-5 bg-zinc-900 border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Your Compounded Profile</h3>
                <p className="text-sm text-white">{onboardingData.full_name}</p>
                <p className="text-sm text-white/70">{onboardingData.phone} · {onboardingData.email}</p>
                <p className="text-sm text-white/70">{onboardingData.business_address}</p>
                <Badge variant="outline" className="mt-1 text-xs text-blue-300 border-blue-500/30">
                  {onboardingData.business_type === "new_business" ? "New Business" : onboardingData.business_type === "ai_enhanced" ? "AI-Enhanced" : "Rebrand"}
                </Badge>
              </div>
              {vision && <div><h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Vision</h3><p className="text-sm text-white/80 italic">"{vision}"</p></div>}
              {selectedTopic && <div><h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Selected Topic</h3><p className="text-sm text-white">{selectedTopic}</p></div>}
            </Card>

            <Card className="p-5 bg-blue-500/5 border-blue-500/30">
              <h3 className="text-sm font-semibold text-white mb-2">Full System Catalog & Gap Analysis</h3>
              <p className="text-sm text-white/70 mb-3">
                View the complete catalog of every entity, function, workflow, connector, and page in ApexForge — plus a detailed gap analysis identifying what's needed to scale to millions of strategically created websites with full SEO/AEO/GEO compliance.
              </p>
              <Link to="/contents">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                  <BookOpen className="w-4 h-4 mr-2" /> Open System Contents & Gap Analysis
                </Button>
              </Link>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(6)} className="border-white/10 text-white/70 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={finishPipeline} className="bg-green-600 hover:bg-green-500 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Pipeline
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
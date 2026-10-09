import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, AlertCircle, RotateCcw, Crown, Target, Brain, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, updateSession } from "@/lib/strategySession";

export default function GodModeSeo() {
  const [status, setStatus] = useState("idle");
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  // Auto-fill from strategy session
  useEffect(() => {
    const session = getSession();
    if (session.industry) setIndustry(session.industry);
    if (session.recommended_url) setUrl(session.recommended_url);
    if (session.industry_data?.location) setLocation(session.industry_data.location);
    if (session.godModeStrategy) setStrategy(session.godModeStrategy);
  }, []);

  const execute = async () => {
    setStatus("running");
    setError("");
    setStrategy(null);
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "crack_algorithm",
        industry,
        url,
        location,
      });
      const strat = res.data?.strategy || res.strategy;
      setStrategy(strat);
      // Save to session
      updateSession({ godModeStrategy: strat, godModeIndustry: industry });
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const continueToDigitalDominance = () => {
    updateSession({ godModeStrategy: strategy, godModeIndustry: industry });
    navigate("/digital-dominance");
  };

  const reset = () => {
    setStatus("idle");
    setStrategy(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            <Zap className="w-4 h-4" /> Step 2 — God Mode SEO Optimizer
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> God Mode SEO Optimizer
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Cracks Google's algorithm for your selected industry. The strategy auto-saves and feeds into Digital Dominance.
          </p>
        </div>

        {/* Session context indicator */}
        {industry && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-white/70">From Step 1: <span className="text-white font-bold">{industry}</span></p>
          </div>
        )}

        {/* Input */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-white/70 mb-2 block">Industry <span className="text-blue-400">(auto-filled)</span></Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Roofing" className="bg-white/5 border-white/10 text-white" disabled={status === "running"} />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g., roofingnearme.com" className="bg-white/5 border-white/10 text-white" disabled={status === "running"} />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Miami, FL" className="bg-white/5 border-white/10 text-white" disabled={status === "running"} />
            </div>
          </div>
          <Button onClick={execute} disabled={status === "running" || !industry.trim()} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base py-3">
            {status === "running" ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cracking Google Algorithm...</> : <><Zap className="w-5 h-5 mr-2" /> ACTIVATE GOD MODE</>}
          </Button>
        </Card>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div><p className="font-semibold text-red-400 text-sm">Execution Failed</p><p className="text-xs text-red-300 mt-1">{error}</p><button onClick={reset} className="mt-2 text-xs text-red-400 underline">Try again</button></div>
          </div>
        )}

        {status === "running" && (
          <Card className="p-8 bg-zinc-900 border-white/10 text-center">
            <Loader2 className="w-10 h-10 text-yellow-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-white/60">Running algorithm analysis...</p>
          </Card>
        )}

        {strategy && status === "done" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h2 className="text-sm font-bold text-white">Algorithm Cracked</h2>
              </div>
              <Button onClick={reset} variant="outline" size="sm" className="text-white/70 border-white/20"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
            </div>

            {strategy.fastest_path_to_page1 && (
              <Card className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Fastest Path to Page 1</p>
                <p className="text-sm text-white">{strategy.fastest_path_to_page1}</p>
                {strategy.estimated_timeline && <Badge className="mt-2 text-xs bg-green-500/20 text-green-300 border-green-500/30">{strategy.estimated_timeline}</Badge>}
              </Card>
            )}

            {strategy.ranking_factors?.length > 0 && (
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-blue-400" /> Top Ranking Factors & How to Crack Them</h3>
                <div className="space-y-2">
                  {strategy.ranking_factors.map((rf, i) => (
                    <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{rf.factor}</p>
                        <div className="flex gap-2">
                          <Badge className={`text-xs ${rf.impact === "critical" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}>{rf.impact}</Badge>
                          <Badge variant="outline" className="text-xs text-white/50 border-white/20">{rf.time_to_implement}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-white/60">{rf.how_to_crack}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {strategy.algorithm_shortcuts?.length > 0 && (
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Algorithm Shortcuts</h3>
                <div className="space-y-2">
                  {strategy.algorithm_shortcuts.map((s, i) => (
                    <div key={i} className="p-3 rounded-md bg-yellow-500/5 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{s.shortcut}</p>
                        <Badge className={`text-xs ${s.risk_level === "low" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}>Risk: {s.risk_level}</Badge>
                      </div>
                      <p className="text-xs text-white/60">{s.how_it_works}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategy.schema_types?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Schema.org</h3>
                  <div className="flex flex-wrap gap-1">{strategy.schema_types.map((s, i) => <Badge key={i} className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">{s}</Badge>)}</div>
                </Card>
              )}
              {strategy.eeat_signals?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">E-E-A-T Signals</h3>
                  <div className="space-y-1">{strategy.eeat_signals.slice(0, 5).map((s, i) => <p key={i} className="text-xs text-white/60">• {s.signal}: {s.how_to_build}</p>)}</div>
                </Card>
              )}
              {strategy.core_web_vitals?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Core Web Vitals</h3>
                  <div className="space-y-1">{strategy.core_web_vitals.map((cw, i) => <p key={i} className="text-xs text-white/60">• {cw.metric}: <span className="text-white">{cw.target}</span></p>)}</div>
                </Card>
              )}
            </div>

            {/* Continue button */}
            <Button onClick={continueToDigitalDominance} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              <Link2 className="w-4 h-4 mr-2" /> Continue to Step 3: Digital Dominance <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
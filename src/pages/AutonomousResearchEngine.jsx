import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Crown, TrendingUp, DollarSign, Bot, CheckCircle2, ArrowRight, Layers, Target, Sparkles } from "lucide-react";
import { updateSession } from "@/lib/strategySession";
import { Link } from "react-router-dom";

export default function AutonomousResearchEngine() {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const loadIndustries = async () => {
    setLoadingIndustries(true);
    setError("");
    try {
      const res = await base44.functions.invoke("autonomousResearchEngine", { action: "get_industries" });
      setIndustries(res.data?.industries || res.industries || []);
    } catch (e) {
      setError(e.message);
    }
    setLoadingIndustries(false);
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  const runFullResearch = async () => {
    if (!selectedIndustry) return;
    setLoading(true);
    setError("");
    setResults(null);
    setProgress("Launching parallel God Mode runs (3x) + digital dominance discovery...");
    try {
      const res = await base44.functions.invoke("autonomousResearchEngine", {
        action: "run_full_research",
        industry: selectedIndustry,
      });
      setResults(res.data || res);
      setProgress("");
      // Save to strategy session
      updateSession({ industry: selectedIndustry, autonomousResults: res.data || res });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Zap className="w-4 h-4" /> Autonomous Research Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Ultimate Strategy Generator</h1>
          <p className="text-sm text-white/50 mt-2 max-w-3xl mx-auto">
            Choose an industry. The system automatically runs ALL Phase 1 steps in parallel — 3 God Mode analyses, digital dominance discovery, top 30 name/URL generation — then produces 10 ultimate strategies with financial ROI, included components, steps, and super agents.
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>}

        {/* Industry Selection */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Step 1: Select an Industry
          </h2>
          {loadingIndustries ? (
            <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing top industries...</div>
          ) : industries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {industries.map((ind, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndustry(ind.name)}
                  className={`p-3 rounded-lg text-left transition-all ${selectedIndustry === ind.name ? "bg-blue-600/20 border border-blue-500/50" : "bg-white/5 border border-white/10 hover:border-white/20"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{ind.name}</p>
                    <Badge className={`text-xs ${ind.nearme_potential >= 80 ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}>NearMe: {ind.nearme_potential}</Badge>
                  </div>
                  <p className="text-xs text-white/50">{ind.reasoning}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-white/40">CPC: ${ind.avg_cpc}</span>
                    <span className="text-white/40">Lead: ${ind.lead_value}</span>
                    <span className="text-white/40">Diff: {ind.seo_difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Button onClick={loadIndustries} variant="outline" className="text-white/70 border-white/20">Load Industries</Button>
          )}
        </Card>

        {/* Run Button */}
        {selectedIndustry && (
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-zinc-900 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">Step 2: Launch Autonomous Research</h2>
                <p className="text-xs text-white/50">Industry: <span className="text-white font-bold">{selectedIndustry}</span> — The system will run 3 parallel God Mode analyses, discover all dominance targets, generate top 30 names/URLs, and produce 10 ultimate strategies.</p>
              </div>
              <Button onClick={runFullResearch} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-3">
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running...</> : <><Zap className="w-5 h-5 mr-2" /> LAUNCH</>}
              </Button>
            </div>
            {progress && <p className="text-xs text-blue-400 mt-3 animate-pulse">{progress}</p>}
          </Card>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Summary */}
            <Card className="p-6 bg-zinc-900 border-green-500/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h2 className="text-sm font-bold text-white">Research Complete — {results.parallel_runs} Parallel God Mode Runs</h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-white">{results.top30?.length || 0}</p><p className="text-xs text-white/50">Top Names/URLs</p></div>
                <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-white">{results.dominance?.targets?.length || 0}</p><p className="text-xs text-white/50">Dominance Targets</p></div>
                <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-white">{results.bestStrategy?.all_ranking_factors?.length || 0}</p><p className="text-xs text-white/50">Ranking Factors</p></div>
                <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-white">{results.strategies?.length || 0}</p><p className="text-xs text-white/50">Ultimate Strategies</p></div>
              </div>
            </Card>

            {/* 10 Ultimate Strategies */}
            <div>
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" /> 10 Ultimate Strategies with Financial ROI
              </h2>
              <div className="space-y-3">
                {(results.strategies || []).map((strat, i) => (
                  <Card key={i} className={`p-5 ${strat.strategy_rank <= 3 ? "bg-green-500/5 border-green-500/20" : strat.strategy_rank <= 6 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-white/40">#{strat.strategy_rank}</span>
                          <h3 className="text-base font-bold text-white">{strat.strategy_name}</h3>
                          {strat.strategy_rank === 1 && <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">BEST</Badge>}
                        </div>
                        <p className="text-xs text-white/50">{strat.full_strategy?.slice(0, 200)}...</p>
                      </div>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-right shrink-0">
                        <div><p className="text-xs text-white/40">Revenue/mo</p><p className="text-sm font-bold text-green-400">${strat.monthly_revenue?.toLocaleString()}</p></div>
                        <div><p className="text-xs text-white/40">Cost/mo</p><p className="text-sm font-bold text-red-400">${strat.monthly_cost?.toLocaleString()}</p></div>
                        <div><p className="text-xs text-white/40">Net Profit</p><p className="text-sm font-bold text-white">${strat.net_profit?.toLocaleString()}</p></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">ROI Estimate</p>
                        <p className="text-sm text-white">{strat.roi_estimate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Time to Profit</p>
                        <p className="text-sm text-white">{strat.time_to_profitability}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Website Count</p>
                        <p className="text-sm text-white">{strat.website_count?.toLocaleString()} sites</p>
                      </div>
                    </div>

                    {strat.what_included?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">What's Included</p>
                        <div className="flex flex-wrap gap-1.5">
                          {strat.what_included.map((item, j) => (
                            <Badge key={j} className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {strat.steps?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Steps</p>
                        <div className="space-y-0.5">
                          {strat.steps.slice(0, 5).map((step, j) => (
                            <p key={j} className="text-xs text-white/60"><span className="text-white/40 font-mono mr-1">{j + 1}.</span> {step}</p>
                          ))}
                          {strat.steps.length > 5 && <p className="text-xs text-white/40">+ {strat.steps.length - 5} more steps...</p>}
                        </div>
                      </div>
                    )}

                    {strat.agents?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> Super Agents</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {strat.agents.slice(0, 6).map((agent, j) => (
                            <div key={j} className="p-1.5 rounded bg-white/5 border border-white/10">
                              <p className="text-xs font-medium text-white">{agent.name}</p>
                              <p className="text-xs text-white/50">{agent.role}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Top 30 Names/URLs */}
            {results.top30?.length > 0 && (
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /> Top 30 Names & URLs</h3>
                <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
                  {results.top30.map((t, i) => (
                    <div key={i} className={`p-2 rounded-md ${i < 5 ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-white/5 border border-white/10"}`}>
                      <p className="text-xs font-bold text-white">{t.business_name}</p>
                      <p className="text-xs font-mono text-blue-300">{t.url}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-white/40">SEO: {t.seo_score}</span>
                        <span className="text-xs text-green-400">NearMe: {t.nearme_benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Continue */}
            <div className="flex gap-3">
              <Link to="/social-automation" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                  <Layers className="w-4 h-4 mr-2" /> Continue to Social Media Automation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/ab-testing" className="flex-1">
                <Button variant="outline" className="w-full text-white/70 border-white/20">
                  <TrendingUp className="w-4 h-4 mr-2" /> A/B Testing System
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, AlertCircle, RotateCcw, Crown, Search, Database, Brain, TrendingUp, Rocket, CheckCircle2, Link2, ArrowRight, Globe, DollarSign, Target, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, updateSession } from "@/lib/strategySession";
import StrategyCard from "@/components/godmode/StrategyCard";

const STAGES = [
  { id: "research", label: "Market Research (Web Search)", icon: Search },
  { id: "benchmarks", label: "Loading Benchmarks & Agents", icon: Database },
  { id: "simulation", label: "Running Monte Carlo Simulation (1000 iterations)", icon: Brain },
  { id: "strategies", label: "Generating Strategies", icon: TrendingUp },
  { id: "winner", label: "Selecting Winner", icon: Crown },
];

export default function GodModeSeo() {
  const [status, setStatus] = useState("idle");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);
  const [pastRuns, setPastRuns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session.industry) setIndustry(session.industry);
    if (session.industry_data?.location) setLocation(session.industry_data.location);
    loadPastRuns();
  }, []);

  const loadPastRuns = async () => {
    try {
      const res = await base44.functions.invoke("godModeSeo", { action: "get_runs" });
      setPastRuns(res.data?.runs || []);
    } catch {}
  };

  const execute = async () => {
    setStatus("running");
    setStage(0);
    setError("");
    setResult(null);
    setProvisionResult(null);

    try {
      // Animate stages while the backend runs
      const stageTimer = setInterval(() => {
        setStage(s => Math.min(s + 1, STAGES.length - 1));
      }, 3000);

      const res = await base44.functions.invoke("godModeSeo", {
        action: "god_mode_full",
        industry,
        location,
      });
      clearInterval(stageTimer);
      setStage(STAGES.length);

      const data = res.data;
      setResult(data);
      updateSession({ godModeRunId: data.run_id, godModeIndustry: industry });
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const provisionWinner = async (strategyName) => {
    setProvisioning(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "provision_winner",
        run_id: result.run_id,
        strategy_name: strategyName,
      });
      setProvisionResult(res.data);
      updateSession({ godModeProvisioned: true, godModeWebsiteId: res.data.website_id, godModeCampaignId: res.data.campaign_id });
      loadPastRuns();
    } catch (e) {
      setError(e.message);
    } finally {
      setProvisioning(false);
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
    setProvisionResult(null);
    setStage(0);
  };

  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n?.toLocaleString() || 0}`;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            <Zap className="w-4 h-4" /> God Mode — Real Data, Real Simulation, Real Provisioning
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> God Mode
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Researches real market data, runs a Monte Carlo simulation with actual unit economics,
            generates concrete strategies, and provisions the winning website.
          </p>
        </div>

        {/* Input */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-white/70 mb-2 block">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Roofing, Plumbing, HVAC" className="bg-white/5 border-white/10 text-white" disabled={status === "running"} />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Location Scope (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., United States, Florida" className="bg-white/5 border-white/10 text-white" disabled={status === "running"} />
            </div>
          </div>
          <Button onClick={execute} disabled={status === "running" || !industry.trim()} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base py-3">
            {status === "running" ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running God Mode...</> : <><Zap className="w-5 h-5 mr-2" /> ACTIVATE GOD MODE</>}
          </Button>
        </Card>

        {/* Progress stages */}
        {status === "running" && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <div className="space-y-3">
              {STAGES.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-3 transition-all ${i <= stage ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i < stage ? "bg-green-500/20 text-green-400" : i === stage ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-600"}`}>
                    {i < stage ? <CheckCircle2 className="w-4 h-4" /> : i === stage ? <Loader2 className="w-4 h-4 animate-spin" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm ${i <= stage ? "text-white" : "text-gray-600"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400 text-sm">Execution Failed</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
              <button onClick={reset} className="mt-2 text-xs text-red-400 underline">Try again</button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && status === "done" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h2 className="text-sm font-bold text-white">God Mode Complete — Real Data, Real Projections</h2>
              </div>
              <Button onClick={reset} variant="outline" size="sm" className="text-white/70 border-white/20 bg-transparent"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
            </div>

            {/* Market Research Data */}
            {result.market_data && (
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-blue-400" /> Real Market Research (via Web Search)</h3>
                <p className="text-xs text-white/60 mb-4">{result.market_data.niche_description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1"><Globe className="w-3 h-3 text-blue-400" /><span className="text-[10px] text-gray-500 uppercase">Monthly Searches</span></div>
                    <p className="text-lg font-bold text-white">{(result.market_data.monthly_search_volume || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1"><DollarSign className="w-3 h-3 text-green-400" /><span className="text-[10px] text-gray-500 uppercase">Avg CPC</span></div>
                    <p className="text-lg font-bold text-white">${result.market_data.avg_cpc || 0}</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1"><Target className="w-3 h-3 text-yellow-400" /><span className="text-[10px] text-gray-500 uppercase">Lead Value</span></div>
                    <p className="text-lg font-bold text-white">${result.market_data.lead_value || 0}</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 mb-1"><Users className="w-3 h-3 text-purple-400" /><span className="text-[10px] text-gray-500 uppercase">Cities Available</span></div>
                    <p className="text-lg font-bold text-white">{result.market_data.cities_available || 0}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="text-xs bg-white/5 text-gray-300 border-white/10">Competition: {result.market_data.competition_level}</Badge>
                  {result.market_data.top_competitors?.map((c, i) => (
                    <Badge key={i} className="text-xs bg-red-500/10 text-red-300 border-red-500/20">{c}</Badge>
                  ))}
                </div>
                {result.market_data.keyword_examples?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-2">Real Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {result.market_data.keyword_examples.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-white/60 border-white/10">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Benchmarks & Agents */}
            <div className="grid grid-cols-2 gap-4">
              {result.benchmarks?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Database className="w-3 h-3 text-purple-400" /> Benchmarks Loaded</h3>
                  <div className="space-y-1">
                    {result.benchmarks.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{b.system_name}</span>
                        <Badge className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/20">{b.rating_score}/100</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {result.agents?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Brain className="w-3 h-3 text-cyan-400" /> Agents Available</h3>
                  <div className="space-y-1">
                    {result.agents.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{a.name}</span>
                        <Badge className={`text-[10px] ${a.status === "running" ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-white/5 text-gray-400 border-white/10"}`}>{a.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Strategy Cards */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Strategies — Real Monte Carlo Projections (1000 iterations each)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.strategies?.map((strategy) => (
                  <StrategyCard
                    key={strategy.name}
                    strategy={strategy}
                    isWinner={strategy.name === result.winner?.name}
                    onProvision={() => provisionWinner(strategy.name)}
                    provisioning={provisioning}
                  />
                ))}
              </div>
            </div>

            {/* Provisioning Result */}
            {provisionResult && (
              <Card className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-bold text-white">Website Provisioned Successfully</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-2 rounded-md bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Pages Queued</p>
                    <p className="text-lg font-bold text-white">{provisionResult.pages_queued}</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Cities</p>
                    <p className="text-lg font-bold text-white">{provisionResult.cities}</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Services</p>
                    <p className="text-lg font-bold text-white">{provisionResult.services}</p>
                  </div>
                  <div className="p-2 rounded-md bg-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">URL Pattern</p>
                    <p className="text-sm font-bold text-white truncate">{provisionResult.url_pattern}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/websites")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm">
                    <Globe className="w-4 h-4 mr-2" /> View Website
                  </Button>
                  <Button onClick={() => navigate("/launch")} variant="outline" className="text-white border-white/20 bg-transparent text-sm">
                    <Rocket className="w-4 h-4 mr-2" /> View Campaign
                  </Button>
                </div>
              </Card>
            )}

            {/* Continue to Digital Dominance */}
            {!provisionResult && (
              <Button onClick={() => { updateSession({ godModeStrategy: result.winner, godModeIndustry: industry }); navigate("/digital-dominance"); }} variant="outline" className="w-full text-white/70 border-white/20 bg-transparent">
                <Link2 className="w-4 h-4 mr-2" /> Continue to Digital Dominance <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </>
        )}

        {/* Past Runs */}
        {pastRuns.length > 0 && status === "idle" && (
          <Card className="p-5 bg-zinc-900 border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Past God Mode Runs</h3>
            <div className="space-y-2">
              {pastRuns.map((run) => {
                const winner = typeof run.winner === "string" ? JSON.parse(run.winner) : run.winner;
                return (
                  <div key={run.id} className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${run.status === "provisioned" ? "bg-green-500/10 text-green-300 border-green-500/20" : run.status === "complete" ? "bg-blue-500/10 text-blue-300 border-blue-500/20" : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"}`}>{run.status}</Badge>
                      <span className="text-sm text-white">{run.industry}</span>
                      {winner && <span className="text-xs text-gray-500">Winner: {winner.name} ({winner.page_count} pages)</span>}
                    </div>
                    {run.status === "provisioned" && run.website_id && (
                      <Button onClick={() => navigate("/websites")} variant="ghost" size="sm" className="text-blue-400 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" /> View
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, AlertCircle, RotateCcw, Crown, Search, Database, Brain, TrendingUp, Rocket, CheckCircle2, Link2, ArrowRight, Globe, DollarSign, Target, Users, ExternalLink, Cpu, Sparkles, Wifi, Activity, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, updateSession } from "@/lib/strategySession";
import StrategyCard from "@/components/godmode/StrategyCard";
import GptSyncPanel from "@/components/godmode/GptSyncPanel";

export default function GodModeSeo() {
  const [stage, setStage] = useState(0); // 0=idle, 1=research, 2=simulate, 3=decide, 4=gpt, 5=provision
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");

  // Stage data
  const [researchData, setResearchData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [simData, setSimData] = useState(null);
  const [gptData, setGptData] = useState(null);
  const [provisionResult, setProvisionResult] = useState(null);
  const [provisioning, setProvisioning] = useState(false);
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

  // ── Stage 1: Real Web Search ──
  const runResearch = async () => {
    setLoading(true);
    setError("");
    setStage(1);
    setResearchData(null);
    setSimData(null);
    setGptData(null);
    setProvisionResult(null);

    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "god_mode_research",
        industry,
        location,
      });
      setSearchQuery(res.data.search_query);
      setResearchData({ ...res.data.market_data, sources: res.data.sources });
      if (res.data.market_data?.data_quality !== 'source_checked') {
        setStage(1);
        setLoading(false);
        setError('Financial forecasts are withheld because scope-matched, source-checked metrics are missing. Use the Connected Pipeline for design-only planning.');
        return;
      }
      setStage(2);
      runSimulation(res.data.market_data);
    } catch (e) {
      setError(e.message);
      setStage(0);
      setLoading(false);
    }
  };

  // ── Stage 2: Load system data + run Monte Carlo ──
  const runSimulation = async (marketData) => {
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "god_mode_simulate",
        market_data: marketData,
        industry,
        location,
      });
      setSimData(res.data);
      updateSession({ godModeRunId: res.data.run_id, godModeIndustry: industry });
      setStage(3);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setStage(0);
      setLoading(false);
    }
  };

  // ── Stage 3: Sync with GPT ──
  const syncGpt = async () => {
    setLoading(true);
    setError("");
    setStage(4);
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "god_mode_sync_gpt",
        run_id: simData.run_id,
        strategy_name: simData.winner.name,
      });
      setGptData(res.data);
      setStage(5);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setStage(3);
      setLoading(false);
    }
  };

  // ── Stage 4: Provision website ──
  const provisionWinner = async () => {
    setProvisioning(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "provision_winner",
        run_id: simData.run_id,
        strategy_name: simData.winner.name,
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
    setStage(0);
    setResearchData(null);
    setSimData(null);
    setGptData(null);
    setProvisionResult(null);
    setError("");
    setSearchQuery("");
  };

  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n?.toLocaleString() || 0}`;

  const STAGES = [
    { id: 1, label: "Web Search", icon: Search, desc: "Real Google search via Perplexity Sonar" },
    { id: 2, label: "Monte Carlo", icon: Activity, desc: "3,000 iterations across 3 strategies" },
    { id: 3, label: "Decision", icon: Crown, desc: "Winner selected by risk-adjusted ROI" },
    { id: 4, label: "GPT Sync", icon: Brain, desc: "GPT structures the website" },
    { id: 5, label: "Provision", icon: Rocket, desc: "Website + campaign + pages launched" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            <Zap className="w-4 h-4" /> Source-backed research · Seeded scenarios · Approval-gated drafts
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> God Mode
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Searches the live web, keeps missing metrics unknown, and runs repeatable numerical scenarios only with source-checked inputs.
            Predictions are not Google's algorithm or guaranteed rankings; use the Connected Pipeline to approve designs and build drafts.
          </p>
        </div>

        {/* Pipeline indicator */}
        {stage > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {STAGES.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex flex-col items-center gap-1 transition-all ${stage >= s.id ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${stage > s.id ? "bg-green-500/20 text-green-400" : stage === s.id ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-600"}`}>
                    {stage > s.id ? <CheckCircle2 className="w-4 h-4" /> : stage === s.id && loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] ${stage >= s.id ? "text-white" : "text-gray-600"}`}>{s.label}</span>
                </div>
                {i < STAGES.length - 1 && <div className={`w-8 h-0.5 ${stage > s.id ? "bg-green-500/40" : "bg-white/10"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Input */}
        {stage === 0 && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-white/70 mb-2 block">Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Roofing, Plumbing, HVAC" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-white/70 mb-2 block">Location Scope (optional)</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., United States, Florida" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <Button onClick={runResearch} disabled={!industry.trim()} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base py-3">
              <Zap className="w-5 h-5 mr-2" /> ACTIVATE GOD MODE
            </Button>
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

        {/* ── Stage 1: Real Web Search Results ── */}
        {researchData && stage >= 1 && (
          <Card className="p-5 bg-zinc-900 border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Stage 1 — Public Market Research</h3>
              <Badge className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20 ml-auto">Perplexity Sonar</Badge>
            </div>
            {/* Search query */}
            <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/20 mb-3">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Search Query Sent to Web</p>
              <p className="text-xs text-blue-300 font-mono">"{searchQuery}"</p>
            </div>
            <p className="text-xs text-white/60 mb-3">{researchData.niche_description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1"><Globe className="w-3 h-3 text-blue-400" /><span className="text-[10px] text-gray-500 uppercase">Monthly Searches</span></div>
                <p className="text-lg font-bold text-white">{researchData.monthly_search_volume == null ? 'Not verified' : researchData.monthly_search_volume.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1"><DollarSign className="w-3 h-3 text-green-400" /><span className="text-[10px] text-gray-500 uppercase">Avg CPC</span></div>
                <p className="text-lg font-bold text-white">{researchData.avg_cpc == null ? 'Not verified' : `$${researchData.avg_cpc}`}</p>
              </div>
              <div className="p-3 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1"><Target className="w-3 h-3 text-yellow-400" /><span className="text-[10px] text-gray-500 uppercase">Revenue / Customer</span></div>
                <p className="text-lg font-bold text-white">{researchData.lead_value == null ? 'Not verified' : `$${researchData.lead_value}`}</p>
              </div>
              <div className="p-3 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1"><Users className="w-3 h-3 text-purple-400" /><span className="text-[10px] text-gray-500 uppercase">Cities Available</span></div>
                <p className="text-lg font-bold text-white">{researchData.cities_available || 0}</p>
              </div>
            </div>
            {/* Real keywords */}
            {researchData.keyword_examples?.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Research keyword proposals (not verified keyword volumes)</p>
                <div className="flex flex-wrap gap-1">
                  {researchData.keyword_examples.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-blue-300 border-blue-500/20 bg-blue-500/5">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
            {/* Competitors */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="text-xs bg-white/5 text-gray-300 border-white/10">Competition: {researchData.competition_level}</Badge>
              {researchData.top_competitors?.map((c, i) => (
                <Badge key={i} className="text-xs bg-red-500/10 text-red-300 border-red-500/20">{c}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* ── Stage 2: Simulation loading indicator ── */}
        {stage === 2 && loading && (
          <Card className="p-5 bg-zinc-900 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Stage 2 — Running Monte Carlo Simulation</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Conservative", "Moderate", "Aggressive"].map((name, i) => (
                <div key={name} className="p-3 rounded-md bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{name}</span>
                    <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40"><span>Iterations</span><span className="text-white/70">1,000</span></div>
                    <div className="flex justify-between text-[10px] text-white/40"><span>Pages</span><span className="text-white/70">{[50, 200, 500][i]}</span></div>
                    <div className="flex justify-between text-[10px] text-white/40"><span>Cities</span><span className="text-white/70">{[10, 40, 100][i]}</span></div>
                  </div>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500/50 animate-pulse" style={{ width: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-3 text-center">3,000 total iterations · Real unit economics · Gaussian distributions · P10/P50/P90 percentiles</p>
          </Card>
        )}

        {/* ── Stage 2 Results: Benchmarks + Agents + Strategies ── */}
        {simData && stage >= 2 && (
          <>
            {/* Benchmarks & Agents */}
            <div className="grid grid-cols-2 gap-4">
              {simData.benchmarks?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Database className="w-3 h-3 text-purple-400" /> System Benchmarks Loaded</h3>
                  <div className="space-y-1">
                    {simData.benchmarks.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{b.system_name}</span>
                        <Badge className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/20">{b.rating_score}/100</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {simData.agents?.length > 0 && (
                <Card className="p-4 bg-zinc-900 border-white/10">
                  <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Cpu className="w-3 h-3 text-cyan-400" /> Agents Connected</h3>
                  <div className="space-y-1">
                    {simData.agents.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{a.name}</span>
                        <Badge className={`text-[10px] ${a.status === "running" ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-white/5 text-gray-400 border-white/10"}`}>{a.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Simulation assumptions */}
            {simData.strategies?.[0]?.assumptions && (
              <Card className="p-4 bg-zinc-900 border-white/10">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2"><Activity className="w-3 h-3 text-yellow-400" /> Scenario assumptions (not measured ranking or conversion rates)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div><p className="text-[10px] text-gray-500 uppercase">Time to Rank</p><p className="text-sm font-bold text-white">{simData.strategies[0].assumptions.base_time_to_rank} mo</p></div>
                  <div><p className="text-[10px] text-gray-500 uppercase">CTR</p><p className="text-sm font-bold text-white">{(simData.strategies[0].assumptions.base_ctr * 100).toFixed(1)}%</p></div>
                  <div><p className="text-[10px] text-gray-500 uppercase">Conv. Rate</p><p className="text-sm font-bold text-white">{(simData.strategies[0].assumptions.base_conversion_rate * 100).toFixed(1)}%</p></div>
                  <div><p className="text-[10px] text-gray-500 uppercase">Close Rate</p><p className="text-sm font-bold text-white">{(simData.strategies[0].assumptions.base_close_rate * 100).toFixed(0)}%</p></div>
                  <div><p className="text-[10px] text-gray-500 uppercase">Search/Page</p><p className="text-sm font-bold text-white">{simData.strategies[0].assumptions.search_volume_per_page?.toLocaleString()}</p></div>
                  <div><p className="text-[10px] text-gray-500 uppercase">Monthly Cost</p><p className="text-sm font-bold text-white">${simData.strategies[0].assumptions.monthly_recurring_cost}</p></div>
                </div>
              </Card>
            )}

            {/* Strategy Cards */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Stage 2 Results — {simData.total_iterations?.toLocaleString()} Monte Carlo Iterations Complete
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {simData.strategies?.map((strategy) => (
                  <StrategyCard
                    key={strategy.name}
                    strategy={strategy}
                    isWinner={strategy.name === simData.winner?.name}
                  />
                ))}
              </div>
            </div>

            {/* Winner banner */}
            {simData.winner && stage >= 3 && (
              <Card className="p-5 bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-400 uppercase font-bold">Stage 3 — Winner Selected</p>
                    <p className="text-lg font-bold text-white">{simData.winner.name} Strategy</p>
                    <p className="text-xs text-white/60">
                      {simData.winner.page_count} pages · {simData.winner.cities} cities · ROI: {simData.winner.roi_p50}x ·
                      P50 profit: ${(simData.winner.p50?.profit_12mo || 0).toLocaleString()}/yr ·
                      Break-even: month {simData.winner.p50?.break_even_month || 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Stage 4: GPT Sync ── */}
            {stage >= 3 && !gptData && (
              <Button onClick={syncGpt} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base py-3">
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> GPT is structuring the website...</> : <><Brain className="w-5 h-5 mr-2" /> SYNC WITH GPT — STRUCTURE THE WEBSITE</>}
              </Button>
            )}

            {loading && stage === 4 && (
              <Card className="p-5 bg-zinc-900 border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-white">Stage 4 — GPT Syncing</p>
                    <p className="text-xs text-white/50">Sending market research + winning strategy to GPT (Claude Sonnet 5) to structure the website...</p>
                  </div>
                </div>
              </Card>
            )}

            {/* GPT Structure */}
            {gptData && (
              <GptSyncPanel structure={gptData.website_structure} winner={gptData.winner} marketData={gptData.market_data} />
            )}

            {/* ── Stage 5: Provision ── */}
            {gptData && !provisionResult && (
              <Button onClick={provisionWinner} disabled={provisioning} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-base py-3">
                {provisioning ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Provisioning website + campaign + pages...</> : <><Rocket className="w-5 h-5 mr-2" /> PROVISION WEBSITE — LAUNCH CAMPAIGN</>}
              </Button>
            )}

            {/* Provisioning Result */}
            {provisionResult && (
              <Card className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-bold text-white">Stage 5 — Website Provisioned</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-2 rounded-md bg-white/5"><p className="text-[10px] text-gray-500 uppercase">Pages Queued</p><p className="text-lg font-bold text-white">{provisionResult.pages_queued}</p></div>
                  <div className="p-2 rounded-md bg-white/5"><p className="text-[10px] text-gray-500 uppercase">Cities</p><p className="text-lg font-bold text-white">{provisionResult.cities}</p></div>
                  <div className="p-2 rounded-md bg-white/5"><p className="text-[10px] text-gray-500 uppercase">Services</p><p className="text-lg font-bold text-white">{provisionResult.services}</p></div>
                  <div className="p-2 rounded-md bg-white/5"><p className="text-[10px] text-gray-500 uppercase">URL Pattern</p><p className="text-sm font-bold text-white truncate">{provisionResult.url_pattern}</p></div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/websites")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm"><Globe className="w-4 h-4 mr-2" /> View Website</Button>
                  <Button onClick={() => navigate("/launch")} variant="outline" className="text-white border-white/20 bg-transparent text-sm"><Rocket className="w-4 h-4 mr-2" /> View Campaign</Button>
                  <Button onClick={reset} variant="ghost" className="text-white/50 text-sm ml-auto"><RotateCcw className="w-4 h-4 mr-1" /> New Run</Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Past Runs */}
        {pastRuns.length > 0 && stage === 0 && (
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
                      <Button onClick={() => navigate("/websites")} variant="ghost" size="sm" className="text-blue-400 text-xs"><ExternalLink className="w-3 h-3 mr-1" /> View</Button>
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
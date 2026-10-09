import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, Search, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Package, Trophy, Layers, Wrench, ClipboardList, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

const EFFORT_COLORS = {
  small: "bg-green-500/10 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  large: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function BuildInitiation() {
  const [industry, setIndustry] = useState("");
  const [marketContext, setMarketContext] = useState("");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const loadPlans = async () => {
    try {
      const res = await base44.functions.invoke("buildInitiation", { action: "get_plans" });
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const runInitiation = async () => {
    if (!industry.trim()) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setPhase("Scanning internal systems...");
    try {
      const res = await base44.functions.invoke("buildInitiation", {
        action: "initiate",
        industry: industry.trim(),
        market_context: marketContext.trim(),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message || "Initiation failed");
    }
    setRunning(false);
    setPhase("");
    loadPlans();
  };

  const loadPlanDetail = async (id) => {
    if (expandedPlan === id) { setExpandedPlan(null); return; }
    try {
      const res = await base44.functions.invoke("buildInitiation", { action: "get_plan", id });
      setExpandedPlan(id);
      setResult({
        plan_id: id,
        industry: res.data.plan.industry,
        scan: (() => { try { return JSON.parse(res.data.plan.scan_summary || '{}'); } catch { return {}; } })(),
        reusable_assets: (() => { try { return JSON.parse(res.data.plan.reusable_assets || '[]'); } catch { return []; } })(),
        gaps: (() => { try { return JSON.parse(res.data.plan.gaps || '[]'); } catch { return []; } })(),
        build_plan: (() => { try { return JSON.parse(res.data.plan.build_plan || '[]'); } catch { return []; } })(),
        coverage_percentage: res.data.plan.coverage_percentage || 0,
        benchmarks: (() => { try { return JSON.parse(res.data.plan.benchmark_ids || '[]').map(id => ({ id })); } catch { return []; } })(),
        total_internal_systems: res.data.plan.total_internal_systems,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-7 h-7 text-blue-500" />
            Universal Build Initiation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Scans all internal systems, benchmarks top competitors, maps reusable assets, and identifies gaps — the first step of every new build.
          </p>
        </div>

        {/* Input */}
        <Card className="bg-[#111] border-white/10 mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Industry / Market</label>
                <Input
                  placeholder="e.g. HVAC contractor software, dental practice management, real estate CRM..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={running}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && !running && runInitiation()}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Market Context (optional)</label>
                <Input
                  placeholder="e.g. US market, enterprise focus, mobile-first..."
                  value={marketContext}
                  onChange={(e) => setMarketContext(e.target.value)}
                  disabled={running}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={runInitiation} disabled={running || !industry.trim()} className="bg-blue-600 hover:bg-blue-700 h-9">
                  {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {running ? "Running..." : "Start Build Initiation"}
                </Button>
              </div>
            </div>
            {running && phase && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {phase}
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Coverage Summary */}
            <Card className="bg-[#111] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Initiation Complete: {result.industry}
                  </h2>
                  <Badge className="bg-blue-600 text-white">{result.coverage_percentage || 0}% coverage</Badge>
                </div>
                {result.summary && <p className="text-sm text-gray-400 mb-4">{result.summary}</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <p className="text-2xl font-bold text-white">{result.scan?.total_systems || result.total_internal_systems || 0}</p>
                    <p className="text-xs text-gray-500">Internal Systems Scanned</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <p className="text-2xl font-bold text-white">{result.benchmarks?.length || 0}</p>
                    <p className="text-xs text-gray-500">Competitors Benchmarked</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <p className="text-2xl font-bold text-green-400">{result.reusable_assets?.length || 0}</p>
                    <p className="text-xs text-gray-500">Reusable Assets Found</p>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                    <p className="text-2xl font-bold text-red-400">{result.gaps?.length || 0}</p>
                    <p className="text-xs text-gray-500">Gaps Identified</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What I Have — Internal Scan */}
            {result.scan?.categories && (
              <Card className="bg-[#111] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    What I Have — Internal Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.scan.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <div key={cat} className="bg-[#0a0a0a] rounded-md px-3 py-1.5 border border-white/5 flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{count}</span>
                        <span className="text-xs text-gray-500 capitalize">{cat.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitor Benchmarks */}
            {result.benchmarks?.length > 0 && (
              <Card className="bg-[#111] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Top 3 Competitor Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.benchmarks.map((b) => (
                      <div key={b.id || b.ranking} className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">{b.ranking}</span>
                            <h3 className="font-semibold text-white">{b.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">{b.rating_score}/100</Badge>
                            {b.reusable_asset_count !== undefined && (
                              <Badge variant="outline" className="text-green-400 border-green-500/30">{b.reusable_asset_count} reusable</Badge>
                            )}
                          </div>
                        </div>
                        {b.key_features && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {b.key_features.map((f, i) => (
                              <span key={i} className="text-xs text-gray-400 bg-white/5 rounded px-2 py-0.5">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reusable Assets */}
            {result.reusable_assets?.length > 0 && (
              <Card className="bg-[#111] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-500" />
                    What I Can Reuse — {result.reusable_assets.length} Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {result.reusable_assets.map((a) => (
                      <div key={a.registry_key} className="bg-[#0a0a0a] rounded-md p-3 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium truncate">{a.system_name}</span>
                          <Badge variant="outline" className={cn("text-[10px]", a.reuse_potential === 'high' ? "text-green-400 border-green-500/30" : "text-yellow-400 border-yellow-500/30")}>
                            {a.reuse_potential}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{a.category?.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gap Analysis */}
            {result.gaps?.length > 0 && (
              <Card className="bg-[#111] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    What I Need — {result.gaps.length} Gaps to Fill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.gaps.map((g, i) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-md p-3 border border-white/5 flex items-start gap-3">
                        <div className="flex flex-col gap-1 shrink-0">
                          <Badge variant="outline" className={cn("text-[10px]", PRIORITY_COLORS[g.priority] || "")}>{g.priority}</Badge>
                          {g.build_effort && <Badge variant="outline" className={cn("text-[10px]", EFFORT_COLORS[g.build_effort] || "")}>{g.build_effort}</Badge>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{g.feature}</p>
                          {g.description && <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Build Plan */}
            {result.build_plan?.length > 0 && (
              <Card className="bg-[#111] border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                    Phased Build Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.build_plan.map((phase, i) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-white">{phase.phase}</h3>
                          <div className="flex items-center gap-2">
                            {phase.priority && <Badge variant="outline" className={cn("text-[10px]", PRIORITY_COLORS[phase.priority] || "")}>{phase.priority}</Badge>}
                            {phase.timeline && <span className="text-xs text-gray-500">{phase.timeline}</span>}
                          </div>
                        </div>
                        {phase.items && (
                          <ul className="space-y-1">
                            {phase.items.map((item, j) => (
                              <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-gray-600" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Previous Plans */}
        {!result && plans.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Previous Build Plans</h2>
            <div className="space-y-2">
              {plans.map((p) => (
                <div key={p.id}>
                  <button
                    onClick={() => loadPlanDetail(p.id)}
                    className="w-full flex items-center gap-3 bg-[#111] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all text-left"
                  >
                    {expandedPlan === p.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{p.industry}</p>
                      <p className="text-xs text-gray-500">{new Date(p.created_date).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-500/30">{p.coverage_percentage || 0}% coverage</Badge>
                    <Badge variant="outline" className="text-gray-400 border-white/10">{p.total_internal_systems || 0} systems</Badge>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && plans.length === 0 && !running && (
          <div className="text-center py-20 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter an industry above to scan your systems and benchmark against the top 3 competitors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
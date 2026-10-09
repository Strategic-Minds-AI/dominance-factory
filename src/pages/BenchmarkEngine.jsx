import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Search, RefreshCw, Globe, Cpu, Map, CheckCircle, AlertCircle, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BenchmarkEngine() {
  const [industry, setIndustry] = useState("");
  const [marketContext, setMarketContext] = useState("");
  const [benchmarking, setBenchmarking] = useState(false);
  const [result, setResult] = useState(null);
  const [blueprints, setBlueprints] = useState([]);
  const [error, setError] = useState(null);
  const [expandedBlueprint, setExpandedBlueprint] = useState(null);

  const runBenchmark = async () => {
    if (!industry.trim()) return;
    setBenchmarking(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("benchmarkEngine", {
        action: "benchmark",
        industry: industry.trim(),
        market_context: marketContext.trim(),
      });
      setResult(res.data);
      await loadBlueprints();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Benchmark failed. Integration credits may be exhausted.");
    }
    setBenchmarking(false);
  };

  const loadBlueprints = async () => {
    try {
      const res = await base44.functions.invoke("benchmarkEngine", { action: "get_blueprints" });
      setBlueprints(res.data.blueprints || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBlueprints();
  }, []);

  const parseBlueprint = (bp) => {
    try { return JSON.parse(bp.reverse_engineering_blueprint || "{}"); } catch { return {}; }
  };

  const parseRoadmap = (bp) => {
    try { return JSON.parse(bp.replication_roadmap || "[]"); } catch { return []; }
  };

  const parseFeatures = (bp) => {
    try { return JSON.parse(bp.key_features || "[]"); } catch { return []; }
  };

  const parseAssetMapping = (bp) => {
    try { return JSON.parse(bp.internal_asset_mapping || "[]"); } catch { return []; }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Universal Benchmark & Reverse Engineering
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Searches the web for the top 3 best existing systems in any industry, reverse engineers them, and creates a deterministic blueprint for replication
          </p>
        </div>

        {/* Input panel */}
        <Card className="bg-[#111] border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs text-gray-400 mb-1.5 block">Industry / Market</label>
                <Input
                  placeholder="e.g., real estate, HVAC, legal services..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs text-gray-400 mb-1.5 block">Market Context (optional)</label>
                <Input
                  placeholder="e.g., US residential, commercial B2B..."
                  value={marketContext}
                  onChange={(e) => setMarketContext(e.target.value)}
                  className="bg-[#0a0a0a] border-white/10 text-white"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={runBenchmark}
                  disabled={benchmarking || !industry.trim()}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {benchmarking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {benchmarking ? "Searching & Reverse Engineering..." : "Find Top 3 & Reverse Engineer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-950/20 border-red-500/30 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Live result */}
        {result && result.benchmarks && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Benchmark Results for "{result.industry}"</h2>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{result.benchmark_count} Systems</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.benchmarks.map((bp, i) => (
                <Card key={i} className="bg-[#111] border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                        #{bp.ranking}
                      </span>
                      <h3 className="font-semibold text-white text-sm">{bp.system_name}</h3>
                    </div>
                    <p className="text-xs text-blue-400 mb-2 truncate">{bp.system_url}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                        Score: {bp.rating_score}/100
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                        {bp.reusable_asset_count} internal assets
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{bp.architecture_summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stored blueprints */}
        {blueprints.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-400" />
              All Benchmark Blueprints ({blueprints.length})
            </h2>
            <div className="space-y-3">
              {blueprints.map((bp) => {
                const blueprint = parseBlueprint(bp);
                const roadmap = parseRoadmap(bp);
                const features = parseFeatures(bp);
                const assets = parseAssetMapping(bp);
                const isExpanded = expandedBlueprint === bp.id;
                return (
                  <Card key={bp.id} className="bg-[#111] border-white/10">
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedBlueprint(isExpanded ? null : bp.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                            #{bp.ranking}
                          </span>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{bp.system_name}</h3>
                            <p className="text-xs text-gray-500">{bp.industry} · Score: {bp.rating_score}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bp.system_url && (
                            <a href={bp.system_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Globe className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                            </a>
                          )}
                          <ArrowRight className={cn("w-4 h-4 text-gray-500 transition-transform", isExpanded && "rotate-90")} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                          {/* Key features */}
                          {features.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-2">Key Features</p>
                              <div className="flex flex-wrap gap-1.5">
                                {features.map((f, i) => (
                                  <Badge key={i} variant="outline" className="text-xs border-white/20 text-gray-300">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Architecture summary */}
                          {blueprint.architecture_summary && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                <Cpu className="w-3 h-3" /> Architecture Summary
                              </p>
                              <p className="text-sm text-gray-300">{blueprint.architecture_summary}</p>
                            </div>
                          )}

                          {/* Core modules */}
                          {blueprint.core_modules && blueprint.core_modules.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-2">Core Modules</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {blueprint.core_modules.map((m, i) => (
                                  <div key={i} className="bg-[#0a0a0a] border border-white/10 rounded-md p-2">
                                    <p className="text-xs font-medium text-white">{m.name}</p>
                                    <p className="text-xs text-gray-500">{m.purpose}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Replication roadmap */}
                          {roadmap.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                                <Map className="w-3 h-3" /> Replication Roadmap
                              </p>
                              <div className="space-y-2">
                                {roadmap.map((step, i) => (
                                  <div key={i} className="flex gap-3">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <div>
                                      <p className="text-xs font-medium text-white">{step.phase}</p>
                                      <p className="text-xs text-gray-500">{step.description}</p>
                                      {step.timeline && <p className="text-xs text-gray-600 mt-0.5">Timeline: {step.timeline}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Internal asset mapping */}
                          {assets.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-2">Reusable Internal Assets</p>
                              <div className="flex flex-wrap gap-1.5">
                                {assets.map((a, i) => (
                                  <Badge key={i} className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                                    {a.system_name} ({a.reuse_potential})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Competitive advantages & weaknesses */}
                          {(bp.competitive_advantages || bp.weaknesses) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {bp.competitive_advantages && (
                                <div className="bg-green-950/20 border border-green-500/20 rounded-md p-3">
                                  <p className="text-xs font-semibold text-green-400 mb-1">Advantages</p>
                                  <p className="text-xs text-gray-300">{bp.competitive_advantages}</p>
                                </div>
                              )}
                              {bp.weaknesses && (
                                <div className="bg-red-950/20 border border-red-500/20 rounded-md p-3">
                                  <p className="text-xs font-semibold text-red-400 mb-1">Weaknesses</p>
                                  <p className="text-xs text-gray-300">{bp.weaknesses}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {blueprints.length === 0 && !benchmarking && !result && (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter an industry above to find the top 3 systems and generate replication blueprints.</p>
          </div>
        )}
      </div>
    </div>
  );
}
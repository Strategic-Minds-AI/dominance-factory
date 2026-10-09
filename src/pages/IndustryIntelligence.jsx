import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Globe, Loader2, Crown, ArrowRight, BarChart3, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function IndustryIntelligence() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "analyze_industries",
      });
      setIndustries(res.data?.industries || res.industries || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <BarChart3 className="w-4 h-4" /> Step 2 — Industry Intelligence
          </div>
          <h1 className="text-2xl font-bold text-white">Top Industries for SEO Domination</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            AI-powered analysis of the top industries for programmatic SEO domination. Identifies SEO difficulty, commercial intent, NearMe domain potential, and lead value for each industry.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Run Analysis */}
        {industries.length === 0 && !loading && (
          <Card className="p-8 bg-zinc-900 border-white/10 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Run Industry Intelligence Analysis</h2>
            <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
              The AI will analyze all major NAICS industry sectors and rank them by SEO domination potential — considering difficulty, commercial intent, CPC, competition, and NearMe domain potential.
            </p>
            <Button onClick={analyze} className="bg-blue-600 hover:bg-blue-500 text-white">
              <Search className="w-4 h-4 mr-2" /> Analyze Top Industries
            </Button>
          </Card>
        )}

        {loading && (
          <Card className="p-8 bg-zinc-900 border-white/10 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-white/60">AI analyzing industries across all NAICS sectors...</p>
          </Card>
        )}

        {/* Industry Results */}
        {industries.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/50">{industries.length} industries analyzed</p>
              <Button onClick={analyze} variant="outline" size="sm" className="text-white/70 border-white/20">
                Re-Analyze
              </Button>
            </div>
            <div className="space-y-2">
              {industries.map((ind, i) => (
                <Card
                  key={i}
                  className={`p-4 ${selected === i ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-900 border-white/10"} cursor-pointer hover:border-blue-500/20 transition-colors`}
                  onClick={() => setSelected(selected === i ? null : i)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/40">#{i + 1}</span>
                        <p className="text-sm font-bold text-white">{ind.name}</p>
                        <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">{ind.naics_sector}</Badge>
                      </div>
                      <p className="text-xs text-white/50">{ind.reasoning}</p>
                      {selected === i && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs text-white/60 border-white/20">URL: {ind.recommended_url}</Badge>
                          </div>
                          <p className="text-xs text-white/40">Lead Value: ${ind.lead_value} per lead</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right shrink-0">
                      <div>
                        <p className="text-xs text-white/40">SEO Diff</p>
                        <p className={`text-sm font-bold ${ind.seo_difficulty < 40 ? "text-green-400" : ind.seo_difficulty < 70 ? "text-yellow-400" : "text-red-400"}`}>{ind.seo_difficulty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Intent</p>
                        <p className={`text-sm font-bold ${ind.commercial_intent >= 80 ? "text-green-400" : "text-yellow-400"}`}>{ind.commercial_intent}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">CPC</p>
                        <p className="text-sm font-bold text-white">${ind.avg_cpc}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">NearMe</p>
                        <p className={`text-sm font-bold ${ind.nearme_potential >= 80 ? "text-green-400" : "text-yellow-400"}`}>{ind.nearme_potential}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Link to="/seo-strategy">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                Continue to Step 3: SEO Dominance Strategy <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
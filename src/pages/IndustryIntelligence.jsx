import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2, Crown, ArrowRight, Search, CheckCircle2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, updateSession } from "@/lib/strategySession";

export default function IndustryIntelligence() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session.industry) setSelected(session.industry);
  }, []);

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

  const selectIndustry = (ind) => {
    updateSession({
      industry: ind.name,
      industry_data: ind,
      naics_sector: ind.naics_sector,
      recommended_url: ind.recommended_url,
      lead_value: ind.lead_value,
    });
    setSelected(ind.name);
    navigate("/god-mode");
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <BarChart3 className="w-4 h-4" /> Step 1 — Industry Intelligence
          </div>
          <h1 className="text-2xl font-bold text-white">Top Industries for SEO Domination</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            AI analyzes all NAICS sectors and ranks them by SEO domination potential. <span className="text-blue-400 font-medium">Select an industry to feed it into God Mode</span> — the system carries your choice through the entire workflow.
          </p>
        </div>

        {/* Session indicator */}
        {selected && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-white/70">Selected: <span className="text-white font-bold">{selected}</span> — continuing to God Mode</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Run Analysis */}
        {industries.length === 0 && !loading && (
          <Card className="p-8 bg-zinc-900 border-white/10 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Run Industry Intelligence Analysis</h2>
            <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
              The AI will analyze all major NAICS industry sectors and rank them by SEO domination potential.
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
              <p className="text-xs text-white/50">{industries.length} industries analyzed — click one to select & continue</p>
              <Button onClick={analyze} variant="outline" size="sm" className="text-white/70 border-white/20">Re-Analyze</Button>
            </div>
            <div className="space-y-2">
              {industries.map((ind, i) => (
                <Card
                  key={i}
                  className={`p-4 ${selected === ind.name ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-900 border-white/10"} hover:border-blue-500/30 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/40">#{i + 1}</span>
                        <p className="text-sm font-bold text-white">{ind.name}</p>
                        <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">{ind.naics_sector}</Badge>
                      </div>
                      <p className="text-xs text-white/50">{ind.reasoning}</p>
                      <p className="text-xs text-white/40 mt-1">Lead Value: ${ind.lead_value} • URL: {ind.recommended_url}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-right">
                        <div><p className="text-xs text-white/40">SEO Diff</p><p className={`text-sm font-bold ${ind.seo_difficulty < 40 ? "text-green-400" : ind.seo_difficulty < 70 ? "text-yellow-400" : "text-red-400"}`}>{ind.seo_difficulty}</p></div>
                        <div><p className="text-xs text-white/40">Intent</p><p className={`text-sm font-bold ${ind.commercial_intent >= 80 ? "text-green-400" : "text-yellow-400"}`}>{ind.commercial_intent}</p></div>
                        <div><p className="text-xs text-white/40">CPC</p><p className="text-sm font-bold text-white">${ind.avg_cpc}</p></div>
                        <div><p className="text-xs text-white/40">NearMe</p><p className={`text-sm font-bold ${ind.nearme_potential >= 80 ? "text-green-400" : "text-yellow-400"}`}>{ind.nearme_potential}</p></div>
                      </div>
                      <Button
                        onClick={() => selectIndustry(ind)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                      >
                        <Zap className="w-3 h-3 mr-1" /> Select & Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
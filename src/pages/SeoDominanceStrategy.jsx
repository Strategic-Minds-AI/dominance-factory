import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Target, Zap, Loader2, ArrowRight, Globe, MapPin, TrendingUp, DollarSign, CheckCircle2, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function SeoDominanceStrategy() {
  const [industry, setIndustry] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    if (!industry.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "generate_seo_plan",
        industry,
        url,
        location,
        business_name: businessName,
      });
      setPlan(res.data?.plan || res.plan);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const runSimulations = async () => {
    if (!industry.trim()) return;
    setSimLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "run_simulations",
        industry,
        url,
        iterations: 50,
      });
      setSimulations(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setSimLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Crown className="w-4 h-4" /> Step 3 — SEO Dominance Strategy
          </div>
          <h1 className="text-2xl font-bold text-white">Programmatic SEO/AEO/GEO Strategy</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Generate a comprehensive NearMe.com digital dominance plan with Monte Carlo simulations. Covers keywords, schema, content, backlinks, AEO, GEO, local SEO, and indexation strategy.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Input Form */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4">Strategy Inputs</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 mb-2 block">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Roofing" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Apex Roofing" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">URL (optional)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g., roofingnearme.com" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Location (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Miami, FL" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={generatePlan} disabled={!industry.trim() || loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Plan...</> : <><Crown className="w-4 h-4 mr-2" /> Generate Dominance Plan</>}
            </Button>
            <Button onClick={runSimulations} disabled={!industry.trim() || simLoading} variant="outline" className="text-white/70 border-white/20">
              {simLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating...</> : <><Zap className="w-4 h-4 mr-2" /> Run Simulations</>}
            </Button>
          </div>
        </Card>

        {/* Simulations */}
        {simulations?.simulations?.length > 0 && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Monte Carlo Simulations
            </h2>
            {simulations.winner && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Winner</p>
                <p className="text-sm font-bold text-white">{simulations.winner}</p>
                <p className="text-xs text-white/60 mt-1">{simulations.summary}</p>
              </div>
            )}
            <div className="space-y-2">
              {simulations.simulations.map((sim, i) => (
                <div key={i} className={`p-3 rounded-md ${sim.winner ? "bg-green-500/5 border border-green-500/20" : "bg-white/5 border border-white/10"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{sim.strategy}</p>
                    {sim.winner && <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Winner</Badge>}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-white/40">3mo P1</p>
                      <p className="text-white font-bold">{sim.p_page1_3mo}%</p>
                    </div>
                    <div>
                      <p className="text-white/40">6mo P1</p>
                      <p className="text-white font-bold">{sim.p_page1_6mo}%</p>
                    </div>
                    <div>
                      <p className="text-white/40">12mo Traffic</p>
                      <p className="text-white font-bold">{sim.expected_traffic_12mo?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/40">12mo Revenue</p>
                      <p className="text-white font-bold">${sim.expected_revenue_12mo?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Plan Results */}
        {plan && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Dominance Plan
              </h2>
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">Score: {plan.dominance_score}/100</Badge>
            </div>
            <div className="space-y-4">
              {plan.target_keywords?.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Target Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.target_keywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-white/70 border-white/20">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {plan.long_tail_keywords?.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Long-Tail Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.long_tail_keywords.slice(0, 15).map((k, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-blue-300 border-blue-500/20">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {plan.schema_types?.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Schema.org Types</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.schema_types.map((s, i) => (
                      <Badge key={i} className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {plan.page_template_structure && <PlanField label="Page Template Structure" value={plan.page_template_structure} />}
                {plan.content_schedule && <PlanField label="Content Schedule" value={plan.content_schedule} />}
                {plan.backlink_strategy && <PlanField label="Backlink Strategy" value={plan.backlink_strategy} />}
                {plan.gbp_optimization && <PlanField label="Google Business Profile" value={plan.gbp_optimization} />}
                {plan.aeo_optimization && <PlanField label="AEO Optimization" value={plan.aeo_optimization} />}
                {plan.geo_optimization && <PlanField label="GEO Optimization" value={plan.geo_optimization} />}
                {plan.internal_linking && <PlanField label="Internal Linking" value={plan.internal_linking} />}
                {plan.indexation_strategy && <PlanField label="Indexation Strategy" value={plan.indexation_strategy} />}
                {plan.local_seo && <PlanField label="Local SEO" value={plan.local_seo} />}
                {plan.conversion_optimization && <PlanField label="Conversion Optimization" value={plan.conversion_optimization} />}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-xs text-white/50">Target Pages</p>
                  <p className="text-xl font-bold text-white">{plan.total_target_pages || "—"}</p>
                </div>
                <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-xs text-white/50">URL Pattern</p>
                  <p className="text-sm font-bold text-white font-mono">{plan.url_pattern || "—"}</p>
                </div>
                <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-xs text-white/50">Timeline</p>
                  <p className="text-sm font-bold text-white">{plan.estimated_timeline || "—"}</p>
                </div>
              </div>
            </div>
            <Link to="/onboarding">
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white">
                Continue to Step 4: Onboarding Pipeline <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

function PlanField({ label, value }) {
  return (
    <div className="p-3 rounded-md bg-white/5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs text-white/80">{value}</p>
    </div>
  );
}
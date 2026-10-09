import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Loader2, Crown, ArrowRight, Star, Globe, Zap, Layers, Clock, TrendingUp, Bot, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getSession, updateSession, clearSession, getSessionSummary } from "@/lib/strategySession";
import NearMeVariations from "@/components/strategy/NearMeVariations";
import PiggybackSystem from "@/components/strategy/PiggybackSystem";
import TimeEstimator from "@/components/strategy/TimeEstimator";
import ScalingSimulator from "@/components/strategy/ScalingSimulator";

export default function BusinessNameGenerator() {
  const [session, setSession] = useState({});
  const [top30, setTop30] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessNameHint, setBusinessNameHint] = useState("");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s.topUrls) setTop30(s.topUrls);
  }, []);

  const sessionSteps = getSessionSummary();

  const generateTop30 = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateBusinessName", {
        action: "generate_top30",
        industry: session.industry,
        location: session.industry_data?.location,
        god_mode_strategy: session.godModeStrategy,
        digital_dominance_targets: session.digitalDominanceTargets,
        business_name_hint: businessNameHint,
      });
      const data = res.data || res;
      setTop30(data.top30 || []);
      updateSession({ topUrls: data.top30 || [] });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleClear = () => {
    clearSession();
    setSession({});
    setTop30([]);
  };

  const hasContext = session.industry || session.godModeStrategy || session.digitalDominanceTargets;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Sparkles className="w-4 h-4" /> Step 5 — Name & URL Generator
          </div>
          <h1 className="text-2xl font-bold text-white">AI Name & URL Generator — Full Strategy Engine</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Combines all accumulated intelligence from Steps 1-4 to generate the perfect Top 30 names + URLs. Includes NearMe 100 variations, piggyback system, time estimator, and programmatic scaling simulator.
          </p>
        </div>

        {/* Strategy Session Context */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Accumulated Strategy Context
            </h2>
            {hasContext && (
              <Button onClick={handleClear} variant="ghost" size="sm" className="text-white/50 hover:text-red-400">
                <Trash2 className="w-3 h-3 mr-1" /> Clear Session
              </Button>
            )}
          </div>
          {hasContext ? (
            <div className="grid grid-cols-4 gap-2">
              {sessionSteps.map((s) => (
                <div key={s.step} className={`p-2 rounded-md ${s.done ? "bg-green-500/10 border border-green-500/20" : "bg-white/5 border border-white/10"}`}>
                  <div className="flex items-center gap-1.5">
                    {s.done ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <div className="w-3 h-3 rounded-full border border-white/30" />}
                    <p className="text-xs font-medium text-white">{s.label}</p>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-white/40 mb-3">No strategy context yet. Start from Step 1 to build the full workflow:</p>
              <Link to="/industries">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                  Go to Step 1: Industry Intelligence <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Top 30 Generator */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Top 30 Names & URLs — Master Generator
          </h2>
          <p className="text-xs text-white/50 mb-4">
            Uses ALL accumulated context (industry, God Mode strategy, digital dominance targets) to generate the 30 best names + URLs. Top 10 are checked for domain availability. Ranked by SEO score, NearMe benefit, and piggyback potential.
          </p>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Label className="text-white/70 mb-2 block">Business Name Hint (optional)</Label>
              <Input value={businessNameHint} onChange={(e) => setBusinessNameHint(e.target.value)} placeholder="e.g., Apex (leave empty for AI to choose)" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex items-end">
              <Button onClick={generateTop30} disabled={loading || !hasContext} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Crown className="w-4 h-4 mr-2" /> Generate Top 30</>}
              </Button>
            </div>
          </div>

          {top30.length > 0 && (
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {top30.map((t, i) => (
                <div key={i} className={`p-3 rounded-md ${i < 5 ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-white/5 border border-white/10"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white/40">#{t.rank || i + 1}</span>
                        <p className="text-sm font-bold text-white">{t.business_name}</p>
                        {t.availability === true && <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Available</Badge>}
                        {t.availability === false && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Taken</Badge>}
                        {t.registration_price > 0 && t.availability === true && <span className="text-xs text-green-400">${t.registration_price}</span>}
                      </div>
                      <p className="text-xs font-mono text-blue-300 truncate">{t.url}</p>
                      <p className="text-xs text-white/50 mt-1">{t.reasoning}</p>
                      <p className="text-xs text-yellow-400/70 mt-0.5">Google advantage: {t.google_advantage}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-right shrink-0 ml-3">
                      <div><p className="text-xs text-white/40">SEO</p><p className="text-sm font-bold text-white">{t.seo_score}</p></div>
                      <div><p className="text-xs text-white/40">NearMe</p><p className="text-sm font-bold text-green-400">{t.nearme_benefit}</p></div>
                      <div><p className="text-xs text-white/40">Intent</p><Badge variant="outline" className={`text-xs ${t.commercial_intent === "very_high" ? "text-green-400 border-green-500/30" : "text-white/50 border-white/20"}`}>{t.commercial_intent}</Badge></div>
                      <div><p className="text-xs text-white/40">Page 1</p><p className="text-xs text-white font-medium">{t.time_to_page1}</p></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!top30.length && !loading && hasContext && (
            <div className="text-center py-6">
              <Crown className="w-8 h-8 text-yellow-400/30 mx-auto mb-2" />
              <p className="text-xs text-white/40">Click "Generate Top 30" to combine all strategy context into the best names + URLs</p>
            </div>
          )}
        </Card>

        {/* NearMe 100 Variations */}
        {hasContext && (
          <NearMeVariations businessName={businessNameHint || session.business_name} industry={session.industry} />
        )}

        {/* Piggyback System */}
        {hasContext && (
          <PiggybackSystem businessName={businessNameHint || session.business_name} industry={session.industry} url={session.recommended_url} />
        )}

        {/* Time Estimator */}
        {hasContext && (
          <TimeEstimator industry={session.industry} url={session.recommended_url} hasNearMe={true} location={session.industry_data?.location} />
        )}

        {/* Programmatic Scaling Simulator */}
        {hasContext && (
          <ScalingSimulator industry={session.industry} url={session.recommended_url} strategy={session.godModeStrategy} />
        )}

        {/* Super Agent Integration Panel */}
        {hasContext && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" /> Super Agent Integration
            </h3>
            <p className="text-xs text-white/50 mb-4">
              The Xtreme Super Agent system can autonomously operate this entire workflow — from industry analysis to domain registration to website creation to SEO deployment. Connect agents to automate the full pipeline.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs font-bold text-purple-300 mb-1">Control Plane (Agent 00)</p>
                <p className="text-xs text-white/60">Orchestrates the entire workflow — triggers industry analysis, God Mode, digital dominance, and name generation in sequence.</p>
              </div>
              <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs font-bold text-blue-300 mb-1">Build Factory (Agent 01)</p>
                <p className="text-xs text-white/60">Takes the Top 30 URLs and auto-builds websites for each — programmatic site creation at scale.</p>
              </div>
              <div className="p-3 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs font-bold text-cyan-300 mb-1">Visual Factory (Agent 02)</p>
                <p className="text-xs text-white/60">Generates brand assets, logos, and visual content for each site in the network.</p>
              </div>
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-bold text-green-300 mb-1">Scale Fleet (Agent 04)</p>
                <p className="text-xs text-white/60">Deploys and manages the fleet of sites — provisioning, domain assignment, and monitoring at 10-2000 site scale.</p>
              </div>
            </div>
            <Link to="/agents" className="block mt-4">
              <Button variant="outline" className="w-full text-white/70 border-white/20 hover:bg-purple-500/10">
                <Bot className="w-4 h-4 mr-2" /> Go to Super Agents to activate autonomous mode
              </Button>
            </Link>
          </Card>
        )}

        {/* Continue to Onboarding */}
        {top30.length > 0 && (
          <Link to="/onboarding">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              Continue to Step 6: Onboarding Pipeline <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
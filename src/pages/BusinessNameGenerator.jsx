import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Globe, CheckCircle2, XCircle, Loader2, Zap, TrendingUp, DollarSign, Target, Crown, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const INDUSTRIES = [
  "Roofing", "HVAC", "Plumbing", "Electrical", "Concrete Polishing", "Epoxy Flooring",
  "Pest Control", "Cleaning Service", "Landscaping", "Solar Installation",
  "Locksmith", "Towing", "Auto Repair", "Moving Company",
  "Emergency Dentist", "Chiropractor", "Urgent Care", "Physical Therapy",
  "Law Firm", "Real Estate", "Restaurant", "IT Services", "Marketing Agency",
];

const URL_PATTERNS = [
  { id: "nearme", label: "[niche]nearme.com", desc: "Exact-match local intent" },
  { id: "near", label: "[niche]near.com", desc: "Short local modifier" },
  { id: "nearyou", label: "[niche]nearyou.com", desc: "Personal local intent" },
  { id: "phrase", label: "[phrase].com", desc: "Exact-match phrase" },
  { id: "exact_match", label: "[industry].com", desc: "Pure industry match" },
  { id: "local_modifier", label: "[city][niche].com", desc: "City + niche combo" },
];

export default function BusinessNameGenerator() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState("professional");
  const [selectedPatterns, setSelectedPatterns] = useState(["nearme", "nearyou", "exact_match"]);
  const [cities, setCities] = useState("");

  const [names, setNames] = useState([]);
  const [generatingNames, setGeneratingNames] = useState(false);
  const [urlCandidates, setUrlCandidates] = useState([]);
  const [generatingUrls, setGeneratingUrls] = useState(false);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [urlRecommendation, setUrlRecommendation] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");

  const generateNames = async () => {
    if (!industry.trim()) return;
    setGeneratingNames(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateBusinessName", {
        action: "generate_names",
        industry,
        location,
        style,
      });
      setNames(res.data?.names || res.names || []);
      setStep(2);
    } catch (e) {
      setError(e.message);
    }
    setGeneratingNames(false);
  };

  const generateUrls = async () => {
    if (!industry.trim()) return;
    setGeneratingUrls(true);
    setError("");
    try {
      const cityList = cities.split(",").map((c) => c.trim()).filter(Boolean);
      const res = await base44.functions.invoke("generateBusinessName", {
        action: "generate_urls",
        niche: industry,
        patterns: selectedPatterns,
        cities: cityList,
      });
      setUrlCandidates(res.data?.candidates || res.candidates || []);
      setStep(3);
    } catch (e) {
      setError(e.message);
    }
    setGeneratingUrls(false);
  };

  const checkAvailability = async (domains) => {
    setCheckingAvail(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateBusinessName", {
        action: "check_availability",
        domains,
      });
      const results = res.data?.results || res.results || [];
      setUrlCandidates((prev) =>
        prev.map((c) => {
          const match = results.find((r) => r.domain === c.domain);
          return match ? { ...c, availability_status: match.available ? "available" : "unavailable", registration_price: match.price } : c;
        })
      );
    } catch (e) {
      setError(e.message);
    }
    setCheckingAvail(false);
  };

  const optimizeUrl = async () => {
    if (!industry.trim()) return;
    setOptimizing(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateBusinessName", {
        action: "optimize_url",
        industry,
        location,
      });
      setUrlRecommendation(res.data?.recommendation || res.recommendation);
      setStep(4);
    } catch (e) {
      setError(e.message);
    }
    setOptimizing(false);
  };

  const togglePattern = (id) => {
    setSelectedPatterns((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Sparkles className="w-4 h-4" /> Step 1 — Business Name & URL Generator
          </div>
          <h1 className="text-2xl font-bold text-white">AI-Assisted Name & URL Discovery</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Generate SEO-optimized business names and Google-optimized URLs using NearMe.com, NearYou.com, and exact-match domain patterns. AI scores every option for highest Google ranking potential.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-blue-600 text-white" : "bg-white/10 text-white/40"}`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Industry + Name Generation */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> Generate Business Names
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-white/70 mb-2 block">Industry / Niche</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${industry === ind ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Or type your own industry..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70 mb-2 block">Location (optional)</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Miami, FL"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/70 mb-2 block">Name Style</Label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="modern">Modern / Tech</option>
                  <option value="luxury">Luxury / Premium</option>
                  <option value="local">Local / Community</option>
                  <option value="bold">Bold / Aggressive</option>
                </select>
              </div>
            </div>
            <Button
              onClick={generateNames}
              disabled={!industry.trim() || generatingNames}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {generatingNames ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Names...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate 10 AI-Optimized Names</>}
            </Button>
          </div>
        </Card>

        {/* Step 2: Name Results */}
        {names.length > 0 && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> AI-Generated Names ({names.length})
            </h2>
            <div className="space-y-2">
              {names.map((n, i) => (
                <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{n.name}</p>
                      <p className="text-xs text-white/50 mt-0.5">{n.seo_reasoning}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">{n.suggested_url}</Badge>
                        {n.commercial_intent && <Badge variant="outline" className={`text-xs ${n.commercial_intent === "very_high" ? "text-green-400 border-green-500/30" : "text-white/50 border-white/20"}`}>{n.commercial_intent} intent</Badge>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-lg font-bold text-white">{n.seo_score}</span>
                      </div>
                      <p className="text-xs text-white/40">SEO Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep(3)} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white">
              Continue to URL Generation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}

        {/* Step 3: URL Pattern Selection + Generation */}
        {(step >= 3 || names.length > 0) && (
          <Card className="p-6 bg-zinc-900 border-white/10">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> URL Pattern Selection
            </h2>
            <p className="text-xs text-white/50 mb-4">Select Google-optimized URL patterns. NearMe.com and NearYou.com patterns capture high-intent local search traffic.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {URL_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePattern(p.id)}
                  className={`p-3 rounded-md text-left border transition-colors ${selectedPatterns.includes(p.id) ? "bg-blue-500/10 border-blue-500/30 text-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
                >
                  <p className="text-sm font-mono font-medium">{p.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
            <div className="mb-4">
              <Label className="text-white/70 mb-2 block">Cities (comma-separated, for local_modifier pattern)</Label>
              <Input
                value={cities}
                onChange={(e) => setCities(e.target.value)}
                placeholder="e.g., Miami, Orlando, Tampa, Jacksonville"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              onClick={generateUrls}
              disabled={!industry.trim() || !selectedPatterns.length || generatingUrls}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {generatingUrls ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating & Scoring URLs...</> : <><Zap className="w-4 h-4 mr-2" /> Generate & AI-Score URLs</>}
            </Button>

            {/* URL Candidates */}
            {urlCandidates.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/50">{urlCandidates.length} URL candidates generated</p>
                  <Button
                    onClick={() => checkAvailability(urlCandidates.map((c) => c.domain))}
                    disabled={checkingAvail}
                    size="sm"
                    variant="outline"
                    className="text-white/70 border-white/20"
                  >
                    {checkingAvail ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
                    Check Availability
                  </Button>
                </div>
                {urlCandidates.map((c, i) => (
                  <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono font-medium text-white">{c.domain}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {c.recommended && <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Recommended</Badge>}
                          {c.availability_status === "available" && <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Available {c.registration_price ? `$${c.registration_price}` : ""}</Badge>}
                          {c.availability_status === "unavailable" && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Taken</Badge>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/60">Demand: <span className="text-white font-bold">{c.demand_score}</span></span>
                          <span className="text-white/60">SEO: <span className="text-white font-bold">{c.seo_score}</span></span>
                          {c.cpc_estimate > 0 && <span className="text-white/60">CPC: <span className="text-white font-bold">${c.cpc_estimate}</span></span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {urlCandidates.length > 0 && (
              <Button onClick={optimizeUrl} disabled={optimizing} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white">
                {optimizing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI Optimizing...</> : <><Crown className="w-4 h-4 mr-2" /> Get AI-Optimized URL Recommendation</>}
              </Button>
            )}
          </Card>
        )}

        {/* Step 4: AI Recommendation */}
        {urlRecommendation && (
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" /> AI-Optimized URL Recommendation
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Recommended URL</p>
                <p className="text-xl font-bold font-mono text-white">{urlRecommendation.recommended_url}</p>
                <Badge className="mt-2 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">{urlRecommendation.url_pattern}</Badge>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Why This URL Ranks Fastest</p>
                <p className="text-sm text-white/80">{urlRecommendation.reasoning}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Google Algorithm Advantage</p>
                <p className="text-sm text-white/80">{urlRecommendation.google_algorithm_advantage}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-white/5">
                  <p className="text-xs text-white/50">Est. Time to Page 1</p>
                  <p className="text-sm font-bold text-white">{urlRecommendation.estimated_time_to_page1}</p>
                </div>
                <div className="p-3 rounded-md bg-white/5">
                  <p className="text-xs text-white/50">Registration Cost</p>
                  <p className="text-sm font-bold text-white">{urlRecommendation.registration_cost_estimate}</p>
                </div>
              </div>
              {urlRecommendation.alternative_urls?.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Alternative URLs</p>
                  <div className="flex flex-wrap gap-2">
                    {urlRecommendation.alternative_urls.map((u, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-white/70 border-white/20 font-mono">{u}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">SEO Strategy Summary</p>
                <p className="text-sm text-white/80">{urlRecommendation.seo_strategy_summary}</p>
              </div>
            </div>
            <Link to="/industries">
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white">
                Continue to Step 2: Industry Intelligence <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2, ArrowRight, Globe, Building2, Search, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, updateSession } from "@/lib/strategySession";

export default function DigitalDominance() {
  const [profile, setProfile] = useState({ name: "", url: "", industry: "", location: "" });
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const navigate = useNavigate();

  // Auto-fill from strategy session
  useEffect(() => {
    const session = getSession();
    setProfile({
      name: session.business_name || "",
      url: session.recommended_url || "",
      industry: session.industry || "",
      location: session.industry_data?.location || "",
    });
    if (session.digitalDominanceTargets) {
      setTargets(session.digitalDominanceTargets);
      setSummary(session.digitalDominanceSummary || "");
    }
  }, []);

  const discover = async () => {
    if (!profile.industry) { setError("Industry is required (select one in Step 1)"); return; }
    setLoading(true);
    setError("");
    setTargets([]);
    setSummary("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "discover_submission_targets",
        industry: profile.industry,
        business_name: profile.name,
        url: profile.url,
        location: profile.location,
      });
      const data = res.data || res;
      setTargets(data.targets || []);
      setSummary(data.summary || "");
      updateSession({ digitalDominanceTargets: data.targets || [], digitalDominanceSummary: data.summary || "" });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const continueToNameGenerator = () => {
    updateSession({ digitalDominanceTargets: targets, digitalDominanceSummary: summary, business_name: profile.name });
    navigate("/");
  };

  const priorityCount = (p) => targets.filter((t) => t.priority === p).length;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            <Crown className="w-4 h-4" /> Step 3 — Digital Dominance
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> Digital Dominance Generator
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Auto-filled from your previous steps. Discovers every directory, review site, and citation source — then feeds into the Name & URL Generator.
          </p>
        </div>

        {/* Session context */}
        {profile.industry && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-white/70">From Steps 1-2: <span className="text-white font-bold">{profile.industry}</span>{profile.url ? ` • ${profile.url}` : ""}{profile.location ? ` • ${profile.location}` : ""}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Business Profile Form */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-yellow-500" /> Business Profile <span className="text-xs text-blue-400 font-normal">(auto-filled from previous steps)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 mb-2 block">Business Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="e.g., Apex Roofing" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Website URL</Label>
              <Input value={profile.url} onChange={(e) => setProfile({ ...profile, url: e.target.value })} placeholder="e.g., roofingnearme.com" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Industry</Label>
              <Input value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} placeholder="e.g., Roofing" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70 mb-2 block">Location</Label>
              <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g., Miami, FL" className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <Button onClick={discover} disabled={loading || !profile.industry} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Discovering Targets...</> : <><Search className="w-4 h-4 mr-2" /> Discover Submission Targets</>}
          </Button>
        </Card>

        {summary && (
          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <p className="text-sm text-white/80">{summary}</p>
          </Card>
        )}

        {targets.length > 0 && (
          <>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3 bg-zinc-900 border-white/10 text-center"><p className="text-2xl font-bold text-white">{targets.length}</p><p className="text-xs text-white/50">Total Targets</p></Card>
              <Card className="p-3 bg-red-500/5 border-red-500/20 text-center"><p className="text-2xl font-bold text-red-400">{priorityCount("critical")}</p><p className="text-xs text-white/50">Critical</p></Card>
              <Card className="p-3 bg-yellow-500/5 border-yellow-500/20 text-center"><p className="text-2xl font-bold text-yellow-400">{priorityCount("high")}</p><p className="text-xs text-white/50">High Priority</p></Card>
              <Card className="p-3 bg-blue-500/5 border-blue-500/20 text-center"><p className="text-2xl font-bold text-blue-400">{priorityCount("medium")}</p><p className="text-xs text-white/50">Medium</p></Card>
            </div>

            <Card className="p-5 bg-zinc-900 border-white/10">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-yellow-400" /> Submission Targets ({targets.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {targets.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-blue-300 font-mono">{t.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs text-white/50 border-white/20">{t.category}</Badge>
                      <Badge className={`text-xs ${t.priority === "critical" ? "bg-red-500/20 text-red-300 border-red-500/30" : t.priority === "high" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>{t.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button onClick={continueToNameGenerator} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              <Link2 className="w-4 h-4 mr-2" /> Continue to Step 5: Name & URL Generator <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
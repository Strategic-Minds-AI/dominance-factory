import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2, ArrowRight, Globe, Building2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "Business Directories", "Review Sites", "Social Media", "Industry Directories",
  "Local Citations", "Blog Guest Posts", "Backlink Sources", "Press Release",
  "Podcast Directories", "Video Platforms",
];

export default function DigitalDominance() {
  const [profile, setProfile] = useState({ name: "", url: "", industry: "", location: "" });
  const [selectedCats, setSelectedCats] = useState(CATEGORIES);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  const toggleCat = (cat) => {
    setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const discover = async () => {
    if (!profile.name || !profile.url) { setError("Business name and URL are required"); return; }
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
      setTargets(res.data?.targets || res.targets || []);
      setSummary(res.data?.summary || res.summary || "");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const priorityCount = (p) => targets.filter((t) => t.priority === p).length;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            <Crown className="w-4 h-4" /> Step 9 — Digital Dominance
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> Digital Dominance Generator
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Enter your business info once — the AI discovers every directory, review site, social platform, and citation source to flood with your presence for maximum Google visibility.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Business Profile Form */}
        <Card className="p-6 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-yellow-500" /> Business Profile
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

          {/* Category Selection */}
          <div className="mt-4">
            <Label className="text-white/70 mb-2 block">Submission Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCats.includes(cat) ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300" : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={discover} disabled={loading || !profile.name || !profile.url} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Discovering Targets...</> : <><Search className="w-4 h-4 mr-2" /> Discover Submission Targets</>}
          </Button>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <p className="text-sm text-white/80">{summary}</p>
          </Card>
        )}

        {/* Results */}
        {targets.length > 0 && (
          <>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3 bg-zinc-900 border-white/10 text-center">
                <p className="text-2xl font-bold text-white">{targets.length}</p>
                <p className="text-xs text-white/50">Total Targets</p>
              </Card>
              <Card className="p-3 bg-red-500/5 border-red-500/20 text-center">
                <p className="text-2xl font-bold text-red-400">{priorityCount("critical")}</p>
                <p className="text-xs text-white/50">Critical</p>
              </Card>
              <Card className="p-3 bg-yellow-500/5 border-yellow-500/20 text-center">
                <p className="text-2xl font-bold text-yellow-400">{priorityCount("high")}</p>
                <p className="text-xs text-white/50">High Priority</p>
              </Card>
              <Card className="p-3 bg-blue-500/5 border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-blue-400">{priorityCount("medium")}</p>
                <p className="text-xs text-white/50">Medium</p>
              </Card>
            </div>

            <Card className="p-5 bg-zinc-900 border-white/10">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400" /> Submission Targets ({targets.length})
              </h2>
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
                      {t.industry_specific && <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">Industry</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Link to="/social">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                Continue to Step 10: Social Media <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
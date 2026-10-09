import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  CheckCircle2, AlertTriangle, XCircle, Layers, ChevronDown, ChevronRight,
  Wrench, ArrowRight, ShieldCheck, Server, Bot, Share2, Search, Rocket,
} from "lucide-react";
import { SYSTEM_REQUIREMENTS } from "@/lib/systemCatalog";

const STATUS_META = {
  have:    { color: "text-green-400",  bg: "bg-green-500/5",  border: "border-green-500/30",  icon: CheckCircle2, label: "Operational" },
  partial: { color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/30", icon: AlertTriangle, label: "In Progress" },
  gap:     { color: "text-red-400",   bg: "bg-red-500/5",    border: "border-red-500/30",    icon: XCircle, label: "Gap" },
};

// Map gap items to actions the user can take
const GAP_ACTIONS = {
  "Per-Site Admin Portal": { label: "Build Admin Portal Template", path: "/packs" },
  "Per-Site Client Portal": { label: "Build Client Portal Template", path: "/packs" },
  "Per-Site AI Chat Agent": { label: "Configure Chat Agent", path: "/library" },
  "Per-Site Super Agents": { label: "Deploy Per-Site Agents", path: "/agents" },
  "Per-Site Secret Management": { label: "Set Up Secret Vault", path: "/sync" },
  "Multi-Tenant Data Isolation": { label: "Design Isolation Architecture", path: "/contents" },
  "Adapter Mapping (canonical ↔ legacy)": { label: "Build Adapter Mapping", path: "/sync" },
  "Cross-Project Data Sync": { label: "Build Data Sync", path: "/sync" },
  "Autonomous Chat Agent (Floating)": { label: "Open Chat Agent", path: "/library" },
  "GPT Command Channel": { label: "Configure GPT Sync", path: "/sync" },
  "Read/Write/Execute Permissions": { label: "Configure Autonomy", path: "/library" },
  "Agent Enable/Disable Controls": { label: "Manage Agents", path: "/agents" },
  "Bulk Site Deployment Pipeline": { label: "Build Bulk Deploy", path: "/provisioning" },
  "Content Variation Engine": { label: "Build Content Spinner", path: "/launch" },
  "Auto-Posting to Platforms": { label: "Connect Platform APIs", path: "/social-automation" },
  "AI Comment Engagement": { label: "Build Comment Agent", path: "/agents" },
  "AI DM Responses": { label: "Build DM Agent", path: "/agents" },
  "AEO Optimization Module": { label: "Build AEO Module", path: "/god-mode" },
  "GEO Optimization Module": { label: "Build GEO Module", path: "/god-mode" },
  "Google Search Console": { label: "Connect Search Console", path: "/sync" },
  "Google Business Profile": { label: "Connect GBP", path: "/sync" },
  "Backlink Automation": { label: "Build Backlink Agent", path: "/agents" },
  "Local Citation Builder": { label: "Build Citation Agent", path: "/agents" },
  "Review Management": { label: "Build Review Agent", path: "/agents" },
  "Bulk Site Deployment": { label: "Build Bulk Pipeline", path: "/provisioning" },
  "Domain Auto-Purchase": { label: "Configure GoDaddy Auto-Buy", path: "/provisioning" },
  "Per-Site Analytics": { label: "Build Per-Site Analytics", path: "/analytics" },
  "Per-Site CRM": { label: "Build Per-Site CRM", path: "/outreach" },
  "Per-Site Booking": { label: "Build Booking System", path: "/outreach" },
  "Per-Site Email Marketing": { label: "Build Email Marketing", path: "/outreach" },
  "Per-Site SMS Marketing": { label: "Build SMS Marketing", path: "/outreach" },
};

const CATEGORY_ICONS = {
  "Core Platform": Layers,
  "Supabase Convergence": Server,
  "Per-Site Architecture": Server,
  "Autonomous Operations": Bot,
  "Social Media Automation": Share2,
  "SEO / AEO / GEO": Search,
  "Scale Infrastructure": Rocket,
};

export default function SystemGapAnalysis() {
  const [openCats, setOpenCats] = useState(() => new Set(SYSTEM_REQUIREMENTS.map((c) => c.category)));

  const allReqs = SYSTEM_REQUIREMENTS.flatMap((c) => c.requirements);
  const stats = {
    total: allReqs.length,
    have: allReqs.filter((r) => r.status === "have").length,
    partial: allReqs.filter((r) => r.status === "partial").length,
    gap: allReqs.filter((r) => r.status === "gap").length,
  };
  const pct = stats.total > 0 ? Math.round((stats.have / stats.total) * 100) : 0;
  const gapItems = allReqs.filter((r) => r.status === "gap");

  const toggleCat = (cat) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <ShieldCheck className="w-4 h-4" /> System Gap Analysis
          </div>
          <h1 className="text-2xl font-bold text-white">Operational Readiness & Gap Filler</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            What the system needs to be fully operational, what's built, what's missing, and buttons to fill every gap.
          </p>
        </div>

        {/* Overall progress */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">System Operational Readiness</h2>
            <span className="text-2xl font-bold text-white font-mono">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-orange-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-md bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/50">Requirements</p>
            </div>
            <div className="text-center p-2 rounded-md bg-green-500/5 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.have}</p>
              <p className="text-xs text-white/50">Operational</p>
            </div>
            <div className="text-center p-2 rounded-md bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.partial}</p>
              <p className="text-xs text-white/50">In Progress</p>
            </div>
            <div className="text-center p-2 rounded-md bg-red-500/5 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.gap}</p>
              <p className="text-xs text-white/50">Gaps</p>
            </div>
          </div>
        </Card>

        {/* Gap summary with fill buttons */}
        {gapItems.length > 0 && (
          <Card className="p-4 bg-red-500/5 border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Critical Gaps — Fill Now</h3>
              <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">{gapItems.length} gaps</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gapItems.map((gap, i) => {
                const action = GAP_ACTIONS[gap.name];
                return (
                  <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-red-500/5 border border-red-500/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{gap.name}</p>
                      <p className="text-xs text-white/40 truncate">{gap.desc}</p>
                    </div>
                    {action && (
                      <Link to={action.path}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white shrink-0">
                          <Wrench className="w-3 h-3 mr-1" /> Fill
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Detailed requirements by category */}
        {SYSTEM_REQUIREMENTS.map((cat) => {
          const CatIcon = CATEGORY_ICONS[cat.category] || Layers;
          const catStats = {
            have: cat.requirements.filter((r) => r.status === "have").length,
            partial: cat.requirements.filter((r) => r.status === "partial").length,
            gap: cat.requirements.filter((r) => r.status === "gap").length,
          };
          const catPct = cat.requirements.length > 0 ? Math.round((catStats.have / cat.requirements.length) * 100) : 0;
          const isOpen = openCats.has(cat.category);

          return (
            <Card key={cat.category} className="bg-zinc-900 border-white/10 overflow-hidden">
              <button onClick={() => toggleCat(cat.category)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  <CatIcon className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-white">{cat.category}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-green-400">{catStats.have} ready</span>
                      <span className="text-xs text-yellow-400">{catStats.partial} progress</span>
                      <span className="text-xs text-red-400">{catStats.gap} gaps</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40">{catPct}%</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${catPct >= 75 ? "bg-green-500" : catPct >= 50 ? "bg-yellow-500" : catPct > 0 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${catPct}%` }} />
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-1.5">
                  {cat.requirements.map((req, i) => {
                    const sm = STATUS_META[req.status];
                    const StatusIcon = sm.icon;
                    const action = GAP_ACTIONS[req.name];
                    return (
                      <div key={i} className={`flex items-start gap-2 p-3 rounded-md ${sm.bg} border ${sm.border}`}>
                        <StatusIcon className={`w-4 h-4 ${sm.color} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{req.name}</span>
                            <Badge variant="outline" className={`text-xs ${sm.color} ${sm.border}`}>{sm.label}</Badge>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{req.desc}</p>
                        </div>
                        {req.status !== "have" && action && (
                          <Link to={action.path}>
                            <Button size="sm" variant="outline" className={`shrink-0 ${sm.color} ${sm.border} bg-transparent`}>
                              {action.label} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
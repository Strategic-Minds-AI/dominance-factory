import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain, DollarSign, Database, Workflow, ImageIcon, Search, Share2,
  Server, Send, BarChart3, Bot, Plug, Lightbulb,
  CheckCircle2, AlertTriangle, XCircle, Library, Filter, ChevronDown, ChevronRight,
} from "lucide-react";
import { SYSTEM_CATALOG } from "@/lib/systemCatalog";
import SupabaseConvergence from "@/components/system/SupabaseConvergence";

const ICON_MAP = {
  Brain, DollarSign, Database, Workflow, ImageIcon, Search, Share2,
  Server, Send, BarChart3, Bot, Plug, Lightbulb,
};

const STATUS_META = {
  have:    { color: "text-green-400",  bg: "bg-green-500/5",  border: "border-green-500/30",  dot: "bg-green-500",  label: "Have",    icon: CheckCircle2 },
  partial: { color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/30", dot: "bg-yellow-500", label: "Partial",  icon: AlertTriangle },
  gap:     { color: "text-red-400",   bg: "bg-red-500/5",    border: "border-red-500/30",    dot: "bg-red-500",    label: "Gap",      icon: XCircle },
};

export default function SystemLibrary() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCats, setOpenCats] = useState(() => new Set(SYSTEM_CATALOG.map(c => c.id)));

  const filtered = useMemo(() => {
    return SYSTEM_CATALOG.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchSearch = !search ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.desc.toLowerCase().includes(search.toLowerCase()) ||
          item.capabilities.some((c) => c.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = statusFilter === "all" || item.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [search, statusFilter]);

  const allItems = SYSTEM_CATALOG.flatMap((c) => c.items);
  const stats = {
    total: allItems.length,
    have: allItems.filter((i) => i.status === "have").length,
    partial: allItems.filter((i) => i.status === "partial").length,
    gap: allItems.filter((i) => i.status === "gap").length,
  };
  const pct = stats.total > 0 ? Math.round((stats.have / stats.total) * 100) : 0;

  const toggleCat = (id) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Library className="w-4 h-4" /> Full System Library
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Capability Catalog</h1>
          <p className="text-sm text-white/50 mt-2 max-w-3xl mx-auto">
            Every system, skill, tool, capability, agent, and workflow — categorized across the AI, business, and systematic world. See exactly what you have and what you don't.
          </p>
        </div>

        {/* Supabase Convergence Dashboard */}
        <SupabaseConvergence />

        {/* Overall stats */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Platform Completion</h2>
            <span className="text-2xl font-bold text-white font-mono">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-md bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/50">Total</p>
            </div>
            <div className="text-center p-2 rounded-md bg-green-500/5 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.have}</p>
              <p className="text-xs text-white/50">Have</p>
            </div>
            <div className="text-center p-2 rounded-md bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.partial}</p>
              <p className="text-xs text-white/50">Partial</p>
            </div>
            <div className="text-center p-2 rounded-md bg-red-500/5 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{stats.gap}</p>
              <p className="text-xs text-white/50">Gaps</p>
            </div>
          </div>
        </Card>

        {/* Search & Filter */}
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search systems, capabilities, tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-zinc-900 border-white/10 text-white placeholder:text-white/30"
          />
          <div className="flex gap-1">
            {["all", "have", "partial", "gap"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "bg-blue-600 text-white" : "bg-zinc-900 border-white/10 text-white/60"}
              >
                {s === "all" ? "All" : STATUS_META[s].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Category sections */}
        {filtered.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Library;
          const catStats = {
            have: cat.items.filter((i) => i.status === "have").length,
            partial: cat.items.filter((i) => i.status === "partial").length,
            gap: cat.items.filter((i) => i.status === "gap").length,
          };
          const isOpen = openCats.has(cat.id);

          return (
            <Card key={cat.id} className="bg-zinc-900 border-white/10 overflow-hidden">
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20`}>
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-white">{cat.category}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-green-400">{catStats.have} have</span>
                      <span className="text-xs text-yellow-400">{catStats.partial} partial</span>
                      <span className="text-xs text-red-400">{catStats.gap} gaps</span>
                      <span className="text-xs text-white/40">· {cat.items.length} total</span>
                    </div>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cat.items.map((item, i) => {
                    const sm = STATUS_META[item.status];
                    const StatusIcon = sm.icon;
                    return (
                      <div key={i} className={`flex items-start gap-2 p-3 rounded-md ${sm.bg} border ${sm.border}`}>
                        <StatusIcon className={`w-4 h-4 ${sm.color} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{item.name}</span>
                            <Badge variant="outline" className={`text-xs ${sm.color} ${sm.border}`}>{sm.label}</Badge>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.capabilities.map((c, ci) => (
                              <span key={ci} className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{c}</span>
                            ))}
                          </div>
                        </div>
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
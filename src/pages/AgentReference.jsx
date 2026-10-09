import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Play, Pause, Plus, Search, Zap, Cpu, Brain, Sparkles, RefreshCw, CheckCircle2, Activity } from "lucide-react";
import { AGENT_CATALOG } from "@/lib/systemCatalog";

const TYPE_ICONS = {
  form_filler: Sparkles,
  poster: Zap,
  scraper: Search,
  headless_browser: Cpu,
};

const STATUS_COLORS = {
  idle:    { text: "text-white/40",  bg: "bg-white/5",        border: "border-white/10",    dot: "bg-white/30",  label: "Idle" },
  running: { text: "text-green-400", bg: "bg-green-500/5",   border: "border-green-500/30", dot: "bg-green-500", label: "Running" },
  paused:  { text: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/30", dot: "bg-yellow-500", label: "Paused" },
  error:   { text: "text-red-400",   bg: "bg-red-500/5",    border: "border-red-500/30",   dot: "bg-red-500",   label: "Error" },
};

export default function AgentReference() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [enabling, setEnabling] = useState(null);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Agent.filter({}, { sort: "-created_date", limit: 100 });
      setAgents(res.items || res || []);
    } catch (e) {
      // no agents yet
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const enableAgent = async (catalogAgent) => {
    setEnabling(catalogAgent.name);
    try {
      await base44.entities.Agent.create({
        name: catalogAgent.name,
        description: catalogAgent.desc,
        agent_type: catalogAgent.agent_type,
        status: "running",
        capabilities: JSON.stringify(catalogAgent.capabilities),
        config: JSON.stringify({ skills: catalogAgent.skills, category: catalogAgent.category, source: "catalog" }),
      });
      await loadAgents();
    } catch (e) {
      // ignore
    } finally {
      setEnabling(null);
    }
  };

  const toggleAgent = async (agent) => {
    const newStatus = agent.status === "running" ? "paused" : "running";
    try {
      await base44.entities.Agent.update(agent.id, { status: newStatus });
      await loadAgents();
    } catch (e) {
      // ignore
    }
  };

  // Merge catalog with existing agents
  const existingNames = new Set(agents.map((a) => a.name));
  const allAgents = [
    ...agents.map((a) => ({
      name: a.name,
      desc: a.description || "",
      agent_type: a.agent_type,
      capabilities: a.capabilities ? (typeof a.capabilities === "string" ? JSON.parse(a.capabilities) : a.capabilities) : [],
      skills: a.config ? (typeof a.config === "string" ? (JSON.parse(a.config).skills || []) : (a.config.skills || [])) : [],
      category: a.config ? (typeof a.config === "string" ? (JSON.parse(a.config).category || "Custom") : (a.config.category || "Custom")) : "Custom",
      status: a.status,
      exists: true,
      id: a.id,
    })),
    ...AGENT_CATALOG.filter((a) => !existingNames.has(a.name)).map((a) => ({ ...a, status: "idle", exists: false })),
  ];

  const filtered = allAgents.filter((a) => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase()) ||
      (a.capabilities || []).some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = activeFilter === "all" ||
      (activeFilter === "active" && a.status === "running") ||
      (activeFilter === "available" && !a.exists) ||
      (activeFilter === "paused" && a.status === "paused");
    return matchSearch && matchFilter;
  });

  const activeCount = agents.filter((a) => a.status === "running").length;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Bot className="w-4 h-4" /> Agent Reference
            </div>
            <h1 className="text-2xl font-bold text-white">Autonomous Agent Library</h1>
            <p className="text-sm text-white/50 mt-1">Every agent — name, skills, capabilities, and what they can do. Enable any agent into action.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              <p className="text-xs text-white/50">Active</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{allAgents.length}</p>
              <p className="text-xs text-white/50">Total</p>
            </div>
            <Button variant="ghost" size="sm" onClick={loadAgents} disabled={loading} className="text-white/60">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search agents by name, skill, or capability..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-zinc-900 border-white/10 text-white placeholder:text-white/30"
          />
          <div className="flex gap-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "available", label: "Available" },
              { key: "paused", label: "Paused" },
            ].map((f) => (
              <Button
                key={f.key}
                variant={activeFilter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(f.key)}
                className={activeFilter === f.key ? "bg-blue-600 text-white" : "bg-zinc-900 border-white/10 text-white/60"}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((agent, i) => {
            const TypeIcon = TYPE_ICONS[agent.agent_type] || Bot;
            const sm = STATUS_COLORS[agent.status] || STATUS_COLORS.idle;

            return (
              <Card key={i} className={`p-4 bg-zinc-900 border-white/10 ${agent.status === "running" ? "ring-1 ring-green-500/30" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                      <TypeIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs ${sm.text} ${sm.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sm.dot} mr-1`} />
                          {sm.label}
                        </Badge>
                        <span className="text-xs text-white/40">{agent.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/50 mb-2">{agent.desc}</p>

                {/* Skills */}
                {agent.skills && agent.skills.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.map((s, si) => (
                        <span key={si} className="text-[10px] text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((c, ci) => (
                      <span key={ci} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                {agent.exists ? (
                  <Button
                    size="sm"
                    variant={agent.status === "running" ? "default" : "outline"}
                    onClick={() => toggleAgent(agent)}
                    className={`w-full ${agent.status === "running" ? "bg-green-600 hover:bg-green-500 text-white" : "bg-zinc-800 border-white/10 text-white/70"}`}
                  >
                    {agent.status === "running" ? (
                      <><Pause className="w-3.5 h-3.5 mr-1.5" /> Pause Agent</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 mr-1.5" /> Enable Agent</>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => enableAgent(agent)}
                    disabled={enabling === agent.name}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {enabling === agent.name ? (
                      <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Enabling...</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5 mr-1.5" /> Enable Into Action</>
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-white/40">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No agents match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
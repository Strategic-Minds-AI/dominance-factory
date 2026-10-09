import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot, Play, Pause, Plus, Search, Zap, RefreshCw, Workflow, Database,
  Server, Cpu, Brain, Mail, Cloud, ShieldCheck, Activity, Settings, ArrowRight, CheckCircle2, AlertTriangle
} from "lucide-react";
import { AGENT_CATALOG } from "@/lib/systemCatalog";

const TYPE_ICONS = {
  entity: Database,
  backend_function: Server,
  workflow: Workflow,
  connector: Cloud,
  page: Cpu,
  component: Settings,
  integration: Zap,
  shared_module: Brain,
};

const CATEGORY_ICONS = {
  data_storage: Database,
  ai_engine: Brain,
  content_generation: Zap,
  seo_optimization: Search,
  social_media: Mail,
  media_production: Activity,
  outreach_communication: Mail,
  provisioning_deployment: Server,
  analytics_reporting: Activity,
  agent_orchestration: Bot,
  research_intelligence: Brain,
  workflow_automation: Workflow,
  external_integration: Cloud,
  ui_interface: Cpu,
  governance_security: ShieldCheck,
  infrastructure: Server,
};

const STATUS_META = {
  active:    { text: "text-green-400",  bg: "bg-green-500/5",  border: "border-green-500/30",  dot: "bg-green-500",  label: "Active" },
  deprecated:{ text: "text-red-400",    bg: "bg-red-500/5",    border: "border-red-500/30",    dot: "bg-red-500",    label: "Deprecated" },
  draft:     { text: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/30", dot: "bg-yellow-500", label: "Draft" },
  running:   { text: "text-green-400",  bg: "bg-green-500/5",  border: "border-green-500/30",  dot: "bg-green-500",  label: "Running" },
  paused:    { text: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/30", dot: "bg-yellow-500", label: "Paused" },
  idle:      { text: "text-white/40",   bg: "bg-white/5",      border: "border-white/10",     dot: "bg-white/30",   label: "Idle" },
};

export default function UnifiedLibrary() {
  const [tab, setTab] = useState("agents");
  const [inventory, setInventory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [executing, setExecuting] = useState(null);
  const [execResult, setExecResult] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, agentRes] = await Promise.all([
        base44.entities.SystemInventory.filter({}, { sort: "-last_scanned_at", limit: 200 }),
        base44.entities.Agent.filter({}, { sort: "-created_date", limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setInventory(invRes.items || invRes || []);
      setAgents(agentRes.items || agentRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const executeFunction = async (funcName) => {
    setExecuting(funcName);
    setExecResult(null);
    try {
      const result = await base44.functions.invoke(funcName, {});
      setExecResult({ name: funcName, success: true, data: result });
    } catch (e) {
      setExecResult({ name: funcName, success: false, error: e.message });
    } finally {
      setExecuting(null);
    }
  };

  const toggleAgent = async (agent) => {
    const newStatus = agent.status === "running" ? "paused" : "running";
    try {
      await base44.entities.Agent.update(agent.id, { status: newStatus });
      await loadData();
    } catch (e) {}
  };

  const enableAgent = async (catalogAgent) => {
    setExecuting(catalogAgent.name);
    try {
      await base44.entities.Agent.create({
        name: catalogAgent.name,
        description: catalogAgent.desc,
        agent_type: catalogAgent.agent_type,
        status: "running",
        capabilities: JSON.stringify(catalogAgent.capabilities),
        config: JSON.stringify({ skills: catalogAgent.skills, category: catalogAgent.category, source: "catalog" }),
      });
      await loadData();
    } catch (e) {} finally {
      setExecuting(null);
    }
  };

  // Filter inventory by type
  const tools = inventory.filter((s) => s.system_type === "backend_function");
  const workflows = inventory.filter((s) => s.system_type === "workflow");
  const entities = inventory.filter((s) => s.system_type === "entity");
  const connectors = inventory.filter((s) => s.system_type === "connector");

  // Merge catalog with existing agents
  const existingNames = new Set(agents.map((a) => a.name));
  const allAgents = [
    ...agents.map((a) => ({
      name: a.name, desc: a.description || "", agent_type: a.agent_type,
      capabilities: a.capabilities ? (typeof a.capabilities === "string" ? JSON.parse(a.capabilities) : a.capabilities) : [],
      skills: a.config ? (typeof a.config === "string" ? (JSON.parse(a.config).skills || []) : (a.config.skills || [])) : [],
      category: a.config ? (typeof a.config === "string" ? (JSON.parse(a.config).category || "Custom") : (a.config.category || "Custom")) : "Custom",
      status: a.status, exists: true, id: a.id,
    })),
    ...AGENT_CATALOG.filter((a) => !existingNames.has(a.name)).map((a) => ({ ...a, status: "idle", exists: false })),
  ];

  const filteredAgents = allAgents.filter((a) => {
    const ms = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    return ms;
  });
  const filteredTools = tools.filter((t) => !search || t.system_name.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase()));
  const filteredWorkflows = workflows.filter((w) => !search || w.system_name.toLowerCase().includes(search.toLowerCase()) || (w.description || "").toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    { key: "agents", label: "Agents", icon: Bot, count: allAgents.length },
    { key: "tools", label: "Tools & Functions", icon: Server, count: tools.length },
    { key: "workflows", label: "Workflows", icon: Workflow, count: workflows.length },
    { key: "data", label: "Data & Integrations", icon: Database, count: entities.length + connectors.length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Database className="w-4 h-4" /> Unified Library
            </div>
            <h1 className="text-2xl font-bold text-white">Agents, Tools & Workflows</h1>
            <p className="text-sm text-white/50 mt-1">Every system component in one place. Enable agents, run functions, and manage workflows — all actionable.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData} disabled={loading} className="text-white/60">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Execution result toast */}
        {execResult && (
          <Card className={`p-3 ${execResult.success ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"}`}>
            <div className="flex items-center gap-2">
              {execResult.success ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span className="text-sm text-white">{execResult.name}: {execResult.success ? "Executed successfully" : execResult.error}</span>
              <Button variant="ghost" size="sm" className="ml-auto text-white/40" onClick={() => setExecResult(null)}>×</Button>
            </div>
          </Card>
        )}

        {/* Search */}
        <Input
          placeholder="Search agents, tools, workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border-white/10 text-white placeholder:text-white/30"
        />

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t.key)}
              className={tab === t.key ? "bg-blue-600 text-white" : "bg-zinc-900 border-white/10 text-white/60"}
            >
              <t.icon className="w-3.5 h-3.5 mr-1.5" />
              {t.label}
              <span className="ml-1.5 text-xs opacity-60">{t.count}</span>
            </Button>
          ))}
        </div>

        {/* AGENTS TAB */}
        {tab === "agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAgents.map((agent, i) => {
              const sm = STATUS_META[agent.status] || STATUS_META.idle;
              return (
                <Card key={i} className={`p-4 bg-zinc-900 border-white/10 ${agent.status === "running" ? "ring-1 ring-green-500/30" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-xs ${sm.text} ${sm.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sm.dot} mr-1`} />{sm.label}
                          </Badge>
                          <span className="text-xs text-white/40">{agent.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-2">{agent.desc}</p>
                  {agent.capabilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.capabilities.slice(0, 4).map((c, ci) => (
                        <span key={ci} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  )}
                  {agent.exists ? (
                    <Button size="sm" variant={agent.status === "running" ? "default" : "outline"}
                      onClick={() => toggleAgent(agent)}
                      className={`w-full ${agent.status === "running" ? "bg-green-600 hover:bg-green-500 text-white" : "bg-zinc-800 border-white/10 text-white/70"}`}>
                      {agent.status === "running" ? <><Pause className="w-3.5 h-3.5 mr-1.5" /> Pause</> : <><Play className="w-3.5 h-3.5 mr-1.5" /> Enable</>}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => enableAgent(agent)} disabled={executing === agent.name}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      {executing === agent.name ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Enabling...</> : <><Plus className="w-3.5 h-3.5 mr-1.5" /> Enable Into Action</>}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* TOOLS TAB */}
        {tab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTools.map((tool, i) => {
              const Icon = CATEGORY_ICONS[tool.category] || Server;
              const sm = STATUS_META[tool.status] || STATUS_META.active;
              const funcName = tool.registry_key?.replace(/^backend_function_/, "") || tool.system_name;
              return (
                <Card key={i} className="p-4 bg-zinc-900 border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{tool.system_name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-xs ${sm.text} ${sm.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sm.dot} mr-1`} />{sm.label}
                          </Badge>
                          <span className="text-xs text-white/40">{tool.subcategory || tool.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-3">{tool.description || "No description available"}</p>
                  <Button size="sm" onClick={() => executeFunction(funcName)} disabled={executing === funcName}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                    {executing === funcName ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Running...</> : <><Zap className="w-3.5 h-3.5 mr-1.5" /> Run Function</>}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {tab === "workflows" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredWorkflows.map((wf, i) => {
              const Icon = CATEGORY_ICONS[wf.category] || Workflow;
              const sm = STATUS_META[wf.status] || STATUS_META.active;
              return (
                <Card key={i} className="p-4 bg-zinc-900 border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 border border-orange-500/20">
                        <Icon className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{wf.system_name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-xs ${sm.text} ${sm.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sm.dot} mr-1`} />{sm.label}
                          </Badge>
                          <span className="text-xs text-white/40">{wf.subcategory || "Automation"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-3">{wf.description || "Automated workflow"}</p>
                  <Link to="/backend/reflection">
                    <Button size="sm" variant="outline" className="w-full bg-zinc-800 border-white/10 text-white/70">
                      <Activity className="w-3.5 h-3.5 mr-1.5" /> View Status <ArrowRight className="w-3 h-3 ml-auto" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}

        {/* DATA & INTEGRATIONS TAB */}
        {tab === "data" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Data Entities ({entities.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {entities.map((e, i) => {
                  const Icon = CATEGORY_ICONS[e.category] || Database;
                  return (
                    <Card key={i} className="p-3 bg-zinc-900 border-white/10">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-white">{e.system_name}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{e.subcategory || e.category}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Connected Integrations ({connectors.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {connectors.map((c, i) => {
                  const Icon = CATEGORY_ICONS[c.category] || Cloud;
                  return (
                    <Card key={i} className="p-3 bg-zinc-900 border-white/10">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{c.system_name}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">{c.subcategory || "External integration"}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-white/40">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-30" />
            <p className="text-sm">Loading system inventory...</p>
          </div>
        )}
      </div>
    </div>
  );
}
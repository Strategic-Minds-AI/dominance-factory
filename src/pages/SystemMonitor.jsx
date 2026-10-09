import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Bot, Workflow, Plug, AlertTriangle, Database, RefreshCw, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

const STATUS_COLORS = {
  idle: "bg-gray-500",
  running: "bg-green-500",
  paused: "bg-yellow-500",
  error: "bg-red-500",
  active: "bg-green-500",
  connected: "bg-green-500",
  disconnected: "bg-red-500",
  open: "bg-red-500",
  resolved: "bg-green-500",
};

function HealthGauge({ score }) {
  const color = score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const stopColor = score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke={stopColor} strokeWidth="6"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${color}`}>{score}</div>
      </div>
      <div>
        <p className="text-sm text-gray-400">System Health Score</p>
        <p className={`text-lg font-semibold ${color}`}>
          {score >= 80 ? "Healthy" : score >= 50 ? "Degraded" : "Critical"}
        </p>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[status] || "bg-gray-500"}`} />
  );
}

export default function SystemMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMonitor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("systemMonitor", {});
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load monitor data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitor();
    const interval = setInterval(fetchMonitor, 30000);
    return () => clearInterval(interval);
  }, [fetchMonitor]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#3b82f6] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchMonitor} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  const agents = data?.agents || [];
  const workflows = data?.workflows || [];
  const services = data?.services || [];
  const issues = data?.issues || {};
  const capacity = data?.capacity || {};
  const healthScore = data?.health_score || 0;

  const connectedServices = services.filter((s) => s.connected).length;
  const totalServices = services.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-7 h-7 text-[#3b82f6]" />
              System Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-1">Real-time status, capacity, and health of every system component</p>
          </div>
          <Button onClick={fetchMonitor} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Top Row: Health + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <HealthGauge score={healthScore} />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Plug className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-sm text-gray-400">Connected Services</span>
              </div>
              <p className="text-2xl font-bold">{connectedServices}<span className="text-gray-500 text-base">/{totalServices}</span></p>
              <p className="text-xs text-gray-500 mt-1">{data?.service_health?.pct ?? 0}% operational</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-sm text-gray-400">Agents</span>
              </div>
              <p className="text-2xl font-bold">{agents.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {agents.filter((a) => a.status === "running").length} running · {agents.filter((a) => a.status === "error").length} errors
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-sm text-gray-400">Open Issues</span>
              </div>
              <p className="text-2xl font-bold">{issues.open || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {issues.critical || 0} critical · {issues.auto_fixable || 0} auto-fixable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="w-5 h-5 text-[#3b82f6]" />
              Agents ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <p className="text-sm text-gray-500">No agents registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm truncate">{agent.name}</span>
                      <Badge variant={agent.status === "error" ? "destructive" : "secondary"} className="text-xs">
                        <StatusDot status={agent.status} /> {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{agent.agent_type || "general"}</p>
                    {agent.capabilities && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{agent.capabilities}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Agent Task Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-lg font-bold">{data?.agent_task_stats?.pending || 0}</p>
                <p className="text-xs text-gray-500">Pending Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{data?.agent_task_stats?.running || 0}</p>
                <p className="text-xs text-gray-500">Running</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">{data?.agent_task_stats?.completed || 0}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{data?.agent_task_stats?.error || 0}</p>
                <p className="text-xs text-gray-500">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflows Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="w-5 h-5 text-[#3b82f6]" />
              Workflows ({workflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workflows.map((wf) => (
                <div key={wf.name} className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{wf.name}</p>
                    <p className="text-xs text-gray-500">{wf.type}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-400" /> {wf.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connected Services Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="w-5 h-5 text-[#3b82f6]" />
              Connected Services ({connectedServices}/{totalServices})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map((svc) => (
                <div key={svc.name} className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{svc.name}</p>
                    <p className="text-xs text-gray-500">{svc.type}</p>
                  </div>
                  {svc.connected ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entity Capacity Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-5 h-5 text-[#3b82f6]" />
              Entity Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(capacity).map(([entity, count]) => (
                <div key={entity} className="bg-white/5 rounded-lg p-3 border border-white/5 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{entity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Auto-refreshes every 30s
          </span>
        </div>
      </div>
    </div>
  );
}
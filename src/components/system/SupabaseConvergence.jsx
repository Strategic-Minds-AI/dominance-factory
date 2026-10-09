import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Server, Table2, KeyRound } from "lucide-react";

const STATUS_COLORS = {
  healthy: { bg: "bg-green-500/5", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-500", label: "Healthy" },
  warning: { bg: "bg-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-500", label: "Warning" },
  error:   { bg: "bg-red-500/5",    border: "border-red-500/30",    text: "text-red-400",    dot: "bg-red-500",    label: "Error" },
};

function scoreColor(score) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

export default function SupabaseConvergence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("supabaseConvergence", {});
      setData(res.data);
    } catch (e) {
      setError(e.message || "Failed to load convergence data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const projects = data?.projects || [];
  const avgScore = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + (p.convergenceScore || 0), 0) / projects.length)
    : 0;

  return (
    <Card className="p-5 bg-zinc-900 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Supabase Convergence Dashboard</h2>
          <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">{projects.length} Projects</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-white/60">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall convergence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/50">Overall Convergence</span>
          <span className="text-sm font-bold text-white font-mono">{avgScore}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${scoreColor(avgScore)}`} style={{ width: `${avgScore}%` }} />
        </div>
      </div>

      {/* Project cards */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((p) => {
            const isHealthy = p.status === "ACTIVE_HEALTHY";
            const hasSchema = p.tableCount > 0;
            const hasSecret = !!p.secretSlot;
            const hasData = p.tableCount >= 5;
            const sc = isHealthy ? STATUS_COLORS.healthy : STATUS_COLORS.error;

            return (
              <div key={p.ref} className={`rounded-lg border ${sc.bg} ${sc.border} p-3`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                    </div>
                    <code className="text-xs text-white/40 font-mono">{p.ref}</code>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">{p.convergenceScore}%</span>
                </div>

                {/* Mini progress bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${scoreColor(p.convergenceScore)}`} style={{ width: `${p.convergenceScore}%` }} />
                </div>

                {/* Status indicators */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 ${isHealthy ? "text-green-400" : "text-red-400"}`}>
                    {isHealthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{p.status}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSchema ? "text-green-400" : "text-yellow-400"}`}>
                    {hasSchema ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{p.tableCount} tables</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSecret ? "text-green-400" : "text-red-400"}`}>
                    {hasSecret ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{hasSecret ? `Secret ${p.secretSlot?.replace("SUPABASE_", "").replace("_URL", "")}` : "No secret"}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasData ? "text-green-400" : "text-yellow-400"}`}>
                    {hasData ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{hasData ? "Data present" : "Needs data"}</span>
                  </div>
                </div>

                {/* Tables preview */}
                {p.tables && p.tables.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="flex flex-wrap gap-1">
                      {p.tables.slice(0, 8).map((t) => (
                        <code key={t} className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded font-mono">{t}</code>
                      ))}
                      {p.tables.length > 8 && <span className="text-[10px] text-white/30">+{p.tables.length - 8} more</span>}
                    </div>
                  </div>
                )}
                {p.schemaError && (
                  <div className="mt-2 text-[10px] text-red-400/60">Schema: {p.schemaError}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Secret configuration status */}
      {data?.configuredSecrets && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs font-medium text-white/50">Secret Configuration</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.configuredSecrets).map(([key, configured]) => (
              <Badge key={key} variant="outline" className={`text-xs ${configured ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}>
                {configured ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                {key.replace("SUPABASE_", "").replace("_URL", "")}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
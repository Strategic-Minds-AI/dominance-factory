import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Wrench, RefreshCw, AlertCircle, CheckCircle, Shield, Zap, Activity, Bug, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

const TYPE_ICONS = {
  gap: AlertCircle,
  bug: Bug,
  security: Shield,
  empty_entity: Package,
  missing_connector: Zap,
  missing_secret: Shield,
  missing_feature: Activity,
  configuration: Wrench,
};

export default function SystemReflection() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ open: 0, resolved: 0, critical_open: 0, high_open: 0, auto_fixable: 0 });
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [filter, setFilter] = useState(null);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("systemReflection", {
        action: "get_issues",
        filter: filter ? { status: filter } : {},
        limit: 100,
      });
      setIssues(res.data?.issues || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("systemReflection", { action: "stats" });
      setStats(res.data || { open: 0, resolved: 0, critical_open: 0, high_open: 0, auto_fixable: 0 });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadIssues(); loadStats(); }, [loadIssues, loadStats]);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await base44.functions.invoke("systemReflection", { action: "scan" });
      setScanResult(res.data);
      loadIssues();
      loadStats();
    } catch (err) {
      setScanResult({ error: err.message });
    }
    setScanning(false);
  };

  const handleAutoFixAll = async () => {
    setFixing(true);
    try {
      await base44.functions.invoke("systemReflection", { action: "auto_fix_all" });
      loadIssues();
      loadStats();
    } catch (err) {
      console.error(err);
    }
    setFixing(false);
  };

  const handleFixOne = async (issueId) => {
    try {
      await base44.functions.invoke("systemReflection", { action: "fix_issue", issue_id: issueId });
      loadIssues();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Scan className="w-7 h-7 text-blue-500" />
            System Reflection & Self-Repair
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Automated system scanning that detects gaps, missing integrations, empty entities, and security issues. Auto-fixes what it can and flags what needs manual attention.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <p className="text-xs text-gray-500">Open Issues</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.open || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
              <p className="text-2xl font-bold text-white">{stats.resolved || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-red-400" />
                <p className="text-xs text-gray-500">Critical</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.critical_open || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <p className="text-xs text-gray-500">High Priority</p>
              </div>
              <p className="text-2xl font-bold text-orange-400">{stats.high_open || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-500">Auto-Fixable</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.auto_fixable || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={handleScan} disabled={scanning} className="bg-blue-600 hover:bg-blue-700">
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {scanning ? "Scanning..." : "Run System Scan"}
          </Button>
          <Button
            onClick={handleAutoFixAll}
            disabled={fixing || !stats.auto_fixable}
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            {fixing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
            {fixing ? "Fixing..." : `Auto-Fix All (${stats.auto_fixable || 0})`}
          </Button>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <Card className="bg-[#111] border-white/10 mb-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold">Scan Complete</h2>
              </div>
              {scanResult.error ? (
                <p className="text-sm text-red-400">{scanResult.error}</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                      <p className="text-2xl font-bold text-white">{scanResult.total_entities_scanned}</p>
                      <p className="text-xs text-gray-500">Entities Scanned</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                      <p className="text-2xl font-bold text-orange-400">{scanResult.issues_found}</p>
                      <p className="text-xs text-gray-500">Issues Found</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                      <p className="text-2xl font-bold text-green-400">{Object.values(scanResult.entity_counts || {}).filter((c) => c > 0).length}</p>
                      <p className="text-xs text-gray-500">Populated Entities</p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                      <p className="text-2xl font-bold text-red-400">{Object.values(scanResult.entity_counts || {}).filter((c) => c === 0).length}</p>
                      <p className="text-xs text-gray-500">Empty Entities</p>
                    </div>
                  </div>
                  {scanResult.ai_summary && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-gray-300">{scanResult.ai_summary}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { label: "All Open", value: "open" },
            { label: "Resolved", value: "resolved" },
            { label: "Auto-Fixing", value: "auto_fixing" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(filter === tab.value ? null : tab.value)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                filter === tab.value ? "bg-blue-600 text-white border-blue-600" : "bg-[#111] text-gray-400 border-white/10 hover:text-white")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issue List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
            Loading issues...
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
            <p>No issues found. Run a system scan to detect gaps and issues.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => {
              const Icon = TYPE_ICONS[issue.issue_type] || AlertCircle;
              return (
                <Card key={issue.id} className="bg-[#111] border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-white">{issue.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className={cn("text-[10px]", SEVERITY_COLORS[issue.severity] || "")}>{issue.severity}</Badge>
                            <Badge variant="outline" className="text-[10px] text-gray-400 border-white/10">{issue.issue_type.replace(/_/g, ' ')}</Badge>
                            {issue.auto_fixable && issue.status === 'open' && (
                              <Button
                                onClick={() => handleFixOne(issue.id)}
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] border-green-500/30 text-green-400 hover:bg-green-500/10 px-2"
                              >
                                <Wrench className="w-3 h-3" /> Fix
                              </Button>
                            )}
                          </div>
                        </div>
                        {issue.description && <p className="text-xs text-gray-500 mb-1">{issue.description}</p>}
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          {issue.component && <span>Component: {issue.component}</span>}
                          {issue.detected_at && <span>Detected: {new Date(issue.detected_at).toLocaleString()}</span>}
                          {issue.status === 'resolved' && <span className="text-green-500">Resolved</span>}
                          {issue.fix_attempts > 0 && <span>Fix attempts: {issue.fix_attempts}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
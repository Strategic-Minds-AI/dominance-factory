import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EntityBrowser from "@/components/dominance/EntityBrowser";
import {
  Rocket, Globe, Package, FileText, Image as ImageIcon, Server,
  Send, Zap, Loader2, RefreshCw, Play, Link2, AlertTriangle,
  Brain, Bot, Share2, Palette,
} from "lucide-react";
import { Link } from "react-router-dom";

const FUNCTIONS = [
  "chatEdit", "dailyFollowUp", "executeAgentTask", "generateMedia",
  "generatePage", "generateSocialContent", "ingestPack", "launchCampaign",
  "processGenerationQueue", "provisionApprovedPack", "provisionSystem", "sendOutreach",
];

const CONNECTIONS = [
  { name: "Google Calendar", type: "googlecalendar", status: "connected" },
  { name: "Gmail", type: "gmail", status: "connected" },
  { name: "Google Drive", type: "googledrive", status: "connected" },
  { name: "Google Docs", type: "googledocs", status: "connected" },
  { name: "Google Sheets", type: "googlesheets", status: "connected" },
  { name: "Google Tasks", type: "googletasks", status: "connected" },
  { name: "GitHub", type: "github", status: "connected" },
  { name: "Supabase", type: "supabase", status: "connected" },
  { name: "HubSpot", type: "hubspot", status: "connected" },
];

const QUICK_ACTIONS = [
  { label: "Launch Campaign", path: "/launch", icon: Rocket, color: "text-blue-400" },
  { label: "Visual Editor", path: "/editor", icon: Palette, color: "text-purple-400" },
  { label: "Pack Review", path: "/packs", icon: Package, color: "text-amber-400" },
  { label: "Website Library", path: "/websites", icon: Globe, color: "text-green-400" },
  { label: "Social Media", path: "/social", icon: Share2, color: "text-pink-400" },
  { label: "Media Studio", path: "/media", icon: ImageIcon, color: "text-indigo-400" },
  { label: "Super Agents", path: "/agents", icon: Bot, color: "text-cyan-400" },
  { label: "Provisioning", path: "/provisioning", icon: Server, color: "text-orange-400" },
  { label: "Outreach", path: "/outreach", icon: Send, color: "text-red-400" },
  { label: "Intelligence Hub", path: "/intelligence", icon: Brain, color: "text-teal-400" },
];

export default function DominanceShell() {
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [funcName, setFuncName] = useState("processGenerationQueue");
  const [funcArgs, setFuncArgs] = useState('{\n  "batch_size": 10\n}');
  const [funcResult, setFuncResult] = useState(null);
  const [funcRunning, setFuncRunning] = useState(false);
  const [funcError, setFuncError] = useState("");

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const entities = ["Website", "LaunchCampaign", "GeneratedPage", "Pack", "SocialPost", "MediaAsset", "ProvisioningJob", "OutreachCampaign"];
    try {
      const counts = await Promise.all(
        entities.map((e) => base44.entities[e].count({}).catch(() => 0))
      );
      const obj = {};
      entities.forEach((e, i) => (obj[e] = counts[i]));
      setStats(obj);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRunFunction = async () => {
    setFuncRunning(true);
    setFuncError("");
    setFuncResult(null);
    try {
      const args = funcArgs.trim() ? JSON.parse(funcArgs) : {};
      const res = await base44.functions.invoke(funcName, args);
      setFuncResult(res);
    } catch (e) {
      setFuncError(e.message || String(e));
    } finally {
      setFuncRunning(false);
    }
  };

  const statCards = [
    { key: "Website", label: "Websites", icon: Globe, color: "text-green-400" },
    { key: "LaunchCampaign", label: "Campaigns", icon: Rocket, color: "text-blue-400" },
    { key: "GeneratedPage", label: "Pages", icon: FileText, color: "text-purple-400" },
    { key: "Pack", label: "Packs", icon: Package, color: "text-amber-400" },
    { key: "SocialPost", label: "Social Posts", icon: Share2, color: "text-pink-400" },
    { key: "MediaAsset", label: "Media Assets", icon: ImageIcon, color: "text-indigo-400" },
    { key: "ProvisioningJob", label: "Provisioning Jobs", icon: Server, color: "text-orange-400" },
    { key: "OutreachCampaign", label: "Outreach", icon: Send, color: "text-red-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            Dominance Shell
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Full system command center — read, write, execute across all entities, functions, and connections</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadStats} disabled={loadingStats}>
          {loadingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Stats
        </Button>
      </div>

      {/* Credits Warning */}
      <Card className="p-4 border-amber-500/50 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600">Integration Credits Exhausted</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scheduled workflows, AI generation (images/video/social), and Core integrations are blocked until credits reset on Oct 12, 2026.
              You can still launch campaigns and manually process the queue. Upgrade your plan for unlimited autonomous processing.
            </p>
          </div>
        </div>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {loadingStats ? "..." : (stats[s.key] || 0).toLocaleString()}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="command" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="command">Command</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.path} to={a.path}>
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <Icon className={`w-5 h-5 ${a.color} mb-2`} />
                      <p className="text-sm font-medium">{a.label}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Entity Browser Tab */}
        <TabsContent value="entities">
          <Card className="p-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Entity Browser — Full CRUD</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityBrowser />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Function Runner Tab */}
        <TabsContent value="functions">
          <Card className="p-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Function Runner — Execute Any Backend Function</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Function</Label>
                  <Select value={funcName} onValueChange={setFuncName}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FUNCTIONS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Arguments (JSON)</Label>
                <Textarea
                  value={funcArgs}
                  onChange={(e) => setFuncArgs(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[150px]"
                />
              </div>
              <Button onClick={handleRunFunction} disabled={funcRunning}>
                {funcRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Function
              </Button>
              {funcError && (
                <p className="text-sm text-red-600">{funcError}</p>
              )}
              {funcResult && (
                <div>
                  <Label>Result</Label>
                  <pre className="mt-1 text-xs bg-muted rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(funcResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card className="p-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CONNECTIONS.map((c) => (
                  <div key={c.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-500/50">
                      Connected
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Social media platforms (Facebook, Instagram, Twitter/X, TikTok) are not available as native connectors.
                To post autonomously, add their API keys as secrets and I can build backend functions for direct posting.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
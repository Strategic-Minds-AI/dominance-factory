import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Share2, Rocket, Bot, Package, Activity, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Server, Cloud } from "lucide-react";

export default function Dashboard() {
  const [counts, setCounts] = useState({ websites: 0, social: 0, campaigns: 0, agents: 0, packs: 0 });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [websites, social, campaigns, agents, packs, reportPage] = await Promise.all([
          base44.entities.Website.count(),
          base44.entities.SocialPost.count(),
          base44.entities.LaunchCampaign.count(),
          base44.entities.Agent.count(),
          base44.entities.Pack.count(),
          base44.entities.DailyReport.filter({ report_type: "morning_summary" }, { sort: "-report_date", limit: 1 }).catch(() => ({ items: [] })),
        ]);
        setCounts({ websites, social, campaigns, agents, packs });
        const reportItems = reportPage.items || reportPage || [];
        if (reportItems.length > 0) setReport(reportItems[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Websites", value: counts.websites, icon: Globe, path: "/websites", color: "text-blue-600" },
    { label: "Social Posts", value: counts.social, icon: Share2, path: "/backend/social", color: "text-pink-600" },
    { label: "Launch Campaigns", value: counts.campaigns, icon: Rocket, path: "/launch", color: "text-orange-600" },
    { label: "Super Agents", value: counts.agents, icon: Bot, path: "/backend/agents", color: "text-purple-600" },
    { label: "Packs Pending", value: counts.packs, icon: Package, path: "/packs", color: "text-teal-600" },
  ];

  const healthScore = report?.health_score || 0;
  const healthColor = healthScore >= 80 ? "text-green-500" : healthScore >= 50 ? "text-yellow-500" : "text-red-500";
  const growthMetrics = report?.growth_metrics ? (typeof report.growth_metrics === "string" ? JSON.parse(report.growth_metrics) : report.growth_metrics) : {};
  const issuesSummary = report?.issues_summary ? (typeof report.issues_summary === "string" ? JSON.parse(report.issues_summary) : report.issues_summary) : {};
  const connectorsStatus = report?.connectors_status ? (typeof report.connectors_status === "string" ? JSON.parse(report.connectors_status) : report.connectors_status) : {};
  const connectedCount = Object.values(connectorsStatus).filter(Boolean).length;
  const totalConnectors = Object.keys(connectorsStatus).length || 8;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Programmatic website factory and content automation</p>

      {/* Morning Briefing */}
      {report && (
        <Card className="mb-6 bg-gradient-to-br from-zinc-900 to-zinc-800 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-white">Morning Briefing</h2>
                <Badge variant="outline" className="text-white/40 border-white/10 ml-2">
                  {report.report_date}
                </Badge>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${healthColor}`}>{healthScore}</p>
                <p className="text-xs text-white/40">Health Score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/50">Connectors</span>
                </div>
                <p className="text-lg font-bold text-white">{connectedCount}/{totalConnectors}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white/50">Open Issues</span>
                </div>
                <p className="text-lg font-bold text-white">{issuesSummary.openIssues || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/50">Total Records</span>
                </div>
                <p className="text-lg font-bold text-white">{growthMetrics.totalRecords || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/50">Inventory</span>
                </div>
                <p className="text-lg font-bold text-white">{growthMetrics.inventory || 0}</p>
              </div>
            </div>

            {report.summary_text && (
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono">{report.summary_text}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!report && !loading && (
        <Card className="mb-6 bg-zinc-900 border-white/10">
          <CardContent className="pt-6 text-center">
            <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">No morning briefing yet. The first automated summary will appear here after the daily cron runs.</p>
            <Link to="/backend/system-monitor" className="text-xs text-blue-400 hover:underline mt-2 inline-block">View System Monitor →</Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link to={card.path} key={card.label}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{loading ? "—" : card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/unified-library">
          <Card className="hover:shadow-md transition-shadow p-4">
            <Server className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-sm font-medium">Unified Library</p>
            <p className="text-xs text-muted-foreground">Agents, tools & workflows</p>
          </Card>
        </Link>
        <Link to="/backend/dashboard">
          <Card className="hover:shadow-md transition-shadow p-4">
            <Cloud className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-sm font-medium">Backend Operations</p>
            <p className="text-xs text-muted-foreground">Phase 4-5 & system tools</p>
          </Card>
        </Link>
        <Link to="/backend/system-monitor">
          <Card className="hover:shadow-md transition-shadow p-4">
            <Activity className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-sm font-medium">System Monitor</p>
            <p className="text-xs text-muted-foreground">Real-time health</p>
          </Card>
        </Link>
        <Link to="/backend/google-workspace">
          <Card className="hover:shadow-md transition-shadow p-4">
            <ShieldCheck className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-sm font-medium">Google Backup</p>
            <p className="text-xs text-muted-foreground">Drive, Docs & Sheets</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
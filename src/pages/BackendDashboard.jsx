import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, Workflow, Database, Cloud, Mail, ShieldCheck, Server, HeartPulse, Zap, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const QUICK_LINKS = [
  { label: "Social Media Studio", path: "/backend/social-automation", icon: Mail, color: "text-pink-400" },
  { label: "Image & Video Factory", path: "/backend/media", icon: Zap, color: "text-purple-400" },
  { label: "Super Agent Command", path: "/backend/agents", icon: Bot, color: "text-blue-400" },
  { label: "Analytics", path: "/backend/analytics", icon: Activity, color: "text-green-400" },
  { label: "System Health", path: "/backend/dominance", icon: HeartPulse, color: "text-red-400" },
  { label: "Domain Provisioning", path: "/backend/provisioning", icon: Server, color: "text-orange-400" },
  { label: "System Monitor", path: "/backend/system-monitor", icon: Activity, color: "text-cyan-400" },
  { label: "Unified Library", path: "/backend/unified-library", icon: Database, color: "text-yellow-400" },
  { label: "Google Workspace", path: "/backend/google-workspace", icon: Cloud, color: "text-blue-300" },
  { label: "Self-Reflection", path: "/backend/reflection", icon: ShieldCheck, color: "text-green-300" },
];

export default function BackendDashboard() {
  const [stats, setStats] = useState({ agents: 0, issues: 0, openIssues: 0, inventory: 0, workflows: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agents, issues, inventory] = await Promise.all([
          base44.entities.Agent.count(),
          base44.entities.SystemIssue.count(),
          base44.entities.SystemInventory.count(),
        ]);
        setStats({ agents, issues, openIssues: 0, inventory, workflows: 5 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <Server className="w-4 h-4" /> Backend Operations
          </div>
          <h1 className="text-2xl font-bold text-white">Backend Command Center</h1>
          <p className="text-sm text-white/50 mt-1">All operational systems, Phase 4-5, and infrastructure management in one place.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <Badge variant="outline" className="text-white/40 border-white/10">Active</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{loading ? "—" : stats.agents}</p>
              <p className="text-xs text-white/50 mt-1">Super Agents</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-green-400" />
                <Badge variant="outline" className="text-white/40 border-white/10">Cataloged</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{loading ? "—" : stats.inventory}</p>
              <p className="text-xs text-white/50 mt-1">System Inventory</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Workflow className="w-5 h-5 text-purple-400" />
                <Badge variant="outline" className="text-white/40 border-white/10">Automated</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{loading ? "—" : stats.workflows}</p>
              <p className="text-xs text-white/50 mt-1">Active Workflows</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className="w-5 h-5 text-yellow-400" />
                <Badge variant="outline" className="text-white/40 border-white/10">Tracked</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{loading ? "—" : stats.issues}</p>
              <p className="text-xs text-white/50 mt-1">System Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link key={link.path} to={link.path}>
                <Card className="bg-zinc-900 border-white/10 hover:border-white/20 hover:bg-zinc-800 transition-all p-4">
                  <link.icon className={`w-6 h-6 ${link.color} mb-2`} />
                  <p className="text-sm font-medium text-white">{link.label}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-white/30">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Automated Tasks */}
        <Card className="bg-zinc-900 border-white/10 p-5">
          <h2 className="text-sm font-bold text-white mb-3">Automated Cron Tasks (Vercel)</h2>
          <div className="space-y-2">
            {[
              { name: "Health Check", schedule: "Every hour", icon: HeartPulse, status: "active" },
              { name: "System Reflection", schedule: "Every 6 hours", icon: ShieldCheck, status: "active" },
              { name: "Queue Process", schedule: "Every 30 min", icon: Workflow, status: "active" },
              { name: "Asset Categorize", schedule: "Every 12 hours", icon: Database, status: "active" },
              { name: "Google Backup", schedule: "Daily 3 AM", icon: Cloud, status: "active" },
              { name: "Morning Summary", schedule: "Daily 8 AM", icon: Activity, status: "active" },
            ].map((task) => (
              <div key={task.name} className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <task.icon className="w-4 h-4 text-white/60" />
                  <div>
                    <p className="text-sm font-medium text-white">{task.name}</p>
                    <p className="text-xs text-white/40">{task.schedule}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-400 border border-green-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" /> Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
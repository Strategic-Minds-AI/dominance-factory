import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Eye, MousePointerClick, Users, Globe, Share2, FlaskConical, Bot, Zap, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Analytics() {
  const [stats, setStats] = useState({ websites: 0, socialPosts: 0, campaigns: 0, agents: 0, abTests: 0, nearMe: 0, packs: 0, provisioning: 0 });
  const [abTests, setAbTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [websites, socialPosts, campaigns, agents, abTestsRes, nearMe, packs, provisioning] = await Promise.all([
          base44.entities.Website.count().catch(() => 0),
          base44.entities.SocialPost.count().catch(() => 0),
          base44.entities.LaunchCampaign.count().catch(() => 0),
          base44.entities.Agent.count().catch(() => 0),
          base44.entities.ABTest.filter({}, { sort: "-created_date", limit: 10 }).catch(() => ({ items: [] })),
          base44.entities.NearMeCandidate.count().catch(() => 0),
          base44.entities.Pack.count().catch(() => 0),
          base44.entities.ProvisioningJob.count().catch(() => 0),
        ]);
        setStats({ websites, socialPosts, campaigns, agents, abTests: abTestsRes.items?.length || 0, nearMe, packs, provisioning });
        setAbTests(abTestsRes.items || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: "Websites", value: stats.websites, icon: Globe, color: "text-blue-400" },
    { label: "Social Posts", value: stats.socialPosts, icon: Share2, color: "text-purple-400" },
    { label: "Launch Campaigns", value: stats.campaigns, icon: Zap, color: "text-yellow-400" },
    { label: "NearMe Candidates", value: stats.nearMe, icon: TrendingUp, color: "text-green-400" },
    { label: "A/B Tests", value: stats.abTests, icon: FlaskConical, color: "text-cyan-400" },
    { label: "Super Agents", value: stats.agents, icon: Bot, color: "text-pink-400" },
    { label: "Packs", value: stats.packs, icon: Eye, color: "text-orange-400" },
    { label: "Provisioning Jobs", value: stats.provisioning, icon: MousePointerClick, color: "text-red-400" },
  ];

  // A/B test chart data
  const abChartData = abTests.slice(0, 6).map((t) => ({
    name: t.name?.slice(0, 15) || "Test",
    aRate: t.variant_a_visitors > 0 ? (t.variant_a_conversions / t.variant_a_visitors * 100) : 0,
    bRate: t.variant_b_visitors > 0 ? (t.variant_b_conversions / t.variant_b_visitors * 100) : 0,
  }));

  // Distribution data
  const distributionData = [
    { name: "Websites", value: stats.websites },
    { name: "Social", value: stats.socialPosts },
    { name: "NearMe", value: stats.nearMe },
    { name: "Packs", value: stats.packs },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <BarChart3 className="w-4 h-4" /> Analytics Dashboard
          </div>
          <h1 className="text-2xl font-bold text-white">Full System Analytics</h1>
          <p className="text-sm text-white/50 mt-2">Complete visibility into websites, social media, A/B tests, agents, and programmatic performance.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Loading analytics...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-3">
              {statCards.map((card, i) => (
                <Card key={i} className="p-4 bg-zinc-900 border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50">{card.label}</p>
                      <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
                    </div>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* A/B Test Results */}
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-cyan-400" /> A/B Test Conversion Rates</h3>
                {abChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={abChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#ffffff60" fontSize={10} />
                      <YAxis stroke="#ffffff60" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: "8px" }} />
                      <Bar dataKey="aRate" fill="#3b82f6" name="Variant A %" />
                      <Bar dataKey="bRate" fill="#10b981" name="Variant B %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-white/30 text-sm">No A/B test data yet</div>
                )}
              </Card>

              {/* Distribution */}
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Content Distribution</h3>
                {distributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={distributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {distributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-white/30 text-sm">No data yet</div>
                )}
              </Card>
            </div>

            {/* Active A/B Tests */}
            {abTests.length > 0 && (
              <Card className="p-5 bg-zinc-900 border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Active Experiments</h3>
                <div className="space-y-2">
                  {abTests.map((test) => {
                    const aRate = test.variant_a_visitors > 0 ? (test.variant_a_conversions / test.variant_a_visitors * 100).toFixed(1) : "0.0";
                    const bRate = test.variant_b_visitors > 0 ? (test.variant_b_conversions / test.variant_b_visitors * 100).toFixed(1) : "0.0";
                    return (
                      <div key={test.id} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                        <div><p className="text-sm text-white">{test.name}</p><p className="text-xs text-white/50">{test.test_type} • {test.status}</p></div>
                        <div className="flex items-center gap-4">
                          <div className="text-right"><p className="text-xs text-white/40">A: {aRate}%</p><p className="text-xs text-white/40">B: {bRate}%</p></div>
                          <Badge className={`text-xs ${test.status === "running" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-white/10 text-white/50 border-white/20"}`}>{test.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* System Health */}
            <Card className="p-5 bg-zinc-900 border-white/10">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> System Health</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"><p className="text-xs text-green-400 uppercase tracking-wider">Vercel AI Gateway</p><p className="text-sm text-white mt-1">Operational — All AI calls routed externally</p></div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"><p className="text-xs text-green-400 uppercase tracking-wider">Backend Functions</p><p className="text-sm text-white mt-1">16 functions deployed</p></div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"><p className="text-xs text-yellow-400 uppercase tracking-wider">Base44 Credits</p><p className="text-sm text-white mt-1">Exhausted — resets Oct 12 (Vercel Gateway active)</p></div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
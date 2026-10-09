import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, TrendingUp, DollarSign, AlertTriangle, CheckCircle2, Globe } from "lucide-react";

const SCALES = [10, 50, 100, 200, 300, 400, 500, 1000, 2000];

export default function ScalingSimulator({ industry, url, strategy }) {
  const [simulations, setSimulations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "simulate_programmatic_scaling",
        industry,
        url,
        base_strategy: strategy ? "NearMe + programmatic city/service pages" : undefined,
      });
      setSimulations(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const riskColor = (risk) => {
    if (risk === "low") return "text-green-400";
    if (risk === "medium") return "text-yellow-400";
    return "text-red-400";
  };

  const googleColor = (action) => {
    if (action === "reward") return "text-green-400";
    if (action === "flag") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="p-6 bg-zinc-900 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" /> Programmatic Scaling Simulator
        </h3>
        <Button onClick={run} disabled={loading || !industry} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
          {loading ? "Simulating..." : "Run Simulation"}
        </Button>
      </div>

      <p className="text-xs text-white/50 mb-4">
        Simulates what happens when you scale from 10 to 2,000 programmatic websites — all built to Google's exact recommendations. Shows traffic, revenue, penalty risk, and Google's response at each scale.
      </p>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-md p-2 text-xs text-red-400 mb-3">{error}</div>}

      {simulations?.simulations?.length > 0 && (
        <div className="space-y-4">
          {/* Sweet spot + danger zone */}
          <div className="grid grid-cols-2 gap-3">
            {simulations.sweet_spot && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sweet Spot</p>
                <p className="text-lg font-bold text-white">{simulations.sweet_spot} sites</p>
                <p className="text-xs text-white/60 mt-1">{simulations.sweet_spot_reason}</p>
              </div>
            )}
            {simulations.danger_zone && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Danger Zone</p>
                <p className="text-lg font-bold text-white">{simulations.danger_zone} sites</p>
                <p className="text-xs text-white/60 mt-1">{simulations.danger_zone_reason}</p>
              </div>
            )}
          </div>

          {/* Scale table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  <th className="text-left py-2 px-2">Sites</th>
                  <th className="text-right py-2 px-2">Pages</th>
                  <th className="text-right py-2 px-2">Traffic/mo</th>
                  <th className="text-right py-2 px-2">Leads/mo</th>
                  <th className="text-right py-2 px-2">Revenue/mo</th>
                  <th className="text-right py-2 px-2">Net Profit</th>
                  <th className="text-center py-2 px-2">Risk</th>
                  <th className="text-center py-2 px-2">Google</th>
                </tr>
              </thead>
              <tbody>
                {simulations.simulations.map((sim, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 font-bold text-white">{sim.site_count}</td>
                    <td className="text-right py-2 px-2 text-white/70">{sim.total_pages?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-white/70">{sim.est_monthly_traffic?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-white/70">{sim.est_monthly_leads?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-green-400 font-medium">${sim.est_monthly_revenue?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-green-400">${sim.net_monthly_profit?.toLocaleString()}</td>
                    <td className="text-center py-2 px-2"><span className={riskColor(sim.penalty_risk)}>{sim.penalty_risk}</span></td>
                    <td className="text-center py-2 px-2"><span className={googleColor(sim.google_action)}>{sim.google_action}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {simulations.overall_recommendation && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Overall Recommendation</p>
              <p className="text-sm text-white/80">{simulations.overall_recommendation}</p>
            </div>
          )}

          {simulations.google_compliance_notes && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Google Compliance Notes</p>
              <p className="text-xs text-white/70">{simulations.google_compliance_notes}</p>
            </div>
          )}
        </div>
      )}

      {!simulations && !loading && (
        <div className="text-center py-8">
          <Globe className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Click "Run Simulation" to see what happens at every scale level</p>
        </div>
      )}
    </Card>
  );
}
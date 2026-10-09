import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, TrendingUp, Zap, ArrowRight } from "lucide-react";

export default function TimeEstimator({ industry, url, hasNearMe, location }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "estimate_time_to_page1",
        industry,
        url,
        has_nearme: hasNearMe,
        location,
      });
      setEstimate(res.data?.estimate || res.estimate);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 bg-zinc-900 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" /> Time to Page 1 Estimator
        </h3>
        <Button onClick={run} disabled={loading || !industry} size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Clock className="w-3 h-3 mr-1" />}
          {loading ? "Estimating..." : "Estimate"}
        </Button>
      </div>

      <p className="text-xs text-white/50 mb-4">
        Compares time to Google page 1 WITH vs WITHOUT NearMe in the URL. Shows the NearMe advantage at every milestone.
      </p>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-md p-2 text-xs text-red-400 mb-3">{error}</div>}

      {estimate && (
        <div className="space-y-4">
          {/* Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Without NearMe</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-white/60">Page 1:</span><span className="text-white font-bold">{estimate.without_nearme?.time_to_page1}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/60">Top 3:</span><span className="text-white font-bold">{estimate.without_nearme?.time_to_top3}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/60">#1:</span><span className="text-white font-bold">{estimate.without_nearme?.time_to_number1}</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> With NearMe</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-white/60">Page 1:</span><span className="text-green-400 font-bold">{estimate.with_nearme?.time_to_page1}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/60">Top 3:</span><span className="text-green-400 font-bold">{estimate.with_nearme?.time_to_top3}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/60">#1:</span><span className="text-green-400 font-bold">{estimate.with_nearme?.time_to_number1}</span></div>
              </div>
            </div>
          </div>

          {/* NearMe Advantage */}
          {estimate.nearme_advantage && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> NearMe Advantage</p>
              <p className="text-sm text-white/80">{estimate.nearme_advantage.summary}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs"><span className="text-white/50">Page 1 faster by: </span><span className="text-white font-bold">{estimate.nearme_advantage.page1_faster_by}</span></div>
                <div className="text-xs"><span className="text-white/50">12mo traffic multiplier: </span><span className="text-white font-bold">{estimate.nearme_advantage.traffic_12mo_multiplier}x</span></div>
              </div>
            </div>
          )}

          {/* Traffic comparison */}
          <div className="grid grid-cols-3 gap-2">
            {[3, 6, 12].map((m) => (
              <div key={m} className="p-2 rounded-md bg-white/5 text-center">
                <p className="text-xs text-white/50">Month {m}</p>
                <div className="flex items-center justify-center gap-2">
                  <div><p className="text-xs text-white/40">No NearMe</p><p className="text-sm text-white">{estimate.without_nearme?.[`traffic_m${m}`]?.toLocaleString()}</p></div>
                  <ArrowRight className="w-3 h-3 text-green-400" />
                  <div><p className="text-xs text-green-400">NearMe</p><p className="text-sm text-green-400 font-bold">{estimate.with_nearme?.[`traffic_m${m}`]?.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          {estimate.milestones?.length > 0 && (
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Key Milestones</p>
              <div className="space-y-1">
                {estimate.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/30">Month {m.month}</Badge>
                    <span className="text-white/70">{m.milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!estimate && !loading && (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Estimate time to page 1 with and without NearMe</p>
        </div>
      )}
    </Card>
  );
}
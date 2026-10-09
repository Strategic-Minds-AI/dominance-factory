import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, TrendingUp, DollarSign, Link2 } from "lucide-react";

export default function PiggybackSystem({ businessName, industry, url }) {
  const [piggybacks, setPiggybacks] = useState([]);
  const [networkStrategy, setNetworkStrategy] = useState("");
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "generate_piggyback",
        business_name: businessName || industry,
        industry,
        url,
      });
      const data = res.data || res;
      setPiggybacks(data.piggybacks || []);
      setNetworkStrategy(data.network_strategy || "");
      setTotals({ traffic: data.total_est_traffic, revenue: data.total_est_revenue });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 bg-zinc-900 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Piggyback System
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Takes "{businessName || industry}" and piggybacks into 15 related industries — authority transfers from the original site
          </p>
        </div>
        <Button onClick={generate} disabled={loading || (!businessName && !industry)} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Layers className="w-3 h-3 mr-1" />}
          {loading ? "Generating..." : "Generate Piggybacks"}
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-md p-2 text-xs text-red-400 mb-3">{error}</div>}

      {totals && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
            <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totals.traffic?.toLocaleString()}</p>
            <p className="text-xs text-white/50">Total Est. Monthly Traffic</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">${totals.revenue?.toLocaleString()}</p>
            <p className="text-xs text-white/50">Total Est. Monthly Revenue</p>
          </div>
        </div>
      )}

      {piggybacks.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {piggybacks.map((p, i) => (
            <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm font-bold text-white">{p.industry}</p>
                  <p className="text-xs font-mono text-purple-300">{p.url}</p>
                </div>
                <Badge variant="outline" className="text-xs text-white/50 border-white/20">{p.time_to_page1}</Badge>
              </div>
              <p className="text-xs text-white/60 mt-1">{p.reasoning}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-white/40">Traffic: </span>
                  <span className="text-white font-medium">{p.est_traffic?.toLocaleString()}/mo</span>
                </div>
                <div className="text-xs">
                  <span className="text-white/40">Revenue: </span>
                  <span className="text-green-400 font-medium">${p.est_revenue?.toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="flex items-start gap-1 mt-2">
                <Link2 className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/50">{p.cross_linking}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {networkStrategy && (
        <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Network Strategy</p>
          <p className="text-xs text-white/70">{networkStrategy}</p>
        </div>
      )}

      {!piggybacks.length && !loading && (
        <div className="text-center py-8">
          <Layers className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Generate 15 piggyback industry targets with cross-linking strategy</p>
        </div>
      )}
    </Card>
  );
}
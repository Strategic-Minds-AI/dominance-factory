import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, Calendar, Crown, Rocket } from "lucide-react";
import SimulationChart from "./SimulationChart";

export default function StrategyCard({ strategy, isWinner, onProvision, provisioning }) {
  if (!strategy) return null;

  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;
  const p50 = strategy.p50 || {};
  const p10 = strategy.p10 || {};
  const p90 = strategy.p90 || {};

  return (
    <Card className={`p-5 transition-all ${isWinner ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/40 ring-1 ring-yellow-500/20" : "bg-zinc-900 border-white/10"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isWinner && <Crown className="w-5 h-5 text-yellow-400" />}
          <h3 className="text-base font-bold text-white">{strategy.name}</h3>
        </div>
        {isWinner && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">WINNER</Badge>}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-md bg-white/5">
          <p className="text-[10px] text-gray-500 uppercase">Pages</p>
          <p className="text-sm font-bold text-white">{strategy.page_count}</p>
        </div>
        <div className="p-2 rounded-md bg-white/5">
          <p className="text-[10px] text-gray-500 uppercase">Cities</p>
          <p className="text-sm font-bold text-white">{strategy.cities}</p>
        </div>
        <div className="p-2 rounded-md bg-white/5">
          <p className="text-[10px] text-gray-500 uppercase">Total Cost</p>
          <p className="text-sm font-bold text-white">{fmt(strategy.total_cost)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-md bg-red-500/5 border border-red-500/10">
          <p className="text-[10px] text-red-400/60 uppercase">P10 Profit</p>
          <p className="text-sm font-bold text-red-400">{fmt(p10.profit_12mo || 0)}</p>
        </div>
        <div className="p-2 rounded-md bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400/60 uppercase">P50 Profit</p>
          <p className="text-sm font-bold text-blue-400">{fmt(p50.profit_12mo || 0)}</p>
        </div>
        <div className="p-2 rounded-md bg-green-500/5 border border-green-500/10">
          <p className="text-[10px] text-green-400/60 uppercase">P90 Profit</p>
          <p className="text-sm font-bold text-green-400">{fmt(p90.profit_12mo || 0)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-gray-500" />
          <span className="text-gray-400">ROI: <span className="text-white font-bold">{strategy.roi_p50}x</span></span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="text-gray-400">Break-even: <span className="text-white font-bold">{p50.break_even_month > 12 ? "12mo+" : `M${p50.break_even_month}`}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-gray-500" />
          <span className="text-gray-400">Leads/yr: <span className="text-white font-bold">{(p50.leads_12mo || 0).toLocaleString()}</span></span>
        </div>
      </div>

      {isWinner && strategy.monthly_projection && (
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 uppercase mb-2">12-Month Projection (P50)</p>
          <SimulationChart monthlyProjection={strategy.monthly_projection} />
        </div>
      )}

      {isWinner && (
        <Button
          onClick={onProvision}
          disabled={provisioning}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
        >
          {provisioning ? (
            <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" /> Provisioning...</>
          ) : (
            <><Rocket className="w-4 h-4 mr-2" /> Provision This Website</>
          )}
        </Button>
      )}
    </Card>
  );
}
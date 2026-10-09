import React from "react";
import { TrendingUp, Globe, RefreshCw } from "lucide-react";

export default function ScalingStep() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Your Empire Is Live</h2>
        <p className="text-slate-400">Now scale to hundreds of programmatic websites on autopilot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-6 text-center">
          <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-3xl font-black text-white">1</p>
          <p className="text-xs text-slate-400 tracking-wider uppercase">Core Website Live</p>
        </div>
        <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-3xl font-black text-white">100</p>
          <p className="text-xs text-slate-400 tracking-wider uppercase">Programmatic Sites Ready</p>
        </div>
        <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-6 text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-3xl font-black text-white">∞</p>
          <p className="text-xs text-slate-400 tracking-wider uppercase">Scaling Capacity</p>
        </div>
      </div>

      <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Programmatic Scaling Engine</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Your strategy and branding are locked in. The system can now generate hundreds of location and service-based websites automatically, each with its own SEO, social media, and lead capture.
        </p>
        <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[#05070a] font-bold hover:scale-105 transition-transform">
          <RefreshCw className="w-5 h-5" /> Generate Next 100 Sites
        </button>
      </div>
    </div>
  );
}
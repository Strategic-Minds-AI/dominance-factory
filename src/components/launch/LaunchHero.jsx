import React from "react";
import { Zap, BarChart3, LayoutGrid, Users, Check } from "lucide-react";

const CHECKLIST = ["Stunning Templates", "Mobile Optimized", "SEO Ready", "Fast Launch"];
const FEATURES = [
  { icon: Zap, label: "Lightning Fast" },
  { icon: BarChart3, label: "Lead Focused" },
  { icon: LayoutGrid, label: "200+ Designs" },
  { icon: Users, label: "Built to Convert" },
];

export default function LaunchHero() {
  return (
    <section className="bg-[#0a101d] text-white pt-16 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-[#007bff] font-bold tracking-[0.2em] text-xs sm:text-sm mb-3">FAST WEBSITES. REAL LEADS. BIGGER BUSINESS.</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-4">
          Launch 100s of Websites<br />in Minutes.
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          We build professional, conversion-focused websites for high-value industries — at scale.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <a href="#industries" className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold rounded-full px-7 py-3 text-sm transition-colors">Browse Industries</a>
          <a href="#templates" className="border border-white/20 hover:bg-white/5 text-white font-semibold rounded-full px-7 py-3 text-sm transition-colors">View Templates</a>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b39a853?w=800&auto=format&fit=crop" alt="Laptop with website designs" className="w-full h-auto" />
          </div>
          <div className="text-left space-y-3">
            {CHECKLIST.map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#007bff] flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-white" /></div>
                <span className="text-slate-200 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
        {FEATURES.map(f => (
          <div key={f.label} className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#007bff]/15 flex items-center justify-center"><f.icon className="w-6 h-6 text-[#007bff]" /></div>
            <span className="text-xs sm:text-sm font-semibold text-slate-300">{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
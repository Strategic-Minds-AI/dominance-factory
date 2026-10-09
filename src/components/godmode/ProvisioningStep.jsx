import React, { useState } from "react";
import { Rocket, CheckCircle2, Loader2, Globe, Share2, Bot, MessageSquare, TrendingUp } from "lucide-react";

const ITEMS = [
  { icon: Globe, label: "Website Deployed", desc: "Your chosen design is live with a custom domain" },
  { icon: Rocket, label: "Client Portal System", desc: "Branded portal for managing your digital presence" },
  { icon: Share2, label: "Automated Social Media", desc: "Full content calendar with scheduled posts across platforms" },
  { icon: Bot, label: "Super Agent System", desc: "Autonomous agents managing research, content, and outreach" },
  { icon: MessageSquare, label: "AI Chat Agent", desc: "24/7 conversational AI on your website for lead capture" },
];

export default function ProvisioningStep({ onComplete }) {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= ITEMS.length) {
          clearInterval(timer);
          setTimeout(onComplete, 1500);
          return p;
        }
        return p + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Provisioning Your Empire</h2>
        <p className="text-slate-400">Building your full system. This takes about a minute.</p>
      </div>

      <div className="bg-[#0d141e]/60 backdrop-blur border border-cyan-500/15 rounded-2xl p-6 space-y-3">
        {ITEMS.map((item, i) => {
          const done = i < progress;
          const active = i === progress;
          const Icon = item.icon;
          return (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${done ? "bg-cyan-500/5" : active ? "bg-slate-800/50" : "opacity-40"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${done ? "border-cyan-400 bg-cyan-500/20" : active ? "border-cyan-400 bg-[#0d141e]" : "border-slate-700"}`}>
                {done ? <CheckCircle2 className="w-5 h-5 text-cyan-300" /> : active ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> : <Icon className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
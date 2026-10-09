import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BarChart3, Crown, Globe, Sparkles, MapPin, Trophy, TrendingUp, Calculator, Layers, CheckCircle, PlayCircle, Package, Database, Palette, Rocket, FileText, Share2, ImageIcon, Send, Bot, Activity, FlaskConical, ShieldCheck, Eye, Server, Cloud, HeartPulse, BookOpen, Webhook, Cpu, Brain, Scan, Zap, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import AutonomousChatAgent from "@/components/AutonomousChatAgent";
import { Library } from "lucide-react";

const navGroups = [
  {
    label: "Phase 1 — Research & Intelligence",
    items: [
      { step: 1, label: "Industry Opportunity Scanner", path: "/industries", icon: BarChart3 },
      { label: "Benchmark & Reverse Engineer", path: "/benchmark-engine", icon: Trophy },
      { step: 2, label: "Market Intelligence", path: "/intelligence", icon: Brain },
      { step: 3, label: "God Mode SEO", path: "/god-mode", icon: Cpu },
      { step: 4, label: "Digital Dominance", path: "/digital-dominance", icon: Globe },
      { step: 5, label: "Name & Domain Intelligence", path: "/", icon: Sparkles },
      { step: 6, label: "NearMe / NearYou Strategy", path: "/", icon: MapPin },
      { step: 7, label: "Opportunity Ranking", path: "/research-engine", icon: Trophy },
    ],
  },
  {
    label: "Phase 2 — Simulation & Strategy",
    items: [
      { step: 8, label: "Strategy Tournament", path: "/research-engine", icon: Crown },
      { step: 9, label: "Portfolio Simulator", path: "/", icon: TrendingUp },
      { step: 10, label: "Financial & ROI Analysis", path: "/research-engine", icon: Calculator },
      { step: 11, label: "Ten-Strategy Comparison", path: "/research-engine", icon: Layers },
      { step: 12, label: "Strategy Selection", path: "/seo-strategy", icon: CheckCircle },
    ],
  },
  {
    label: "Phase 3 — Auto Builder",
    items: [
      { step: 13, label: "Build Initiation & Gap Analysis", path: "/build-initiation", icon: Zap },
      { step: 14, label: "Business Onboarding", path: "/onboarding", icon: PlayCircle },
      { step: 15, label: "Brand & Design System", path: "/packs", icon: Package },
      { step: 16, label: "Website Genome", path: "/websites", icon: Database },
      { step: 17, label: "Visual Editor", path: "/editor", icon: Palette },
      { step: 18, label: "Pack Review", path: "/packs", icon: Package },
      { step: 19, label: "Programmatic Launch", path: "/launch", icon: Rocket },
    ],
  },
  {
    label: "Quick Access",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
      { label: "Unified Library", path: "/unified-library", icon: Library },
      { label: "Template Library", path: "/template-library", icon: Package },
      { label: "Backend Operations", path: "/backend/dashboard", icon: Server },
    ],
  },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-60 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-base font-bold tracking-tight text-white">ApexForge</h1>
          <p className="text-xs text-gray-500 mt-0.5">Programmatic SEO Platform</p>
        </div>
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                        active
                          ? "bg-[#1e40af] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#1e40af]/40 hover:ring-1 hover:ring-[#3b82f6]"
                      )}
                    >
                      {item.step ? (
                        <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0", active ? "bg-white/20 text-white" : "bg-white/10 text-gray-400")}>{item.step}</span>
                      ) : (
                        <item.icon className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <AutonomousChatAgent />
    </div>
  );
}
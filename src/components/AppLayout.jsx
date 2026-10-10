import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BarChart3, Crown, Globe, Sparkles, MapPin, Trophy, TrendingUp, Calculator, Layers, CheckCircle, PlayCircle, Package, Database, Palette, Rocket, FileText, Share2, ImageIcon, Send, Bot, Activity, FlaskConical, ShieldCheck, Eye, Server, Cloud, HeartPulse, BookOpen, Webhook, Cpu, Brain, Scan, Zap, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import AutonomousChatAgent from "@/components/AutonomousChatAgent";
import { Library } from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { step: 1, label: "God Mode Pipeline", path: "/god-mode-pipeline", icon: Zap },
      { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
      { label: "Website Library", path: "/websites", icon: Globe },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Backend Operations", path: "/backend/dashboard", icon: Server },
    ],
  },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-16 md:w-60 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-base font-bold tracking-tight text-white"><span className="hidden md:inline">ApexForge</span><span className="md:hidden">AF</span></h1>
          <p className="hidden md:block text-xs text-gray-500 mt-0.5">Programmatic SEO Platform</p>
        </div>
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <p className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      title={item.label}
                      aria-label={item.label}
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
                      <span className="hidden md:inline truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[#05070a] text-white">
        <Outlet />
      </main>
      <AutonomousChatAgent />
    </div>
  );
}
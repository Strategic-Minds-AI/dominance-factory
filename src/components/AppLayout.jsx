import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Sparkles, BarChart3, Crown, PlayCircle, Palette, Package, Rocket, Zap, Globe, Share2, Server, BookOpen, LayoutDashboard, Bot, Brain, Send, Image as ImageIcon, Command, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Phase 1 — Research & Intelligence",
    items: [
      { step: 1, label: "Industry Intelligence", path: "/industries", icon: BarChart3 },
      { step: 2, label: "God Mode SEO Optimizer", path: "/god-mode", icon: Zap },
      { step: 3, label: "SEO Dominance Strategy", path: "/seo-strategy", icon: Crown },
      { step: 4, label: "Digital Dominance", path: "/digital-dominance", icon: Globe },
    ],
  },
  {
    label: "Phase 2 — Name & Setup",
    items: [
      { step: 5, label: "Name & URL Generator", path: "/", icon: Sparkles },
      { step: 6, label: "Onboarding Pipeline", path: "/onboarding", icon: PlayCircle },
    ],
  },
  {
    label: "Phase 3 — Site Creation",
    items: [
      { step: 7, label: "Visual Editor", path: "/editor", icon: Palette },
      { step: 8, label: "Pack Review", path: "/packs", icon: Package },
      { step: 9, label: "Programmatic Launch", path: "/launch", icon: Rocket },
    ],
  },
  {
    label: "Phase 4 — Distribution & Deployment",
    items: [
      { step: 10, label: "Social Media", path: "/social", icon: Share2 },
      { step: 11, label: "Provisioning & Domains", path: "/provisioning", icon: Server },
      { step: 12, label: "System Contents", path: "/contents", icon: BookOpen },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Website Library", path: "/websites", icon: Globe },
      { label: "Super Agents", path: "/agents", icon: Bot },
      { label: "Intelligence Hub", path: "/intelligence", icon: Brain },
      { label: "Outreach", path: "/outreach", icon: Send },
      { label: "Media Studio", path: "/media", icon: ImageIcon },
      { label: "Dominance Shell", path: "/dominance", icon: Command },
      { label: "GPT Sync", path: "/sync", icon: Webhook },
    ],
  },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
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
    </div>
  );
}
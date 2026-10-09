import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Share2, ImageIcon, Send, Bot, Activity, ShieldCheck, Eye, Server, Cloud, HeartPulse, BookOpen, FlaskConical, Webhook, Mail, Library, Scan, Package, ArrowLeft, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import AutonomousChatAgent from "@/components/AutonomousChatAgent";

const navGroups = [
  {
    label: "← Back to Main",
    items: [
      { label: "Phase 1-3 Workspace", path: "/", icon: ArrowLeft },
    ],
  },
  {
    label: "Phase 4 — Operations",
    items: [
      { label: "SEO & Content Ops", path: "/backend/launch", icon: Send },
      { label: "Social Media Studio", path: "/backend/social-automation", icon: Share2 },
      { label: "Image & Video Factory", path: "/backend/media", icon: ImageIcon },
      { label: "CRM & Client OS", path: "/backend/outreach", icon: Send },
      { label: "Super Agent Command", path: "/backend/agents", icon: Bot },
      { label: "Analytics & A/B Testing", path: "/backend/analytics", icon: Activity },
    ],
  },
  {
    label: "Phase 5 — Validation & Release",
    items: [
      { label: "Fault Line Validation", path: "/backend/contents", icon: ShieldCheck },
      { label: "Website Preview & QA", path: "/backend/frontend", icon: Eye },
      { label: "Domain Provisioning", path: "/backend/provisioning", icon: Server },
      { label: "Vercel Deployment", path: "/backend/provisioning", icon: Cloud },
      { label: "System Health", path: "/backend/dominance", icon: HeartPulse },
      { label: "System Contents", path: "/backend/contents", icon: BookOpen },
    ],
  },
  {
    label: "System Access",
    items: [
      { label: "A/B Testing", path: "/backend/ab-testing", icon: FlaskConical },
      { label: "GPT System Gateway", path: "/backend/sync", icon: Webhook },
      { label: "Google Workspace Hub", path: "/backend/google-workspace", icon: Mail },
      { label: "Unified Library", path: "/backend/unified-library", icon: Library },
    ],
  },
  {
    label: "System Reference",
    items: [
      { label: "Full System Library", path: "/backend/library", icon: Library },
      { label: "System Scanner", path: "/backend/system-scanner", icon: Scan },
      { label: "Self-Reflection & Repair", path: "/backend/reflection", icon: Activity },
      { label: "Asset Ingestion", path: "/backend/ingestion", icon: Package },
      { label: "System Monitor", path: "/backend/system-monitor", icon: Activity },
      { label: "Agent Reference", path: "/backend/agent-reference", icon: Bot },
      { label: "Gap Analysis", path: "/backend/gap-analysis", icon: ShieldCheck },
      { label: "System Dashboard", path: "/backend/dashboard", icon: Cpu },
    ],
  },
];

export default function BackendLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-60 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-base font-bold tracking-tight text-white">ApexForge</h1>
          <p className="text-xs text-gray-500 mt-0.5">Backend Operations</p>
        </div>
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi === 0 ? (
                <div className="space-y-0.5 mb-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-blue-400 hover:text-white hover:bg-[#1e40af]/40 transition-all"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path + item.label}
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                            active
                              ? "bg-[#1e40af] text-white"
                              : "text-gray-400 hover:text-white hover:bg-[#1e40af]/40 hover:ring-1 hover:ring-[#3b82f6]"
                          )}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
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
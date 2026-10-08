import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Globe, Share2, Rocket, Bot, Package, Palette, Command } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Website Library", path: "/websites", icon: Globe },
  { label: "Social Media", path: "/social", icon: Share2 },
  { label: "Launch Pad", path: "/launch", icon: Rocket },
  { label: "Super Agents", path: "/agents", icon: Bot },
  { label: "Pack Review", path: "/packs", icon: Package },
  { label: "Visual Editor", path: "/editor", icon: Palette },
  { label: "Dominance Shell", path: "/dominance", icon: Command },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-base font-bold tracking-tight text-white">DominanceFactory</h1>
          <p className="text-xs text-gray-500 mt-0.5">Programmatic SEO Platform</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  active
                    ? "bg-[#1e40af] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1e40af]/40 hover:ring-1 hover:ring-[#3b82f6]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
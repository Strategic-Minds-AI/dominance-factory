import React, { useState } from "react";
import { Brain, TrendingUp, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";
import AIHubPanel from "@/components/intelligence/AIHubPanel";
import OpportunityPanel from "@/components/intelligence/OpportunityPanel";
import ContractorPanel from "@/components/intelligence/ContractorPanel";

const TABS = [
  { id: "aihub", label: "AI Hub Catalog", icon: Brain, component: AIHubPanel },
  { id: "opportunity", label: "Opportunity Engine", icon: TrendingUp, component: OpportunityPanel },
  { id: "contractor", label: "Contractor Workflow", icon: HardHat, component: ContractorPanel },
];

export default function IntelligenceHub() {
  const [activeTab, setActiveTab] = useState("aihub");
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Intelligence Hub</h1>
        <p className="text-sm text-gray-400 mt-1">
          AI product catalog, opportunity discovery engine, and contractor workflow intelligence
        </p>
      </div>
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.id
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-white hover:border-white/20"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}
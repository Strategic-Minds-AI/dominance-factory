import React, { useState } from "react";
import { cn } from "@/lib/utils";
import EntityDataTable from "./EntityDataTable";

const SUB_TABS = [
  {
    id: "opportunities",
    label: "Opportunity Queue",
    entity: "Opportunity",
    columns: [
      { key: "opportunity_id", label: "ID" },
      { key: "title", label: "Title" },
      { key: "buyer", label: "Buyer" },
      { key: "weighted_score", label: "Score" },
      { key: "gate", label: "Gate" },
      { key: "status", label: "Status" },
    ],
    search: ["title", "buyer", "problem"],
  },
  {
    id: "discovery",
    label: "Discovery Methods",
    entity: "DiscoveryMethod",
    columns: [
      { key: "method_number", label: "#" },
      { key: "category", label: "Category" },
      { key: "method", label: "Method" },
      { key: "cadence", label: "Cadence" },
    ],
    search: ["method", "category"],
  },
  {
    id: "problems",
    label: "Problem Taxonomy",
    entity: "ProblemPattern",
    columns: [
      { key: "domain", label: "Domain" },
      { key: "pattern", label: "Pattern" },
      { key: "core_metrics", label: "Core Metrics" },
    ],
    search: ["domain", "pattern"],
  },
  {
    id: "themes",
    label: "Demand Themes",
    entity: "DemandTheme",
    columns: [
      { key: "domain", label: "Domain" },
      { key: "theme", label: "Theme" },
      { key: "buyer", label: "Buyer" },
      { key: "product_form", label: "Product Form" },
    ],
    search: ["theme", "domain", "buyer"],
  },
  {
    id: "personas",
    label: "Buyer Personas",
    entity: "BuyerPersona",
    columns: [
      { key: "persona", label: "Persona" },
      { key: "segments", label: "Segments" },
      { key: "channels", label: "Channels" },
    ],
    search: ["persona", "segments"],
  },
  {
    id: "infocategories",
    label: "Info Categories",
    entity: "InfoCategory",
    columns: [
      { key: "rank", label: "Rank" },
      { key: "category_id", label: "ID" },
      { key: "macro_category", label: "Macro Category" },
      { key: "value_score", label: "Value" },
    ],
    search: ["macro_category", "category_id"],
  },
];

export default function OpportunityPanel() {
  const [activeSub, setActiveSub] = useState("opportunities");
  const config = SUB_TABS.find(s => s.id === activeSub);

  return (
    <div>
      <div className="flex gap-1 mb-6 flex-wrap">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSub(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeSub === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <EntityDataTable
        key={config.entity}
        entityName={config.entity}
        columns={config.columns}
        searchFields={config.search}
        title={config.label}
      />
    </div>
  );
}
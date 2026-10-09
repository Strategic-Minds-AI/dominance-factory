import React, { useState } from "react";
import { cn } from "@/lib/utils";
import EntityDataTable from "./EntityDataTable";

const SUB_TABS = [
  {
    id: "steps",
    label: "Workflow Steps",
    entity: "ContractorStep",
    columns: [
      { key: "step_id", label: "Step ID" },
      { key: "phase", label: "Phase" },
      { key: "owner", label: "Owner" },
      { key: "necessity", label: "Necessity" },
      { key: "annual_time_saved", label: "Hrs Saved/Yr" },
    ],
    search: ["step_id", "phase", "traditional_action"],
  },
  {
    id: "techoptions",
    label: "Technology Options",
    entity: "ContractorTechOption",
    columns: [
      { key: "step_id", label: "Step ID" },
      { key: "step_name", label: "Step" },
      { key: "option_name", label: "Option" },
      { key: "monthly_mode", label: "Monthly $" },
      { key: "time_reduction", label: "Time Reduction" },
    ],
    search: ["step_id", "step_name", "option_name"],
  },
  {
    id: "personas",
    label: "Adoption Personas",
    entity: "ContractorPersona",
    columns: [
      { key: "persona_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "primary_segment", label: "Segment" },
      { key: "adoption_probability", label: "Adoption %" },
      { key: "hours_saved", label: "Hrs Saved/Wk" },
    ],
    search: ["name", "primary_segment"],
  },
];

export default function ContractorPanel() {
  const [activeSub, setActiveSub] = useState("steps");
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
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
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
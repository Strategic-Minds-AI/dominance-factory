import React, { useState } from "react";
import { cn } from "@/lib/utils";
import EntityDataTable from "./EntityDataTable";

const SUB_TABS = [
  {
    id: "products",
    label: "Master Catalog",
    entity: "HubProduct",
    columns: [
      { key: "product_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "value_score", label: "Value" },
    ],
    search: ["name", "category", "product_id"],
  },
  {
    id: "swarms",
    label: "Swarm Generators",
    entity: "SwarmGenerator",
    columns: [
      { key: "generator_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "pattern", label: "Pattern" },
    ],
    search: ["name", "pattern"],
  },
  {
    id: "workflows",
    label: "Workflow Packs",
    entity: "WorkflowPack",
    columns: [
      { key: "workflow_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "evidence_type", label: "Evidence" },
    ],
    search: ["name", "description"],
  },
  {
    id: "prompts",
    label: "Prompt Library",
    entity: "PromptEntry",
    columns: [
      { key: "prompt_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
    ],
    search: ["name", "category"],
  },
  {
    id: "connectors",
    label: "Connectors",
    entity: "ConnectorEntry",
    columns: [
      { key: "connector_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "connector_type", label: "Type" },
      { key: "status", label: "Status" },
    ],
    search: ["name", "connector_type"],
  },
  {
    id: "templates",
    label: "System Templates",
    entity: "SystemTemplate",
    columns: [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "file_count", label: "Files" },
      { key: "tech_stack", label: "Tech Stack", wrap: true },
      { key: "key_features", label: "Key Features", wrap: true },
      { key: "status", label: "Status" },
      { key: "file_url", label: "File", render: (r) => r.file_url ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a> : "—" },
    ],
    search: ["name", "category", "template_type", "description", "tech_stack", "tags"],
  },
];

export default function AIHubPanel() {
  const [activeSub, setActiveSub] = useState("products");
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
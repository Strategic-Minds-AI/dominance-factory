import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Scan, Search, RefreshCw, Database, Code2, Workflow, Plug, FileCode, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  data_storage: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  ai_engine: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  content_generation: "bg-green-500/10 text-green-400 border-green-500/30",
  seo_optimization: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  social_media: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  media_production: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  outreach_communication: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  provisioning_deployment: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  analytics_reporting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  agent_orchestration: "bg-red-500/10 text-red-400 border-red-500/30",
  research_intelligence: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  workflow_automation: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  external_integration: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  ui_interface: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  governance_security: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  infrastructure: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const TYPE_ICONS = {
  entity: Database,
  backend_function: Code2,
  workflow: Workflow,
  connector: Plug,
  page: FileCode,
};

export default function SystemScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lastScan, setLastScan] = useState(null);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("systemScanner", { action: "scan" });
      setScanResult(res.data);
      setLastScan(res.data.scanned_at);
      await loadInventory();
    } catch (err) {
      console.error(err);
    }
    setScanning(false);
  };

  const loadInventory = async () => {
    try {
      const res = await base44.functions.invoke("systemScanner", { action: "query" });
      setInventory(res.data.items || []);
      setGrouped(res.data.grouped || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = Object.keys(grouped).sort();
  const filteredItems = filter
    ? inventory.filter(i =>
        i.system_name.toLowerCase().includes(filter.toLowerCase()) ||
        i.category.toLowerCase().includes(filter.toLowerCase()) ||
        i.subcategory?.toLowerCase().includes(filter.toLowerCase())
      )
    : selectedCategory !== "all"
    ? inventory.filter(i => i.category === selectedCategory)
    : inventory;

  const typeCounts = inventory.reduce((acc, item) => {
    acc[item.system_type] = (acc[item.system_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Scan className="w-7 h-7 text-blue-500" />
              Deterministic System Scanner
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Automatically scans, classifies, and organizes all internal systems deterministically
            </p>
          </div>
          <Button onClick={runScan} disabled={scanning} className="bg-blue-600 hover:bg-blue-700">
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {scanning ? "Scanning..." : "Run Full Scan"}
          </Button>
        </div>

        {lastScan && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Last scan: {new Date(lastScan).toLocaleString()}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-white">{inventory.length}</p>
              <p className="text-xs text-gray-500">Total Systems</p>
            </CardContent>
          </Card>
          {Object.entries(typeCounts).map(([type, count]) => {
            const Icon = TYPE_ICONS[type] || Database;
            return (
              <Card key={type} className="bg-[#111] border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{type.replace(/_/g, " ")}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              selectedCategory === "all"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-[#111] text-gray-400 border-white/10 hover:border-white/30"
            )}
          >
            All ({inventory.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-[#111] text-gray-400 border-white/10 hover:border-white/30"
              )}
            >
              {cat.replace(/_/g, " ")} ({grouped[cat]?.length || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search systems by name, category, or capability..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#111] border-white/10 text-white pl-10"
          />
        </div>

        {/* Inventory grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const Icon = TYPE_ICONS[item.system_type] || Database;
            return (
              <Card key={item.id} className="bg-[#111] border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-white text-sm">{item.system_name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", CATEGORY_COLORS[item.category] || "")}
                    >
                      {item.reuse_potential}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 capitalize">{item.system_type.replace(/_/g, " ")}</p>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] mb-2", CATEGORY_COLORS[item.category] || "border-white/10 text-gray-400")}
                  >
                    {item.category?.replace(/_/g, " ")}
                  </Badge>
                  {item.subcategory && (
                    <p className="text-xs text-gray-600 mt-1">{item.subcategory.replace(/_/g, " ")}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && !scanning && (
          <div className="text-center py-20 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No systems found. Run a scan to classify all internal systems.</p>
          </div>
        )}
      </div>
    </div>
  );
}
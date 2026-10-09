import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Library, Search, FileArchive, Box, Brain, Globe, Rocket, FileText, Package, Download, ExternalLink, Filter, Boxes, Layers, Cpu, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  "Deployable Apps": Box,
  "Architecture & Blueprints": Layers,
  "Browser & Agent Systems": Cpu,
  "Template Packs": Package,
  "Lead Generation": Rocket,
  "Marketplace Systems": Boxes,
  "Portfolio": Globe,
  "Social Media": Zap,
  "Other": FileText,
};

const TYPE_COLORS = {
  base44_app: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  factory_blueprint: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  governance_system: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  browser_agent: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  agent_system: "bg-green-500/10 text-green-300 border-green-500/20",
  template_pack: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  website_builder: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  other: "bg-white/5 text-gray-400 border-white/10",
};

const STATUS_COLORS = {
  stored: "bg-green-500/10 text-green-300 border-green-500/20",
  deployed: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  duplicate: "bg-orange-500/10 text-orange-300 border-orange-500/20",
};

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await base44.entities.SystemTemplate.filter(
        {},
        { sort: 'category', limit: 500 }
      );
      setTemplates(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  const types = ["All", ...Array.from(new Set(templates.map(t => t.template_type)))];

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()) || t.tech_stack?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchType = activeType === "All" || t.template_type === activeType;
    return matchSearch && matchCat && matchType;
  });

  const byCategory = {};
  for (const t of filtered) {
    const cat = t.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }

  const totalFiles = templates.reduce((sum, t) => sum + (t.file_count || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-yellow-400" /> Template Library
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {templates.length} templates · {totalFiles.toLocaleString()} total files · {categories.length - 1} categories
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3 bg-zinc-900 border-white/10">
            <p className="text-[10px] text-gray-500 uppercase">Total Templates</p>
            <p className="text-xl font-bold text-white">{templates.length}</p>
          </Card>
          <Card className="p-3 bg-zinc-900 border-white/10">
            <p className="text-[10px] text-gray-500 uppercase">Total Files</p>
            <p className="text-xl font-bold text-white">{totalFiles.toLocaleString()}</p>
          </Card>
          <Card className="p-3 bg-zinc-900 border-white/10">
            <p className="text-[10px] text-gray-500 uppercase">Deployable Apps</p>
            <p className="text-xl font-bold text-white">{templates.filter(t => t.template_type === 'base44_app').length}</p>
          </Card>
          <Card className="p-3 bg-zinc-900 border-white/10">
            <p className="text-[10px] text-gray-500 uppercase">Blueprints</p>
            <p className="text-xl font-bold text-white">{templates.filter(t => t.template_type === 'factory_blueprint' || t.template_type === 'governance_system').length}</p>
          </Card>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates by name, tech stack, or description..." className="pl-10 bg-white/5 border-white/10 text-white" />
          </div>
          <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-zinc-900 border border-white/10 text-white text-sm rounded-md px-3 py-2">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={activeType} onChange={(e) => setActiveType(e.target.value)} className="bg-zinc-900 border border-white/10 text-white text-sm rounded-md px-3 py-2">
            {types.map(t => <option key={t} value={t}>{t?.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {loading && <p className="text-center text-white/50 py-12">Loading templates...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-white/50 py-12">No templates found matching your filters.</p>
        )}

        {/* Template categories */}
        {!loading && Object.entries(byCategory).map(([category, items]) => {
          const CatIcon = CATEGORY_ICONS[category] || FileText;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-bold text-white">{category}</h2>
                <Badge variant="outline" className="text-xs text-white/40 border-white/10">{items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((t) => {
                  const TypeIcon = CATEGORY_ICONS[category] || FileText;
                  const isExpanded = expanded === t.id;
                  return (
                    <Card key={t.id} className={cn("p-4 bg-zinc-900 border-white/10 transition-all", isExpanded && "ring-1 ring-yellow-500/20")}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                          {t.description && <p className="text-xs text-white/50 mt-1 line-clamp-2">{t.description}</p>}
                        </div>
                        <Badge className={cn("text-[10px] ml-2 shrink-0", STATUS_COLORS[t.status] || STATUS_COLORS.stored)}>{t.status}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge className={cn("text-[10px]", TYPE_COLORS[t.template_type] || TYPE_COLORS.other)}>{t.template_type?.replace(/_/g, ' ')}</Badge>
                        {t.file_count && <Badge variant="outline" className="text-[10px] text-white/40 border-white/10"><FileArchive className="w-2.5 h-2.5 mr-1" />{t.file_count} files</Badge>}
                      </div>

                      {t.tech_stack && (
                        <p className="text-[10px] text-white/40 mb-2"><span className="text-gray-500">Stack:</span> {t.tech_stack.substring(0, 120)}{t.tech_stack.length > 120 ? '...' : ''}</p>
                      )}

                      {isExpanded && t.key_features && (
                        <div className="mt-2 p-2 rounded-md bg-white/5 border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Key Features</p>
                          <p className="text-xs text-white/60">{t.key_features}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {t.file_url && (
                          <a href={t.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-white/70 border-white/10 bg-transparent text-xs">
                              <Download className="w-3 h-3 mr-1" /> Download
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : t.id)} className="text-white/50 text-xs ml-auto">
                          {isExpanded ? "Hide details" : "Details"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
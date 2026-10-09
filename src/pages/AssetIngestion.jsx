import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, Search, RefreshCw, Trash2, Package, FolderTree, Tag, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssetIngestion() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("ingestAsset", {
        action: "list",
        filter: filter ? { category: filter } : {},
        limit: 100,
      });
      setAssets(res.data?.assets || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("ingestAsset", { action: "categories" });
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadAssets(); loadCategories(); }, [loadAssets, loadCategories]);

  const handleIngest = async () => {
    if (!url.trim()) return;
    setIngesting(true);
    setLastResult(null);
    try {
      const name = fileName.trim() || url.split("/").pop() || "unknown";
      const res = await base44.functions.invoke("ingestAsset", {
        action: "ingest",
        file_url: url.trim(),
        file_name: name,
      });
      setLastResult(res.data);
      setUrl("");
      setFileName("");
      loadAssets();
      loadCategories();
    } catch (err) {
      setLastResult({ error: err.message });
    }
    setIngesting(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.functions.invoke("ingestAsset", { action: "delete", id });
      loadAssets();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorganize = async () => {
    setIngesting(true);
    try {
      await base44.functions.invoke("ingestAsset", { action: "reorganize" });
      loadAssets();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
    setIngesting(false);
  };

  const filtered = assets.filter((a) => {
    if (search && !(a.name?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Upload className="w-7 h-7 text-blue-500" />
            Asset Ingestion System
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload documents, code packages, and intellectual property. The system deterministically categorizes everything and organizes it into the correct categories automatically.
          </p>
        </div>

        {/* Ingestion Input */}
        <Card className="bg-[#111] border-white/10 mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">File URL (from upload, chat, or public link)</label>
                  <Input
                    placeholder="https://media.base44.com/files/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={ingesting}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">File Name (optional — auto-detected from URL)</label>
                  <Input
                    placeholder="e.g. cloud-browser.zip"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    disabled={ingesting}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleIngest} disabled={ingesting || !url.trim()} className="bg-blue-600 hover:bg-blue-700 h-9">
                    {ingesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {ingesting ? "Ingesting..." : "Ingest Asset"}
                  </Button>
                </div>
              </div>
              {lastResult && (
                <div className={cn("rounded-lg p-3 text-sm", lastResult.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400")}>
                  {lastResult.error ? (
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {lastResult.error}</span>
                  ) : (
                    <span>
                      Categorized as <Badge className="bg-blue-600 text-white ml-1">{lastResult.classification?.category}</Badge>
                      {" / "}{lastResult.classification?.subcategory}
                      {lastResult.content_summary && <p className="mt-1 text-gray-400">{lastResult.content_summary}</p>}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Stats */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4" /> Categories
              </h2>
              <Button onClick={handleReorganize} disabled={ingesting} variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">
                <RefreshCw className="w-3.5 h-3.5" /> Reorganize All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter(null)}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                  !filter ? "bg-blue-600 text-white border-blue-600" : "bg-[#111] text-gray-400 border-white/10 hover:text-white")}
              >
                All ({assets.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setFilter(c.category)}
                  className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filter === c.category ? "bg-blue-600 text-white border-blue-600" : "bg-[#111] text-gray-400 border-white/10 hover:text-white")}
                >
                  {c.category} ({c.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111] border-white/10 text-white pl-10"
          />
        </div>

        {/* Asset List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
            Loading assets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assets ingested yet. Paste a file URL above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((asset) => (
              <Card key={asset.id} className="bg-[#111] border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-500 shrink-0" />
                        <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-[10px]">{asset.category}</Badge>
                        <Badge variant="outline" className="text-gray-400 border-white/10 text-[10px]">{asset.subcategory}</Badge>
                        <Badge variant="outline" className="text-gray-500 border-white/10 text-[10px]">{asset.source_type}</Badge>
                      </div>
                      {asset.content_summary && (
                        <p className="text-xs text-gray-500 line-clamp-2">{asset.content_summary}</p>
                      )}
                      {asset.file_count > 0 && (
                        <p className="text-xs text-gray-600 mt-1">{asset.file_count} files detected</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
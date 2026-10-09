import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Globe, Star, CheckCircle2 } from "lucide-react";

export default function NearMeVariations({ businessName, industry }) {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("godModeSeo", {
        action: "generate_nearme_variations",
        business_name: businessName || industry,
        industry,
      });
      setVariations(res.data?.variations || res.variations || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const typeColor = (type) => {
    const colors = {
      exact_nearme: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      prefix_nearme: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      nearyou: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      near: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      city_nearme: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      name_city_nearme: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      nearme_service: "bg-green-500/20 text-green-300 border-green-500/30",
      hyphenated: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      verb_nearme: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      nearme_city: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[type] || "bg-white/10 text-white/60 border-white/20";
  };

  return (
    <Card className="p-6 bg-zinc-900 border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> NearMe.com 100 Variations
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Generates 100 variations of "{businessName || industry}" combined with NearMe, NearYou, and city patterns
          </p>
        </div>
        <Button onClick={generate} disabled={loading || (!businessName && !industry)} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
          {loading ? "Generating..." : "Generate 100"}
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-md p-2 text-xs text-red-400 mb-3">{error}</div>}

      {variations.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">{variations.length} variations</Badge>
            <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">Top 20 AI-scored</Badge>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-96 overflow-y-auto">
            {variations.map((v) => (
              <div key={v.id} className="p-2 rounded-md bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-white truncate">{v.domain}</p>
                  <Badge variant="outline" className={`text-[10px] mt-0.5 ${typeColor(v.type)}`}>{v.type}</Badge>
                </div>
                {v.seo_score && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{v.seo_score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!variations.length && !loading && (
        <div className="text-center py-8">
          <Globe className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Generate 100 NearMe.com URL variations with AI scoring</p>
        </div>
      )}
    </Card>
  );
}
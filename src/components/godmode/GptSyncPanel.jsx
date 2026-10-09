import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Globe, Palette, FileText, Link2, CheckCircle2, Sparkles } from "lucide-react";

export default function GptSyncPanel({ structure, winner, marketData }) {
  if (!structure) return null;

  const { site_name, tagline, hero, services, color_scheme, page_structure, schema_types, faq } = structure;

  return (
    <Card className="p-5 bg-zinc-900 border-cyan-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-white">GPT Synced — Website Structure Generated</h3>
        <Badge className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 ml-auto">Claude Sonnet 5</Badge>
      </div>

      {/* Site identity */}
      <div className="p-3 rounded-md bg-cyan-500/5 border border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">{site_name}</span>
        </div>
        <p className="text-xs text-white/60">{tagline}</p>
      </div>

      {/* Hero section */}
      {hero && (
        <div className="p-3 rounded-md bg-white/5 border border-white/10 mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Hero Section</p>
          <p className="text-sm font-bold text-white mb-1">{hero.headline}</p>
          <p className="text-xs text-white/60 mb-2">{hero.subheadline}</p>
          <div className="flex items-center gap-2">
            <Badge className="text-xs bg-yellow-500/10 text-yellow-300 border-yellow-500/20">{hero.cta_text}</Badge>
            {hero.trust_badges?.map((b, i) => (
              <Badge key={i} variant="outline" className="text-xs text-white/50 border-white/10">{b}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Services ({services.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {services.map((s, i) => (
              <div key={i} className="p-2 rounded-md bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white">{s.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{s.description}</p>
                {s.search_keyword && <Badge variant="outline" className="text-[9px] text-blue-300 border-blue-500/20 mt-1">{s.search_keyword}</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color scheme */}
      {color_scheme && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> Color Scheme</p>
          <div className="flex gap-2">
            {Object.entries(color_scheme).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <div className="w-6 h-6 rounded border border-white/20" style={{ background: val }} />
                <span className="text-[10px] text-white/50">{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page structure */}
      {page_structure && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Page Structure</p>
          <div className="space-y-1">
            {page_structure.homepage_sections && (
              <p className="text-xs text-white/70"><span className="text-white/40">Homepage:</span> {page_structure.homepage_sections.join(' → ')}</p>
            )}
            {page_structure.city_page_template && (
              <p className="text-xs text-white/70"><span className="text-white/40">City pages:</span> {page_structure.city_page_template}</p>
            )}
            {page_structure.city_service_page_template && (
              <p className="text-xs text-white/70"><span className="text-white/40">City+Service:</span> {page_structure.city_service_page_template}</p>
            )}
          </div>
        </div>
      )}

      {/* Schema + internal linking */}
      <div className="flex flex-wrap gap-2 mb-3">
        {schema_types?.map((s, i) => (
          <Badge key={i} className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">{s}</Badge>
        ))}
      </div>

      {/* FAQ preview */}
      {faq?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-2">FAQ ({faq.length} items)</p>
          <div className="space-y-1">
            {faq.slice(0, 3).map((f, i) => (
              <div key={i} className="text-xs text-white/60">
                <span className="text-white/40">Q:</span> {f.question}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/5 border border-green-500/20">
        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        <p className="text-xs text-white/70">
          GPT structured <span className="font-bold text-white">{winner.page_count}</span> pages across <span className="font-bold text-white">{winner.cities}</span> cities.
          P50 projection: <span className="font-bold text-green-400">${(winner.p50?.profit_12mo || 0).toLocaleString()}/yr profit</span>
        </p>
      </div>
    </Card>
  );
}
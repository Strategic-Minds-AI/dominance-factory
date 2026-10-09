import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  Copy, Check, Code2, Palette, Layout, Type, Sparkles,
  Layers, BookOpen, Zap, Shield, Globe, CheckCircle2, Eye
} from 'lucide-react';
import {
  ENDPOINT_URL, API_SCHEMA, BRAND_TOKENS, SECTIONS, ARCHETYPES,
  BEST_PRACTICES, assembleTemplate
} from '@/lib/websiteTemplates';

function CopyBlock({ content, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="text-xs font-mono bg-[#0a0a0a] text-gray-300 rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}

export default function WebsiteLibrary() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFrontend, setActiveFrontend] = useState(null);
  const [setting, setSetting] = useState(null);

  // Load the currently active frontend template (if any)
  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Pack.filter(
          { source: 'frontend_template', status: 'approved' },
          { sort: '-created_date', limit: 1 }
        );
        if (items.length > 0) setActiveFrontend(items[0]);
      } catch { /* no active frontend yet */ }
    })();
  }, []);

  const setAsFrontend = async (archetype) => {
    setSetting(archetype.id);
    try {
      const html = assembleTemplate(archetype);
      // Un-approve any previous frontend template
      const { items: existing } = await base44.entities.Pack.filter(
        { source: 'frontend_template', status: 'approved' },
        { limit: 50 }
      );
      for (const p of existing) {
        await base44.entities.Pack.update(p.id, { status: 'rejected' });
      }
      // Create the new active frontend template
      const pack = await base44.entities.Pack.create({
        name: `Frontend — ${archetype.name}`,
        kind: 'full_site',
        preview_html: html,
        brand_tokens: BRAND_TOKENS,
        source: 'frontend_template',
        submitted_by_label: 'Admin',
        status: 'approved',
        metadata: JSON.stringify({ archetype_id: archetype.id, is_frontend: true }),
      });
      setActiveFrontend(pack);
    } catch (err) {
      console.error('Failed to set frontend:', err);
    } finally {
      setSetting(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'api', label: 'API Schema', icon: Code2 },
    { id: 'sections', label: 'Section Library', icon: Layers },
    { id: 'archetypes', label: 'Archetypes', icon: Globe },
    { id: 'brand', label: 'Brand Tokens', icon: Palette },
    { id: 'practices', label: 'Best Practices', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Active Frontend Banner */}
      {activeFrontend && (
        <Card className="p-4 flex items-center gap-3 bg-[#0a0a0a] text-white border-0">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Active Frontend: {activeFrontend.name}</p>
            <p className="text-xs text-gray-400">Live at /frontend</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 border-white/20 text-white hover:bg-white/10" asChild>
            <a href="/frontend" target="_blank"><Eye className="h-3.5 w-3.5 mr-1" /> View Live</a>
          </Button>
        </Card>
      )}

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0a0a0a] text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Website Creation Library</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            A complete reference for GPT (or any AI tool) to generate websites that submit directly
            to ApexForge. Pick an archetype from the Archetypes tab and click "Use as Frontend"
            to set it as your system's public-facing page.
          </p>
          <div className="grid grid-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border bg-muted/50">
              <Code2 className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">API Schema</h4>
              <p className="text-xs text-muted-foreground">Full request body spec with all fields and types.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Layers className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Section Library</h4>
              <p className="text-xs text-muted-foreground">8 pre-built sections: hero, features, pricing, testimonials, CTA, stats, FAQ.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Globe className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Archetypes</h4>
              <p className="text-xs text-muted-foreground">5 website types — pick one to set as your frontend.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <Palette className="h-5 w-5 mb-2 text-primary" />
              <h4 className="font-semibold text-sm mb-1">Brand Tokens</h4>
              <p className="text-xs text-muted-foreground">JSON schema for colors, fonts, radius, shadows.</p>
            </div>
          </div>
        </Card>
      )}

      {/* API Schema */}
      {activeTab === 'api' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">API Schema — POST {ENDPOINT_URL}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Send a JSON POST with <code className="bg-muted px-1 rounded">sync_token</code> in the body.
            All HTML must be self-contained (inline CSS, no external scripts).
          </p>
          <CopyBlock content={API_SCHEMA} label="Request body (JSON)" />
          <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between gap-2">
            <code className="text-xs font-mono break-all">{ENDPOINT_URL}</code>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(ENDPOINT_URL)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* Section Library */}
      {activeTab === 'sections' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Section Library — {Object.keys(SECTIONS).length} Components</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-built, copy-paste HTML sections. Each is self-contained and uses CSS variables from the scaffold.
          </p>
          <div className="space-y-4">
            {Object.entries(SECTIONS).map(([id, section]) => (
              <div key={id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{section.name}</span>
                  <code className="text-xs text-muted-foreground ml-auto">#{id}</code>
                </div>
                <CopyBlock content={section.html} label={`Section: ${section.name}`} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Archetypes — with "Use as Frontend" buttons */}
      {activeTab === 'archetypes' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Website Archetypes — {ARCHETYPES.length} Types</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick an archetype and click "Use as Frontend" to set it as your system's public page at <code className="bg-muted px-1 rounded">/frontend</code>.
          </p>
          <div className="space-y-3">
            {ARCHETYPES.map((arch) => {
              const isActive = activeFrontend?.metadata?.includes(arch.id);
              return (
                <div key={arch.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{arch.name}</h4>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Niches:</strong> {arch.niche}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setAsFrontend(arch)}
                      disabled={setting === arch.id || isActive}
                      className="shrink-0"
                    >
                      {setting === arch.id ? (
                        <>Setting…</>
                      ) : isActive ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active</>
                      ) : (
                        <><Zap className="h-3.5 w-3.5 mr-1" /> Use as Frontend</>
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {arch.sections.map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded bg-muted font-mono">#{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{arch.notes}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Brand Tokens */}
      {activeTab === 'brand' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Brand Tokens — JSON Schema</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pass as a JSON string in the <code className="bg-muted px-1 rounded">brand_tokens</code> field.
          </p>
          <CopyBlock content={BRAND_TOKENS} label="brand_tokens (JSON string)" />
        </Card>
      )}

      {/* Best Practices */}
      {activeTab === 'practices' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Best Practices — {BEST_PRACTICES.length} Rules</h3>
          </div>
          <div className="space-y-2">
            {BEST_PRACTICES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm">{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Cog, Workflow, Plug, Layout, BookOpen, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// ── DETERMINISTIC COLOR CODING SYSTEM ──
// GREEN  = Complete / Built / Operational
// YELLOW = Partial / In Progress / Blocked
// RED    = Gap / Missing / Not Started
// BLUE   = Section headers / Navigation

const COLORS = {
  complete: { bg: "bg-green-500/5", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-500", label: "Complete" },
  partial:  { bg: "bg-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-500", label: "Partial" },
  gap:      { bg: "bg-red-500/5",    border: "border-red-500/30",    text: "text-red-400",    dot: "bg-red-500",    label: "Gap" },
  section:  { bg: "bg-blue-500/5",   border: "border-blue-500/30",   text: "text-blue-400",   dot: "bg-blue-500",    label: "Section" },
};

const ENTITY_CATALOG = [
  { name: "OnboardingSession", category: "Onboarding", desc: "AI-assisted onboarding sessions with compounded context" },
  { name: "Website", category: "Website Factory", desc: "Website definitions and templates" },
  { name: "Pack", category: "Website Factory", desc: "External website mockup submissions for review" },
  { name: "SystemTemplate", category: "Website Factory", desc: "Library of deployable system templates" },
  { name: "ProgrammaticRule", category: "SEO Engine", desc: "Google compliance rules for programmatic page generation" },
  { name: "GeneratedPage", category: "SEO Engine", desc: "AI-generated location/service pages with compliance scores" },
  { name: "LaunchCampaign", category: "SEO Engine", desc: "Batch page generation campaigns for 100s-1000s of locations" },
  { name: "SocialPost", category: "Social Media", desc: "Generated social media content" },
  { name: "SocialAccount", category: "Social Media", desc: "Connected social media accounts" },
  { name: "PostSchedule", category: "Social Media", desc: "Scheduled social media posts" },
  { name: "Agent", category: "Super Agents", desc: "Autonomous AI agent definitions" },
  { name: "AgentTask", category: "Super Agents", desc: "Tasks assigned to autonomous agents" },
  { name: "MediaAsset", category: "Media Studio", desc: "AI-generated images, videos, and graphics" },
  { name: "ProvisioningJob", category: "Deployment", desc: "Website/system deployment jobs (Railway, Vercel, Supabase)" },
  { name: "OutreachCampaign", category: "Outreach", desc: "Email/SMS/MMS/WhatsApp outreach campaigns" },
  { name: "Opportunity", category: "Intelligence Hub", desc: "Market opportunities and demand themes" },
  { name: "HubProduct", category: "Intelligence Hub", desc: "Product catalog with benchmarking scores" },
  { name: "InfoCategory", category: "Intelligence Hub", desc: "Information category rankings and value scores" },
  { name: "SwarmGenerator", category: "Intelligence Hub", desc: "Agent swarm generation patterns" },
  { name: "WorkflowPack", category: "Intelligence Hub", desc: "Workflow state machine definitions" },
  { name: "ConnectorEntry", category: "Intelligence Hub", desc: "Integration connector catalog" },
  { name: "PromptEntry", category: "Intelligence Hub", desc: "Reusable AI prompt library" },
  { name: "DemandTheme", category: "Intelligence Hub", desc: "High-signal demand themes by domain" },
  { name: "BuyerPersona", category: "Intelligence Hub", desc: "Buyer persona profiles and channels" },
  { name: "ProblemPattern", category: "Intelligence Hub", desc: "Problem pattern definitions by domain" },
  { name: "DiscoveryMethod", category: "Intelligence Hub", desc: "Methods for discovering money-making opportunities" },
  { name: "ContractorPersona", category: "Intelligence Hub", desc: "Contractor persona profiles with AI adoption metrics" },
  { name: "ContractorStep", category: "Intelligence Hub", desc: "Contractor workflow steps with AI enhancement" },
  { name: "ContractorTechOption", category: "Intelligence Hub", desc: "Technology options for contractor workflow steps" },
];

const FUNCTION_CATALOG = [
  { name: "onboardingAI", desc: "AI-assisted onboarding: field completion, vision generation, topic discovery, skip trace, Google requirements" },
  { name: "chatEdit", desc: "AI chat-based visual editor for website HTML editing" },
  { name: "generatePage", desc: "Generate and store AI-written location/service pages with compliance checking" },
  { name: "processGenerationQueue", desc: "Process queued page-generation jobs in batches with retry logic" },
  { name: "launchCampaign", desc: "Launch batch page-generation campaigns with CSV support" },
  { name: "generateSocialContent", desc: "Generate social media content for posts" },
  { name: "generateMedia", desc: "Generate AI images, videos, and media assets" },
  { name: "executeAgentTask", desc: "Execute autonomous agent tasks" },
  { name: "ingestPack", desc: "Ingest external website pack submissions via shared secret" },
  { name: "provisionApprovedPack", desc: "Provision approved packs to Railway/Vercel/Supabase" },
  { name: "provisionSystem", desc: "Provision full systems with domain configuration" },
  { name: "sendOutreach", desc: "Send email/SMS/MMS outreach campaigns" },
  { name: "dailyFollowUp", desc: "Daily automated follow-up sequence for leads" },
];

const WORKFLOW_CATALOG = [
  { name: "Generation Queue Processor", desc: "Processes page generation queue in batches", status: "complete" },
  { name: "Generation Queue Drain", desc: "Drains remaining generation queue items", status: "complete" },
  { name: "Pack Approval Provisioning", desc: "Auto-provisions packs when approved", status: "complete" },
  { name: "Social Media Auto-Generator", desc: "Automatically generates social media content", status: "partial" },
  { name: "Daily Follow-Up Sequence", desc: "Daily follow-up automation for leads", status: "partial" },
];

const CONNECTOR_CATALOG = [
  { name: "Google Calendar", type: "googlecalendar", desc: "Calendar events and scheduling", status: "complete" },
  { name: "Gmail", type: "gmail", desc: "Email sending and reading", status: "complete" },
  { name: "Google Drive", type: "googledrive", desc: "File storage and management", status: "complete" },
  { name: "Google Docs", type: "googledocs", desc: "Document creation and editing", status: "complete" },
  { name: "Google Sheets", type: "googlesheets", desc: "Spreadsheet data management", status: "complete" },
  { name: "Google Tasks", type: "googletasks", desc: "Task management", status: "complete" },
  { name: "GitHub", type: "github", desc: "Repository management and code sync", status: "complete" },
  { name: "Supabase", type: "supabase", desc: "Database and backend provisioning", status: "complete" },
  { name: "HubSpot", type: "hubspot", desc: "CRM and marketing automation", status: "complete" },
];

const PAGE_CATALOG = [
  { name: "Onboarding Pipeline", path: "/onboarding", desc: "AI-assisted onboarding with Google requirements, vision, topics, skip trace, blueprint, and gap analysis", status: "complete" },
  { name: "System Contents", path: "/contents", desc: "This page — full system catalog and gap analysis", status: "complete" },
  { name: "Dashboard", path: "/dashboard", desc: "System overview and statistics", status: "complete" },
  { name: "Website Library", path: "/websites", desc: "Browse and manage websites", status: "complete" },
  { name: "Social Media", path: "/social", desc: "Social media content library and scheduling", status: "complete" },
  { name: "Launch Pad", path: "/launch", desc: "Programmatic page generation campaigns", status: "complete" },
  { name: "Super Agents", path: "/agents", desc: "Autonomous agent management", status: "complete" },
  { name: "Pack Review", path: "/packs", desc: "Review and approve external pack submissions", status: "complete" },
  { name: "GPT Sync", path: "/sync", desc: "External submission endpoint documentation", status: "complete" },
  { name: "Visual Editor", path: "/editor", desc: "AI-powered visual website editor", status: "complete" },
  { name: "Dominance Shell", path: "/dominance", desc: "Command center with entity browser and function execution", status: "complete" },
  { name: "Intelligence Hub", path: "/intelligence", desc: "Market intelligence and opportunity analysis", status: "complete" },
  { name: "Outreach", path: "/outreach", desc: "Outreach campaign management", status: "complete" },
  { name: "Media Studio", path: "/media", desc: "AI media generation (images, videos, graphics)", status: "complete" },
  { name: "Provisioning", path: "/provisioning", desc: "System deployment and infrastructure management", status: "complete" },
  { name: "Frontend Preview", path: "/frontend", desc: "Preview approved packs as system frontend", status: "complete" },
];

const GAPS = [
  { category: "Per-Site Architecture", items: [
    { name: "Per-Site Admin Portal", status: "gap", desc: "Standard admin portal template not yet deployed per-site instance" },
    { name: "Per-Site Client Portal", status: "gap", desc: "Business owner operating system not yet deployed per-site instance" },
    { name: "Per-Site AI Chat Orchestrator", status: "gap", desc: "Autonomous chat agent with full read/write/execute not deployed per-site" },
    { name: "Per-Site Super Agents", status: "partial", desc: "Agent entity exists but not deployed as standard per-site autonomous agents" },
    { name: "Per-Site Secret Management", status: "gap", desc: "Each site needs its own secret vault for API keys and credentials" },
    { name: "Multi-Tenant Data Isolation", status: "gap", desc: "Per-site data isolation architecture not implemented" },
  ]},
  { category: "Social Media Automation", items: [
    { name: "Auto-Posting to All Platforms", status: "partial", desc: "Content generation exists; direct API posting to platforms needs platform connectors" },
    { name: "AI Comment Engagement", status: "gap", desc: "AI that reads and replies to comments on social media posts" },
    { name: "AI DM Responses", status: "gap", desc: "AI that responds to direct messages from social media users" },
    { name: "Automated Video Creation", status: "partial", desc: "GenerateVideo integration exists; per-site automated video pipeline not built" },
    { name: "Automated Image Creation", status: "partial", desc: "GenerateImage exists; per-site automated image pipeline not built" },
  ]},
  { category: "SEO / AEO / GEO", items: [
    { name: "Google Business Profile Integration", status: "gap", desc: "No Google Business Profile connector for local SEO automation" },
    { name: "Google Search Console Integration", status: "gap", desc: "Connector available but not connected for indexation tracking" },
    { name: "AEO Optimization Module", status: "partial", desc: "Requirements defined; automated AEO content generation not built" },
    { name: "GEO Optimization Module", status: "partial", desc: "Requirements defined; automated GEO content generation not built" },
    { name: "Backlink Automation", status: "gap", desc: "No automated backlink building or monitoring system" },
    { name: "Local Citation Builder", status: "gap", desc: "No automated local citation building across directories" },
    { name: "Review Management Automation", status: "gap", desc: "No automated review generation and response system" },
  ]},
  { category: "Scale Infrastructure", items: [
    { name: "Bulk Site Deployment Pipeline", status: "partial", desc: "ProvisioningJob exists; bulk auto-deploy of 1000s of sites not built" },
    { name: "Content Spinning / Variation Engine", status: "gap", desc: "Unique content variation engine for millions of pages not built" },
    { name: "Per-Site Analytics Dashboard", status: "gap", desc: "Each site needs its own traffic and performance analytics" },
    { name: "Per-Site CRM", status: "gap", desc: "Each site needs a built-in CRM for lead management" },
    { name: "Per-Site Booking/Scheduling", status: "gap", desc: "Each site needs built-in appointment booking" },
    { name: "Per-Site Email Marketing", status: "gap", desc: "Each site needs automated email marketing sequences" },
    { name: "Per-Site SMS Marketing", status: "gap", desc: "Each site needs SMS marketing via Telnyx" },
    { name: "Domain Auto-Purchase", status: "gap", desc: "Automated domain purchasing via GoDaddy for new sites" },
  ]},
];

// ── Helper: compute section completion ──
function sectionStats(items) {
  const total = items.length;
  const complete = items.filter(i => i.status === "complete").length;
  const partial = items.filter(i => i.status === "partial").length;
  const gap = items.filter(i => i.status === "gap").length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
  return { total, complete, partial, gap, pct };
}

// ── Status Check Component ──
function StatusCheck({ status }) {
  const c = COLORS[status] || COLORS.complete;
  if (status === "complete") return <CheckCircle2 className={`w-4 h-4 ${c.text} shrink-0`} />;
  if (status === "partial") return <AlertTriangle className={`w-4 h-4 ${c.text} shrink-0`} />;
  return <XCircle className={`w-4 h-4 ${c.text} shrink-0`} />;
}

// ── Progress Bar Component ──
function ProgressBar({ pct }) {
  const color = pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : pct > 0 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-white/60 shrink-0 w-10 text-right">{pct}%</span>
    </div>
  );
}

// ── Collapsible Section ──
function CollapsibleSection({ number, title, icon: Icon, stats, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = COLORS.section;
  return (
    <Card className={`${c.bg} ${c.border} border overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
          <Icon className={`w-5 h-5 ${c.text}`} />
          <div className="text-left">
            <h2 className="text-sm font-bold text-white">{number}. {title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-green-400">{stats.complete} complete</span>
              {stats.partial > 0 && <span className="text-xs text-yellow-400">{stats.partial} partial</span>}
              {stats.gap > 0 && <span className="text-xs text-red-400">{stats.gap} gaps</span>}
              <span className="text-xs text-white/40">· {stats.total} total</span>
            </div>
          </div>
        </div>
        <div className="w-32 shrink-0"><ProgressBar pct={stats.pct} /></div>
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </Card>
  );
}

export default function SystemContents() {
  const [entityCounts, setEntityCounts] = useState({});

  useEffect(() => {
    const loadCounts = async () => {
      const counts = {};
      for (const e of ENTITY_CATALOG) {
        try {
          const count = await base44.entities[e.name]?.count?.({});
          if (typeof count === "number") counts[e.name] = count;
        } catch {}
      }
      setEntityCounts(counts);
    };
    loadCounts();
  }, []);

  // ── Compute all section stats ──
  const entityStats = sectionStats(ENTITY_CATALOG.map(() => ({ status: "complete" })));
  const functionStats = sectionStats(FUNCTION_CATALOG.map(() => ({ status: "complete" })));
  const workflowStats = sectionStats(WORKFLOW_CATALOG);
  const connectorStats = sectionStats(CONNECTOR_CATALOG);
  const pageStats = sectionStats(PAGE_CATALOG);
  const allGapItems = GAPS.flatMap(g => g.items);
  const gapStats = sectionStats(allGapItems);

  // ── Overall system stats ──
  const allItems = [
    ...ENTITY_CATALOG.map(() => ({ status: "complete" })),
    ...FUNCTION_CATALOG.map(() => ({ status: "complete" })),
    ...WORKFLOW_CATALOG,
    ...CONNECTOR_CATALOG,
    ...PAGE_CATALOG,
    ...allGapItems,
  ];
  const overallStats = sectionStats(allItems);

  // ── Group entities by category ──
  const entityCategories = {};
  ENTITY_CATALOG.forEach((e) => {
    if (!entityCategories[e.category]) entityCategories[e.category] = [];
    entityCategories[e.category].push(e);
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <BookOpen className="w-4 h-4" /> System Contents & Gap Analysis
          </div>
          <h1 className="text-2xl font-bold text-white">ApexForge System Catalog</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            A complete, categorized, color-coded catalog of every system, intelligence, and capability — with a check-off system showing what's complete, partial, and missing.
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-white/70">Complete</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-white/70">Partial / In Progress</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-white/70">Gap / Missing</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-white/70">Section</span></div>
        </div>

        {/* Overall Progress */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Overall System Completion</h2>
            <span className="text-2xl font-bold text-white font-mono">{overallStats.pct}%</span>
          </div>
          <ProgressBar pct={overallStats.pct} />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-md bg-green-500/5 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{overallStats.complete}</p>
              <p className="text-xs text-white/50">Complete</p>
            </div>
            <div className="text-center p-2 rounded-md bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{overallStats.partial}</p>
              <p className="text-xs text-white/50">Partial</p>
            </div>
            <div className="text-center p-2 rounded-md bg-red-500/5 border border-red-500/20">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{overallStats.gap}</p>
              <p className="text-xs text-white/50">Gaps</p>
            </div>
          </div>
        </Card>

        {/* Section 1: Data Entities — grouped by category */}
        <CollapsibleSection number="1" title="Data Entities — Intelligence Storage" icon={Database} stats={entityStats}>
          <div className="space-y-3">
            {Object.entries(entityCategories).map(([cat, entities]) => (
              <div key={cat} className="rounded-lg border border-white/10 overflow-hidden">
                <div className="px-3 py-2 bg-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{cat}</span>
                  <span className="text-xs text-white/40">({entities.length})</span>
                </div>
                <div className="divide-y divide-white/5">
                  {entities.map((e, i) => {
                    const globalIdx = ENTITY_CATALOG.indexOf(e);
                    const hasData = entityCounts[e.name] !== undefined && entityCounts[e.name] > 0;
                    return (
                      <div key={i} className="flex items-start gap-2 py-2 px-3 hover:bg-white/5">
                        <StatusCheck status="complete" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white font-mono">1.{globalIdx + 1}</span>
                            <span className="text-sm font-medium text-white">{e.name}</span>
                            {hasData ? (
                              <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">{entityCounts[e.name]} records</Badge>
                            ) : entityCounts[e.name] === 0 ? (
                              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">empty</Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{e.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 2: Backend Functions */}
        <CollapsibleSection number="2" title="Backend Functions — System Operations" icon={Cog} stats={functionStats}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FUNCTION_CATALOG.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-md bg-green-500/5 border border-green-500/20">
                <StatusCheck status="complete" />
                <div>
                  <p className="text-sm font-medium text-white"><span className="text-green-400/50 mr-1.5 font-mono">2.{i + 1}</span>{f.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 3: Workflows */}
        <CollapsibleSection number="3" title="Automated Workflows" icon={Workflow} stats={workflowStats}>
          <div className="space-y-2">
            {WORKFLOW_CATALOG.map((w, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-md ${COLORS[w.status].bg} border ${COLORS[w.status].border}`}>
                <StatusCheck status={w.status} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white"><span className={`${COLORS[w.status].text}/50 mr-1.5 font-mono`}>3.{i + 1}</span>{w.name}</p>
                    <Badge variant="outline" className={`text-xs ${COLORS[w.status].text} ${COLORS[w.status].border}`}>{COLORS[w.status].label}</Badge>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{w.desc}</p>
                  {w.status === "partial" && <p className="text-xs text-yellow-400/70 mt-1">⚠ Blocked by exhausted integration credits (resets 2026-10-12)</p>}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 4: Connectors */}
        <CollapsibleSection number="4" title="Connected Integrations" icon={Plug} stats={connectorStats}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONNECTOR_CATALOG.map((c, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-md bg-green-500/5 border border-green-500/20">
                <StatusCheck status="complete" />
                <div>
                  <p className="text-sm font-medium text-white"><span className="text-green-400/50 mr-1.5 font-mono">4.{i + 1}</span>{c.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 5: Pages */}
        <CollapsibleSection number="5" title="System Pages" icon={Layout} stats={pageStats}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PAGE_CATALOG.map((p, i) => (
              <Link key={i} to={p.path} className="flex items-start gap-2 p-3 rounded-md bg-green-500/5 border border-green-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors">
                <StatusCheck status="complete" />
                <div>
                  <p className="text-sm font-medium text-white"><span className="text-green-400/50 mr-1.5 font-mono">5.{i + 1}</span>{p.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 6: Gap Analysis */}
        <CollapsibleSection number="6" title="Gap Analysis — Path to Millions of Sites" icon={Layers} stats={gapStats}>
          <div className="space-y-4">
            {GAPS.map((gap, gi) => {
              const catStats = sectionStats(gap.items);
              return (
                <div key={gi} className="rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-red-400/50">6.{gi + 1}</span>
                      <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{gap.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400">{catStats.complete}</span>
                      <span className="text-xs text-yellow-400">{catStats.partial}</span>
                      <span className="text-xs text-red-400">{catStats.gap}</span>
                      <div className="w-20"><ProgressBar pct={catStats.pct} /></div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {gap.items.map((item, ii) => {
                      const c = COLORS[item.status];
                      return (
                        <div key={ii} className={`flex items-start gap-2 py-2 px-3 ${c.bg}`}>
                          <StatusCheck status={item.status} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-white/40">6.{gi + 1}.{ii + 1}</span>
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <Badge variant="outline" className={`text-xs ${c.text} ${c.border}`}>{c.label}</Badge>
                            </div>
                            <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* CTA */}
        <div className="text-center pb-8 pt-2">
          <Link to="/onboarding">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              Start New Onboarding <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
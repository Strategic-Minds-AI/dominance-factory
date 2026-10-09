import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Cog, Workflow, Plug, Layout, BookOpen, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";

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
  { name: "Generation Queue Processor", desc: "Processes page generation queue in batches" },
  { name: "Generation Queue Drain", desc: "Drains remaining generation queue items" },
  { name: "Pack Approval Provisioning", desc: "Auto-provisions packs when approved" },
  { name: "Social Media Auto-Generator", desc: "Automatically generates social media content" },
  { name: "Daily Follow-Up Sequence", desc: "Daily follow-up automation for leads" },
];

const CONNECTOR_CATALOG = [
  { name: "Google Calendar", type: "googlecalendar", desc: "Calendar events and scheduling" },
  { name: "Gmail", type: "gmail", desc: "Email sending and reading" },
  { name: "Google Drive", type: "googledrive", desc: "File storage and management" },
  { name: "Google Docs", type: "googledocs", desc: "Document creation and editing" },
  { name: "Google Sheets", type: "googlesheets", desc: "Spreadsheet data management" },
  { name: "Google Tasks", type: "googletasks", desc: "Task management" },
  { name: "GitHub", type: "github", desc: "Repository management and code sync" },
  { name: "Supabase", type: "supabase", desc: "Database and backend provisioning" },
  { name: "HubSpot", type: "hubspot", desc: "CRM and marketing automation" },
];

const PAGE_CATALOG = [
  { name: "Onboarding Pipeline", path: "/onboarding", desc: "AI-assisted onboarding with Google requirements, vision, topics, skip trace, blueprint, and gap analysis" },
  { name: "System Contents", path: "/contents", desc: "This page — full system catalog and gap analysis" },
  { name: "Dashboard", path: "/dashboard", desc: "System overview and statistics" },
  { name: "Website Library", path: "/websites", desc: "Browse and manage websites" },
  { name: "Social Media", path: "/social", desc: "Social media content library and scheduling" },
  { name: "Launch Pad", path: "/launch", desc: "Programmatic page generation campaigns" },
  { name: "Super Agents", path: "/agents", desc: "Autonomous agent management" },
  { name: "Pack Review", path: "/packs", desc: "Review and approve external pack submissions" },
  { name: "GPT Sync", path: "/sync", desc: "External submission endpoint documentation" },
  { name: "Visual Editor", path: "/editor", desc: "AI-powered visual website editor" },
  { name: "Dominance Shell", path: "/dominance", desc: "Command center with entity browser and function execution" },
  { name: "Intelligence Hub", path: "/intelligence", desc: "Market intelligence and opportunity analysis" },
  { name: "Outreach", path: "/outreach", desc: "Outreach campaign management" },
  { name: "Media Studio", path: "/media", desc: "AI media generation (images, videos, graphics)" },
  { name: "Provisioning", path: "/provisioning", desc: "System deployment and infrastructure management" },
  { name: "Frontend Preview", path: "/frontend", desc: "Preview approved packs as system frontend" },
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

const STATUS_CONFIG = {
  exists: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20", label: "Exists" },
  partial: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20", label: "Partial" },
  gap: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/20", label: "Gap" },
};

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

  const totalGaps = GAPS.reduce((acc, g) => acc + g.items.filter(i => i.status === "gap").length, 0);
  const totalPartial = GAPS.reduce((acc, g) => acc + g.items.filter(i => i.status === "partial").length, 0);
  const totalExists = GAPS.reduce((acc, g) => acc + g.items.filter(i => i.status === "exists").length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
            <BookOpen className="w-4 h-4" /> System Contents & Gap Analysis
          </div>
          <h1 className="text-2xl font-bold text-white">ApexForge System Catalog</h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            A complete catalog of every system, intelligence, and capability stored in ApexForge — plus a gap analysis identifying what's needed to achieve a fully autonomous programmatic SEO/AEO/GEO system capable of building millions of strategically created websites.
          </p>
        </div>

        {/* Gap Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-green-500/5 border-green-500/20 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{totalExists}</p>
            <p className="text-xs text-white/50">Capabilities Built</p>
          </Card>
          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20 text-center">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{totalPartial}</p>
            <p className="text-xs text-white/50">Partial / In Progress</p>
          </Card>
          <Card className="p-4 bg-red-500/5 border-red-500/20 text-center">
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{totalGaps}</p>
            <p className="text-xs text-white/50">Gaps to Fill</p>
          </Card>
        </div>

        {/* Entity Catalog */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" /> 1. Data Entities — Intelligence Storage ({ENTITY_CATALOG.length})
          </h2>
          <div className="space-y-1">
            {ENTITY_CATALOG.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white"><span className="text-blue-400/50 mr-1.5 font-mono">1.{i + 1}</span>{e.name}</span>
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">{e.category}</Badge>
                    {entityCounts[e.name] !== undefined && (
                      <span className="text-xs text-white/40">{entityCounts[e.name]} records</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Functions */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Cog className="w-4 h-4 text-blue-400" /> 2. Backend Functions — System Operations ({FUNCTION_CATALOG.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FUNCTION_CATALOG.map((f, i) => (
              <div key={i} className="p-3 rounded-md bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white"><span className="text-blue-400/50 mr-1.5 font-mono">2.{i + 1}</span>{f.name}</p>
                <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Workflows + Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 bg-zinc-900 border-white/10">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-400" /> 3. Automated Workflows ({WORKFLOW_CATALOG.length})
            </h2>
            <div className="space-y-2">
              {WORKFLOW_CATALOG.map((w, i) => (
                <div key={i} className="p-2 rounded-md bg-white/5">
                  <p className="text-sm font-medium text-white"><span className="text-blue-400/50 mr-1.5 font-mono">3.{i + 1}</span>{w.name}</p>
                  <p className="text-xs text-white/50">{w.desc}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5 bg-zinc-900 border-white/10">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Plug className="w-4 h-4 text-blue-400" /> 4. Connected Integrations ({CONNECTOR_CATALOG.length})
            </h2>
            <div className="space-y-2">
              {CONNECTOR_CATALOG.map((c, i) => (
                <div key={i} className="p-2 rounded-md bg-white/5">
                  <p className="text-sm font-medium text-white"><span className="text-blue-400/50 mr-1.5 font-mono">4.{i + 1}</span>{c.name}</p>
                  <p className="text-xs text-white/50">{c.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pages */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-400" /> 5. System Pages ({PAGE_CATALOG.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PAGE_CATALOG.map((p, i) => (
              <Link key={i} to={p.path} className="p-3 rounded-md bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors">
                <p className="text-sm font-medium text-white"><span className="text-blue-400/50 mr-1.5 font-mono">5.{i + 1}</span>{p.name}</p>
                <p className="text-xs text-white/50">{p.desc}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Gap Analysis */}
        <Card className="p-5 bg-zinc-900 border-white/10">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" /> 6. Gap Analysis — Path to Millions of Sites
          </h2>
          <div className="space-y-4">
            {GAPS.map((gap, gi) => (
              <div key={gi}>
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2"><span className="text-red-400/50 mr-1.5 font-mono">6.{gi + 1}</span>{gap.category}</h3>
                <div className="space-y-1">
                  {gap.items.map((item, ii) => {
                    const cfg = STATUS_CONFIG[item.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={ii} className={`flex items-start gap-2 p-2 rounded-md ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-4 h-4 ${cfg.color} shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white"><span className="text-red-400/40 mr-1.5 font-mono text-xs">6.{gi + 1}.{ii + 1}</span>{item.name}</p>
                            <Badge variant="outline" className={`text-xs ${cfg.color} ${cfg.border}`}>{cfg.label}</Badge>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center pb-8">
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
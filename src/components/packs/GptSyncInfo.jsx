import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal, Webhook, Database, Zap, Box, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

const ENDPOINT_URL = 'https://build-scale-dominate.base44.app/functions/systemGateway';

const ACTIONS = [
  {
    name: 'system_status',
    icon: Database,
    desc: 'Get full system overview — all entities, record counts, available functions, and actions',
    example: { action: 'system_status', sync_token: '<TOKEN>' },
  },
  {
    name: 'query_entity',
    icon: Database,
    desc: 'Query any entity with filters, sorting, pagination, and field selection',
    example: { action: 'query_entity', sync_token: '<TOKEN>', entity: 'Website', filter: {}, limit: 50, sort: '-created_date' },
  },
  {
    name: 'get_record',
    icon: Database,
    desc: 'Get a single record by ID from any entity',
    example: { action: 'get_record', sync_token: '<TOKEN>', entity: 'Pack', id: '<record_id>' },
  },
  {
    name: 'create_record',
    icon: Box,
    desc: 'Create a new record in any entity',
    example: { action: 'create_record', sync_token: '<TOKEN>', entity: 'Lead', data: { name: 'John', email: 'john@example.com' } },
  },
  {
    name: 'update_record',
    icon: Box,
    desc: 'Update an existing record by ID',
    example: { action: 'update_record', sync_token: '<TOKEN>', entity: 'Pack', id: '<id>', data: { status: 'approved' } },
  },
  {
    name: 'delete_record',
    icon: Box,
    desc: 'Delete a record by ID',
    example: { action: 'delete_record', sync_token: '<TOKEN>', entity: 'Pack', id: '<id>' },
  },
  {
    name: 'list_functions',
    icon: Zap,
    desc: 'List all available backend functions that can be invoked',
    example: { action: 'list_functions', sync_token: '<TOKEN>' },
  },
  {
    name: 'invoke_function',
    icon: Zap,
    desc: 'Invoke any backend function with a custom payload — full end-to-end system access',
    example: { action: 'invoke_function', sync_token: '<TOKEN>', function_name: 'autonomousResearchEngine', payload: { action: 'get_industries' } },
  },
  {
    name: 'ingest_pack',
    icon: Webhook,
    desc: 'Submit a website mockup pack for review (original GPT sync action)',
    example: { action: 'ingest_pack', sync_token: '<TOKEN>', name: 'Hero Mockup v2', kind: 'web_pack', preview_html: '<!doctype html>...</html>' },
  },
  {
    name: 'get_strategy_session',
    icon: Database,
    desc: 'Get the current active strategy/onboarding session',
    example: { action: 'get_strategy_session', sync_token: '<TOKEN>' },
  },
  {
    name: 'set_strategy_session',
    icon: Database,
    desc: 'Create or update a strategy session with research context',
    example: { action: 'set_strategy_session', sync_token: '<TOKEN>', data: { session_label: 'Roofing DOM', selected_topic: 'roofing' } },
  },
  {
    name: 'trigger_research',
    icon: Zap,
    desc: 'Run the full autonomous research engine for an industry',
    example: { action: 'trigger_research', sync_token: '<TOKEN>', industry: 'roofing' },
  },
  {
    name: 'trigger_social',
    icon: Zap,
    desc: 'Generate 30 days of social media content for an industry',
    example: { action: 'trigger_social', sync_token: '<TOKEN>', industry: 'roofing', platform: 'all' },
  },
  {
    name: 'trigger_god_mode',
    icon: Zap,
    desc: 'Run God Mode SEO analysis for an industry, URL, and location',
    example: { action: 'trigger_god_mode', sync_token: '<TOKEN>', industry: 'roofing', url: 'example.com', location: 'Austin, TX' },
  },
];

const ENTITIES = [
  'OnboardingSession', 'Website', 'Pack', 'SystemTemplate', 'ProgrammaticRule',
  'GeneratedPage', 'LaunchCampaign', 'SocialPost', 'SocialAccount', 'PostSchedule',
  'Agent', 'AgentTask', 'MediaAsset', 'ProvisioningJob', 'OutreachCampaign',
  'Opportunity', 'HubProduct', 'InfoCategory', 'SwarmGenerator', 'WorkflowPack',
  'ConnectorEntry', 'PromptEntry', 'DemandTheme', 'BuyerPersona', 'ProblemPattern',
  'DiscoveryMethod', 'ContractorPersona', 'ContractorStep', 'ContractorTechOption',
  'ResearchStrategy', 'ABTest', 'NearMeCandidate',
];

const FUNCTIONS = [
  'onboardingAI', 'chatEdit', 'generatePage', 'processGenerationQueue', 'launchCampaign',
  'generateSocialContent', 'generateMedia', 'executeAgentTask', 'ingestPack',
  'provisionApprovedPack', 'provisionSystem', 'sendOutreach', 'dailyFollowUp',
  'autonomousResearchEngine', 'socialMediaEngine', 'godModeSeo', 'generateBusinessName',
];

function ActionCard({ action }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = action.icon;
  const curl = `curl -X POST ${ENDPOINT_URL} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(action.example, null, 2)}'`;

  const copy = () => {
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 border-white/10 bg-zinc-900">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-white/40 mt-1 shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/40 mt-1 shrink-0" />}
        <Icon className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono text-white font-semibold">{action.name}</code>
          </div>
          <p className="text-xs text-white/50 mt-1">{action.desc}</p>
        </div>
      </button>
      {open && (
        <div className="mt-3 ml-7">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-white/40">curl example</span>
            <Button variant="ghost" size="sm" onClick={copy} className="h-6 text-xs">
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs font-mono bg-[#0a0a0a] text-gray-300 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
            {curl}
          </pre>
        </div>
      )}
    </Card>
  );
}

export default function GptSyncInfo() {
  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    navigator.clipboard.writeText(ENDPOINT_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Endpoint Header */}
      <Card className="p-6 space-y-4 bg-zinc-900 border-white/10">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-base text-white">Unified GPT System Gateway</h3>
          <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">Full System Access</Badge>
        </div>
        <p className="text-sm text-white/60">
          One endpoint gives GPT (or any external tool) complete end-to-end access to the entire platform —
          query and modify any entity, invoke any backend function, trigger research, generate content,
          submit packs, and manage strategy sessions. All actions require your sync token.
        </p>

        <div className="rounded-md bg-[#0a0a0a] px-3 py-2 flex items-center justify-between gap-2 border border-white/10">
          <code className="text-xs font-mono text-gray-300 break-all">{ENDPOINT_URL}</code>
          <Button variant="ghost" size="sm" className="shrink-0 text-white/60" onClick={copyUrl}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/40">
          <Terminal className="w-3.5 h-3.5" />
          <span>Send <code className="text-white/60 bg-white/5 px-1 rounded">sync_token</code> in the JSON body matching your <code className="text-white/60 bg-white/5 px-1 rounded">PACK_SYNC_TOKEN</code> secret.</span>
        </div>
      </Card>

      {/* Available Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Available Actions ({ACTIONS.length})</h3>
        </div>
        <div className="space-y-2">
          {ACTIONS.map((a) => <ActionCard key={a.name} action={a} />)}
        </div>
      </div>

      {/* Entity Registry */}
      <Card className="p-4 bg-zinc-900 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Accessible Entities ({ENTITIES.length})</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ENTITIES.map((e) => (
            <Badge key={e} variant="outline" className="text-xs text-green-400 border-green-500/20 font-mono">
              {e}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Function Registry */}
      <Card className="p-4 bg-zinc-900 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Invocable Functions ({FUNCTIONS.length})</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FUNCTIONS.map((f) => (
            <Badge key={f} variant="outline" className="text-xs text-yellow-400 border-yellow-500/20 font-mono">
              {f}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Quick Start */}
      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Quick Start</h3>
        </div>
        <pre className="text-xs font-mono bg-[#0a0a0a] text-gray-300 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`# 1. Get system status
curl -X POST ${ENDPOINT_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"action":"system_status","sync_token":"<TOKEN>"}'

# 2. Query all packs
curl -X POST ${ENDPOINT_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"action":"query_entity","sync_token":"<TOKEN>","entity":"Pack","filter":{},"limit":50}'

# 3. Trigger autonomous research
curl -X POST ${ENDPOINT_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"action":"trigger_research","sync_token":"<TOKEN>","industry":"roofing"}'`}
        </pre>
      </Card>
    </div>
  );
}
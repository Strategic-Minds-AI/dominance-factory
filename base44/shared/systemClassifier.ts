// Deterministic System Classification Engine
// Rule-based classification — no AI, no guessing. Every component is classified
// by deterministic pattern matching against its name and type.

export interface ClassifiedSystem {
  registry_key: string;
  system_name: string;
  system_type: string;
  category: string;
  subcategory: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  reuse_potential: string;
  tags: string[];
}

// Complete system registry — every known component in the platform
export const SYSTEM_REGISTRY = {
  entities: [
    "Website", "ProgrammaticRule", "SocialPost", "SocialAccount", "PostSchedule",
    "LaunchCampaign", "GeneratedPage", "Agent", "AgentTask", "MediaOutlet",
    "ProvisioningJob", "OutreachCampaign", "MediaAsset", "ResearchStrategy",
    "Pack", "ABTest", "OnboardingSession", "NearMeCandidate", "SystemTemplate",
    "HubProduct", "InfoCategory", "SwarmGenerator", "DiscoveryMethod",
    "ProblemPattern", "WorkflowPack", "PromptEntry", "DemandTheme",
    "ContractorPersona", "BuyerPersona", "ContractorStep", "ConnectorEntry",
    "ContractorTechOption", "Opportunity", "SystemInventory", "BenchmarkSystem"
  ],
  functions: [
    "autonomousResearchEngine", "autonomousAgent", "benchmarkEngine", "buildInitiation",
    "chatEdit", "cronRunner", "dailyFollowUp", "executeAgentTask",
    "generateBusinessName", "generateMedia", "generateMediaDirect", "generatePage",
    "generateSocialContent", "godModeSeo", "googleBackup", "googleWorkspace",
    "ingestAsset", "ingestPack", "launchCampaign", "onboardingAI",
    "processGenerationQueue", "provisionApprovedPack", "provisionSystem",
    "sendEmailDirect", "sendOutreach", "setupVercelCron", "socialMediaEngine",
    "supabaseConvergence", "systemGateway", "systemMonitor", "systemReflection",
    "systemScanner", "uploadFileDirect", "assetCategorizer"
  ],
  workflows: [
    "Generation Queue Processor", "Pack Approval Provisioning",
    "Daily Follow-Up Sequence", "Social Media Auto-Generator",
    "Generation Queue Drain", "System Reflection Scanner"
  ],
  connectors: [
    "supabase", "googlecalendar", "gmail", "googledrive", "googledocs",
    "googlesheets", "googletasks"
  ],
  pages: [
    "/", "/industries", "/seo-strategy", "/onboarding", "/god-mode",
    "/digital-dominance", "/research-engine", "/social-automation",
    "/ab-testing", "/analytics", "/dashboard", "/websites", "/social",
    "/launch", "/agents", "/packs", "/editor", "/dominance",
    "/intelligence", "/outreach", "/media", "/provisioning", "/sync",
    "/frontend", "/contents", "/library", "/agent-reference", "/gap-analysis",
    "/system-scanner", "/benchmark-engine", "/build-initiation", "/ingestion",
    "/reflection", "/google-workspace", "/system-monitor"
  ]
};

interface ClassificationRule {
  pattern: RegExp;
  category: string;
  subcategory: string;
}

const ENTITY_RULES: ClassificationRule[] = [
  { pattern: /social|post|account|schedule/i, category: "social_media", subcategory: "social_content" },
  { pattern: /media|asset/i, category: "media_production", subcategory: "media_assets" },
  { pattern: /outreach|campaign/i, category: "outreach_communication", subcategory: "outreach_campaigns" },
  { pattern: /agent|task/i, category: "agent_orchestration", subcategory: "agent_systems" },
  { pattern: /research|opportunity|demand|discovery/i, category: "research_intelligence", subcategory: "market_research" },
  { pattern: /provision/i, category: "provisioning_deployment", subcategory: "infrastructure" },
  { pattern: /ab|test|analytic/i, category: "analytics_reporting", subcategory: "performance_tracking" },
  { pattern: /website|page|pack/i, category: "content_generation", subcategory: "website_content" },
  { pattern: /seo|programmatic/i, category: "seo_optimization", subcategory: "programmatic_seo" },
  { pattern: /inventory|benchmark|template|system/i, category: "infrastructure", subcategory: "system_catalog" },
  { pattern: /onboarding|session/i, category: "ui_interface", subcategory: "onboarding" },
  { pattern: /nearme|candidate/i, category: "seo_optimization", subcategory: "domain_strategy" },
  { pattern: /connector|integration/i, category: "external_integration", subcategory: "connectors" },
  { pattern: /persona|buyer|contractor/i, category: "research_intelligence", subcategory: "persona_modeling" },
  { pattern: /hub|product|catalog|info|category/i, category: "data_storage", subcategory: "product_catalog" },
  { pattern: /workflow|swarm|prompt/i, category: "workflow_automation", subcategory: "automation_templates" },
  { pattern: /problem|pattern/i, category: "governance_security", subcategory: "pattern_analysis" },
];

const FUNCTION_RULES: ClassificationRule[] = [
  { pattern: /scanner|classifier|inventory/i, category: "governance_security", subcategory: "system_scanning" },
  { pattern: /benchmark|reverse/i, category: "research_intelligence", subcategory: "benchmark_engine" },
  { pattern: /generate|page|content|business/i, category: "content_generation", subcategory: "content_engine" },
  { pattern: /seo|godmode/i, category: "seo_optimization", subcategory: "seo_engine" },
  { pattern: /social/i, category: "social_media", subcategory: "social_engine" },
  { pattern: /media/i, category: "media_production", subcategory: "media_engine" },
  { pattern: /outreach|send/i, category: "outreach_communication", subcategory: "outreach_engine" },
  { pattern: /provision/i, category: "provisioning_deployment", subcategory: "deployment_engine" },
  { pattern: /agent|execute/i, category: "agent_orchestration", subcategory: "agent_execution" },
  { pattern: /research/i, category: "research_intelligence", subcategory: "research_engine" },
  { pattern: /onboarding/i, category: "ui_interface", subcategory: "onboarding_engine" },
  { pattern: /launch|campaign/i, category: "content_generation", subcategory: "launch_engine" },
  { pattern: /gateway|sync|ingest/i, category: "external_integration", subcategory: "gateway" },
  { pattern: /convergence|supabase/i, category: "infrastructure", subcategory: "infrastructure_convergence" },
  { pattern: /followup|daily/i, category: "workflow_automation", subcategory: "scheduled_automation" },
  { pattern: /chat|edit/i, category: "ai_engine", subcategory: "ai_editing" },
  { pattern: /queue/i, category: "workflow_automation", subcategory: "queue_processing" },
];

const WORKFLOW_RULES: ClassificationRule[] = [
  { pattern: /queue|generation|drain/i, category: "workflow_automation", subcategory: "queue_processing" },
  { pattern: /pack|approval|provision/i, category: "provisioning_deployment", subcategory: "approval_automation" },
  { pattern: /follow|up|daily/i, category: "outreach_communication", subcategory: "follow_up_automation" },
  { pattern: /social|media|auto/i, category: "social_media", subcategory: "social_automation" },
];

const CONNECTOR_RULES: ClassificationRule[] = [
  { pattern: /supabase/i, category: "infrastructure", subcategory: "database" },
  { pattern: /google|calendar|gmail|drive|docs|sheets|tasks/i, category: "external_integration", subcategory: "google_workspace" },
  { pattern: /slack/i, category: "external_integration", subcategory: "communication" },
  { pattern: /github/i, category: "external_integration", subcategory: "version_control" },
  { pattern: /hubspot|salesforce/i, category: "external_integration", subcategory: "crm" },
];

const PAGE_RULES: ClassificationRule[] = [
  { pattern: /scanner|benchmark|gap|library|content/i, category: "governance_security", subcategory: "system_reference" },
  { pattern: /industr|intelligence|research/i, category: "research_intelligence", subcategory: "research_interface" },
  { pattern: /seo|godmode|digital/i, category: "seo_optimization", subcategory: "seo_interface" },
  { pattern: /social/i, category: "social_media", subcategory: "social_interface" },
  { pattern: /media/i, category: "media_production", subcategory: "media_interface" },
  { pattern: /outreach/i, category: "outreach_communication", subcategory: "outreach_interface" },
  { pattern: /agent/i, category: "agent_orchestration", subcategory: "agent_interface" },
  { pattern: /analytic|ab|testing/i, category: "analytics_reporting", subcategory: "analytics_interface" },
  { pattern: /website|editor|frontend|pack/i, category: "content_generation", subcategory: "website_interface" },
  { pattern: /launch/i, category: "content_generation", subcategory: "launch_interface" },
  { pattern: /provision/i, category: "provisioning_deployment", subcategory: "provisioning_interface" },
  { pattern: /sync|gateway/i, category: "external_integration", subcategory: "gateway_interface" },
  { pattern: /dominance|shell/i, category: "governance_security", subcategory: "command_center" },
  { pattern: /onboarding/i, category: "ui_interface", subcategory: "onboarding_interface" },
  { pattern: /dashboard/i, category: "analytics_reporting", subcategory: "dashboard" },
];

export function classifyComponent(name: string, type: string): { category: string; subcategory: string } {
  let rules: ClassificationRule[];
  switch (type) {
    case "entity": rules = ENTITY_RULES; break;
    case "backend_function": rules = FUNCTION_RULES; break;
    case "workflow": rules = WORKFLOW_RULES; break;
    case "connector": rules = CONNECTOR_RULES; break;
    case "page": rules = PAGE_RULES; break;
    default: rules = ENTITY_RULES;
  }
  for (const rule of rules) {
    if (rule.pattern.test(name)) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }
  return { category: "data_storage", subcategory: "general" };
}

export function determineReusePotential(name: string, type: string): string {
  const highReuse = [/system|gateway|scanner|benchmark|inventory|classifier|generate|engine|website|page|pack|agent|social|media|seo|programmatic/i];
  const mediumReuse = [/outreach|campaign|launch|research|opportunity|provision|deploy|onboarding/i];
  for (const p of highReuse) if (p.test(name)) return "high";
  for (const p of mediumReuse) if (p.test(name)) return "medium";
  return "low";
}

export function buildDescription(name: string, type: string, category: string, subcategory: string): string {
  const typeLabel = type.replace(/_/g, " ");
  return `${name} — ${typeLabel} classified as ${category.replace(/_/g, " ")} / ${subcategory.replace(/_/g, " ")}`;
}

export function buildCapabilities(name: string, type: string): string[] {
  const caps: string[] = [];
  if (/generate|create|build/i.test(name)) caps.push("content_generation");
  if (/scan|classify|inventory|benchmark/i.test(name)) caps.push("system_analysis");
  if (/seo|programmatic|godmode/i.test(name)) caps.push("seo_optimization");
  if (/social|media/i.test(name)) caps.push("social_media_management");
  if (/agent|execute|task/i.test(name)) caps.push("agent_orchestration");
  if (/provision|deploy/i.test(name)) caps.push("deployment");
  if (/outreach|send|email/i.test(name)) caps.push("communication");
  if (/research|opportunity|intelligence/i.test(name)) caps.push("market_research");
  if (/analytic|test|ab/i.test(name)) caps.push("performance_tracking");
  if (/gateway|sync|ingest/i.test(name)) caps.push("external_integration");
  if (caps.length === 0) caps.push("data_management");
  return caps;
}

export function buildDependencies(name: string, type: string): string[] {
  const deps: string[] = [];
  if (type === "backend_function") {
    deps.push("base44_sdk");
    if (/generate|seo|social|media|research|benchmark/i.test(name)) deps.push("invoke_llm");
    if (/provision|deploy/i.test(name)) deps.push("vercel_api", "railway_api");
    if (/supabase|convergence/i.test(name)) deps.push("supabase_connector");
    if (/outreach|send|email/i.test(name)) deps.push("resend_api", "telnyx_api");
  }
  if (type === "page") deps.push("react_router", "base44_client");
  if (type === "workflow") deps.push("base44_workflows");
  if (type === "connector") deps.push("oauth");
  return deps;
}

export function buildTags(name: string, type: string, category: string): string[] {
  return [type, category, name.toLowerCase().replace(/\s+/g, "_")];
}

// Classify all components and return the full inventory
export function classifyAllSystems(): ClassifiedSystem[] {
  const results: ClassifiedSystem[] = [];

  for (const name of SYSTEM_REGISTRY.entities) {
    const { category, subcategory } = classifyComponent(name, "entity");
    results.push({
      registry_key: `entity:${name}`,
      system_name: name,
      system_type: "entity",
      category,
      subcategory,
      description: buildDescription(name, "entity", category, subcategory),
      capabilities: buildCapabilities(name, "entity"),
      dependencies: buildDependencies(name, "entity"),
      reuse_potential: determineReusePotential(name, "entity"),
      tags: buildTags(name, "entity", category),
    });
  }

  for (const name of SYSTEM_REGISTRY.functions) {
    const { category, subcategory } = classifyComponent(name, "backend_function");
    results.push({
      registry_key: `function:${name}`,
      system_name: name,
      system_type: "backend_function",
      category,
      subcategory,
      description: buildDescription(name, "backend_function", category, subcategory),
      capabilities: buildCapabilities(name, "backend_function"),
      dependencies: buildDependencies(name, "backend_function"),
      reuse_potential: determineReusePotential(name, "backend_function"),
      tags: buildTags(name, "backend_function", category),
    });
  }

  for (const name of SYSTEM_REGISTRY.workflows) {
    const { category, subcategory } = classifyComponent(name, "workflow");
    results.push({
      registry_key: `workflow:${name}`,
      system_name: name,
      system_type: "workflow",
      category,
      subcategory,
      description: buildDescription(name, "workflow", category, subcategory),
      capabilities: buildCapabilities(name, "workflow"),
      dependencies: buildDependencies(name, "workflow"),
      reuse_potential: determineReusePotential(name, "workflow"),
      tags: buildTags(name, "workflow", category),
    });
  }

  for (const name of SYSTEM_REGISTRY.connectors) {
    const { category, subcategory } = classifyComponent(name, "connector");
    results.push({
      registry_key: `connector:${name}`,
      system_name: name,
      system_type: "connector",
      category,
      subcategory,
      description: buildDescription(name, "connector", category, subcategory),
      capabilities: buildCapabilities(name, "connector"),
      dependencies: buildDependencies(name, "connector"),
      reuse_potential: determineReusePotential(name, "connector"),
      tags: buildTags(name, "connector", category),
    });
  }

  for (const path of SYSTEM_REGISTRY.pages) {
    const pageName = path === "/" ? "home" : path.replace(/^\//, "").replace(/-/g, "_");
    const { category, subcategory } = classifyComponent(pageName, "page");
    results.push({
      registry_key: `page:${path}`,
      system_name: pageName || "home",
      system_type: "page",
      category,
      subcategory,
      description: buildDescription(pageName, "page", category, subcategory),
      capabilities: buildCapabilities(pageName, "page"),
      dependencies: buildDependencies(pageName, "page"),
      reuse_potential: determineReusePotential(pageName, "page"),
      tags: buildTags(pageName, "page", category),
    });
  }

  return results;
}

// Find reusable internal assets for a given set of benchmark features
export function findReusableAssets(benchmarkFeatures: string[], inventory: ClassifiedSystem[]): ClassifiedSystem[] {
  const reusable: ClassifiedSystem[] = [];
  for (const feature of benchmarkFeatures) {
    const featureLower = feature.toLowerCase();
    for (const item of inventory) {
      const matchesCapability = item.capabilities.some(c => featureLower.includes(c.replace(/_/g, " ")));
      const matchesName = featureLower.includes(item.system_name.toLowerCase());
      const matchesCategory = featureLower.includes(item.category.replace(/_/g, " "));
      if ((matchesCapability || matchesName || matchesCategory) && item.reuse_potential !== "low") {
        if (!reusable.find(r => r.registry_key === item.registry_key)) {
          reusable.push(item);
        }
      }
    }
  }
  return reusable;
}
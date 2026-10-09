import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiComplete, MODELS } from "../../shared/vercelAiGateway.ts";

const ENTITIES = [
  "Website", "ProgrammaticRule", "SocialPost", "SocialAccount", "PostSchedule",
  "LaunchCampaign", "GeneratedPage", "Agent", "AgentTask", "MediaOutlet",
  "ProvisioningJob", "OutreachCampaign", "MediaAsset", "ResearchStrategy",
  "Pack", "ABTest", "OnboardingSession", "NearMeCandidate", "SystemTemplate",
  "HubProduct", "InfoCategory", "SwarmGenerator", "DiscoveryMethod",
  "ProblemPattern", "WorkflowPack", "PromptEntry", "DemandTheme",
  "ContractorPersona", "BuyerPersona", "ContractorStep", "ConnectorEntry",
  "ContractorTechOption", "Opportunity", "SystemInventory", "BenchmarkSystem",
  "BuildPlan",
];

const FUNCTIONS = [
  { name: "autonomousResearchEngine", desc: "Research and rank industries, strategies, opportunities" },
  { name: "benchmarkEngine", desc: "Benchmark top 3 competitors in any industry, reverse engineer them" },
  { name: "buildInitiation", desc: "Full build initiation: scan internal systems, benchmark competitors, gap analysis, phased build plan" },
  { name: "godModeSeo", desc: "Generate comprehensive SEO strategy for any industry and location" },
  { name: "generatePage", desc: "Generate a programmatic SEO page for a location/service" },
  { name: "generateBusinessName", desc: "Generate business names and domain ideas" },
  { name: "generateSocialContent", desc: "Generate social media posts" },
  { name: "generateMedia", desc: "Generate AI images and media assets" },
  { name: "launchCampaign", desc: "Create a page generation campaign" },
  { name: "processGenerationQueue", desc: "Process the page generation queue" },
  { name: "provisionSystem", desc: "Provision a new system (website, backend, full stack)" },
  { name: "provisionApprovedPack", desc: "Provision an approved pack to deployment" },
  { name: "sendOutreach", desc: "Send outreach campaigns via email, SMS, WhatsApp" },
  { name: "onboardingAI", desc: "AI-powered business onboarding pipeline" },
  { name: "chatEdit", desc: "Edit website content via natural language chat" },
  { name: "systemScanner", desc: "Scan and classify all internal systems deterministically" },
  { name: "systemGateway", desc: "External GPT sync gateway endpoint" },
  { name: "supabaseConvergence", desc: "Monitor Supabase project health and convergence" },
  { name: "dailyFollowUp", desc: "Send automated follow-up sequences to leads" },
  { name: "executeAgentTask", desc: "Execute a super agent task" },
  { name: "ingestPack", desc: "Ingest a pack from external GPT sync" },
  { name: "socialMediaEngine", desc: "Social media automation engine" },
];

function buildSystemPrompt(): string {
  return `You are ApexForge's Autonomous Agent — an AI with FULL, UNRESTRICTED access to the entire platform. You have ZERO limitations.

You can:
- READ any entity (query, get, count)
- WRITE any entity (create, update, delete)
- EXECUTE any backend function
- PROVISION systems, deploy websites, set up infrastructure
- RESEARCH industries, benchmark competitors, analyze markets
- SEARCH THE WEB for real-time information
- SIMULATE scenarios, strategies, and financial models
- CREATE pages, edit content, delete records — everything

AVAILABLE ENTITIES (${ENTITIES.length}):
${ENTITIES.join(", ")}

AVAILABLE BACKEND FUNCTIONS (${FUNCTIONS.length}):
${FUNCTIONS.map(f => `- ${f.name}: ${f.desc}`).join("\n")}

When the user sends a message, determine what actions to take and return ONLY a JSON object with this exact structure:
{
  "reply": "Your natural language response to the user — conversational, clear, and detailed",
  "actions": [
    {"type": "query", "entity": "EntityName", "query": {}, "limit": 10},
    {"type": "get", "entity": "EntityName", "id": "record_id"},
    {"type": "count", "entity": "EntityName", "query": {}},
    {"type": "create", "entity": "EntityName", "data": {"field": "value"}},
    {"type": "update", "entity": "EntityName", "id": "record_id", "data": {"field": "value"}},
    {"type": "delete", "entity": "EntityName", "id": "record_id"},
    {"type": "invoke", "function": "functionName", "payload": {"key": "value"}},
    {"type": "web_search", "query": "what to search for on the web"}
  ]
}

RULES:
- Be PROACTIVE: if the user says "set up a new HVAC business", create records, invoke research, benchmark competitors, and provision — ALL in one response.
- Always include a clear, conversational "reply" explaining what you did and what you found.
- Chain multiple actions together for complex multi-step operations.
- For web research, use the "web_search" action type.
- For function invocations, use the "invoke" action type with the function name and payload.
- You have ZERO limitations — execute everything the user asks for without hesitation.
- If the request is ambiguous, make reasonable assumptions and proceed.
- Keep your reply concise but informative. Use bullet points for lists.
- Do NOT include markdown formatting in your reply — use plain text only.
- Return ONLY the JSON object, no other text outside it.`;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'chat';

    if (action === 'chat') {
      const message = body.message || '';
      const history = body.history || [];
      if (!message.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });

      // Build conversation context
      const messages = [
        { role: 'system', content: buildSystemPrompt() },
        ...history.slice(-8).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text || h.content || '',
        })),
        { role: 'user', content: message },
      ];

      // Get AI response
      const textResponse = await aiComplete({
        model: MODELS.complex,
        messages,
        temperature: 0.4,
        max_tokens: 8192,
      });

      // Extract JSON from response
      let aiResponse: { reply: string; actions: any[] };
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          aiResponse = {
            reply: parsed.reply || textResponse,
            actions: Array.isArray(parsed.actions) ? parsed.actions : [],
          };
        } catch {
          aiResponse = { reply: textResponse, actions: [] };
        }
      } else {
        aiResponse = { reply: textResponse, actions: [] };
      }

      // Execute actions (limit to 5 to prevent excessive execution time)
      const actionResults: any[] = [];
      const actionsToRun = aiResponse.actions.slice(0, 5);

      for (const act of actionsToRun) {
        try {
          let result: any;
          switch (act.type) {
            case 'query': {
              const res = await base44.asServiceRole.entities[act.entity]?.filter(
                act.query || {},
                { limit: act.limit || 10, sort: '-created_date' }
              );
              const items = res?.items || [];
              result = {
                type: 'query', entity: act.entity, count: items.length,
                items: items.map((r: any) => ({
                  id: r.id,
                  name: r.name || r.title || r.system_name || r.industry || r.project_name || r.id,
                })),
              };
              break;
            }
            case 'get': {
              const record = await base44.asServiceRole.entities[act.entity]?.get(act.id);
              result = { type: 'get', entity: act.entity, record };
              break;
            }
            case 'count': {
              const count = await base44.asServiceRole.entities[act.entity]?.count(act.query || {});
              result = { type: 'count', entity: act.entity, count };
              break;
            }
            case 'create': {
              const record = await base44.asServiceRole.entities[act.entity]?.create(act.data);
              result = { type: 'create', entity: act.entity, id: record?.id, success: true };
              break;
            }
            case 'update': {
              await base44.asServiceRole.entities[act.entity]?.update(act.id, act.data);
              result = { type: 'update', entity: act.entity, id: act.id, success: true };
              break;
            }
            case 'delete': {
              await base44.asServiceRole.entities[act.entity]?.delete(act.id);
              result = { type: 'delete', entity: act.entity, id: act.id, success: true };
              break;
            }
            case 'invoke': {
              const origin = new URL(req.url).origin;
              const fnRes = await fetch(`${origin}/functions/${act.function}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': req.headers.get('Authorization') || '',
                },
                body: JSON.stringify(act.payload || {}),
                signal: AbortSignal.timeout(120000),
              });
              const fnData = await fnRes.json();
              result = { type: 'invoke', function: act.function, success: fnRes.ok, result: fnData };
              break;
            }
            case 'web_search': {
              const searchRes = await aiComplete({
                model: MODELS.websearch,
                messages: [{ role: 'user', content: act.query }],
                temperature: 0.2,
                max_tokens: 4096,
                online: true,
              });
              result = { type: 'web_search', query: act.query, result: searchRes.substring(0, 2000) };
              break;
            }
            default:
              result = { type: act.type, error: 'Unknown action type' };
          }
          actionResults.push(result);
        } catch (err: any) {
          actionResults.push({ type: act.type, entity: act.entity, error: err.message });
        }
      }

      // Build full reply with action results
      let fullReply = aiResponse.reply;
      if (actionResults.length > 0) {
        const resultLines = actionResults.map((r) => {
          if (r.error) return `  X ${r.type}${r.entity ? ' ' + r.entity : ''}: ${r.error}`;
          if (r.type === 'query') return `  > ${r.entity}: ${r.count} records found`;
          if (r.type === 'count') return `  > ${r.entity}: ${r.count} records`;
          if (r.type === 'create') return `  + ${r.entity}: created (${r.id})`;
          if (r.type === 'update') return `  ~ ${r.entity}: updated (${r.id})`;
          if (r.type === 'delete') return `  - ${r.entity}: deleted (${r.id})`;
          if (r.type === 'invoke') return `  ! ${r.function}: ${r.success ? 'completed' : 'failed'}`;
          if (r.type === 'web_search') return `  @ web search: completed`;
          return `  . ${r.type}: done`;
        });
        fullReply = aiResponse.reply + '\n\n--- Actions Executed ---\n' + resultLines.join('\n');
      }

      return Response.json({
        reply: fullReply,
        actions: actionResults,
        provider: 'vercel_ai_gateway',
      });
    }

    return Response.json({ error: 'Unknown action. Use: chat' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
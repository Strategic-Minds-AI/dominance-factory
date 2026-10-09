import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// ── Unified GPT System Gateway ──
// Gives GPT (or any external tool) full end-to-end access to the entire platform
// through a single secured endpoint. All actions require PACK_SYNC_TOKEN.

const ENTITY_REGISTRY = [
  'OnboardingSession', 'Website', 'Pack', 'SystemTemplate',
  'ProgrammaticRule', 'GeneratedPage', 'LaunchCampaign',
  'SocialPost', 'SocialAccount', 'PostSchedule',
  'Agent', 'AgentTask', 'MediaAsset',
  'ProvisioningJob', 'OutreachCampaign',
  'Opportunity', 'HubProduct', 'InfoCategory', 'SwarmGenerator',
  'WorkflowPack', 'ConnectorEntry', 'PromptEntry', 'DemandTheme',
  'BuyerPersona', 'ProblemPattern', 'DiscoveryMethod',
  'ContractorPersona', 'ContractorStep', 'ContractorTechOption',
  'ResearchStrategy', 'ABTest', 'NearMeCandidate',
];

const FUNCTION_REGISTRY = [
  'onboardingAI', 'chatEdit', 'generatePage', 'processGenerationQueue',
  'launchCampaign', 'generateSocialContent', 'generateMedia',
  'executeAgentTask', 'ingestPack', 'provisionApprovedPack',
  'provisionSystem', 'sendOutreach', 'dailyFollowUp',
  'autonomousResearchEngine', 'socialMediaEngine', 'godModeSeo',
  'generateBusinessName',
];

function validateToken(body) {
  const token = secrets.get('PACK_SYNC_TOKEN');
  if (!token) return { ok: false, error: 'Server not configured: PACK_SYNC_TOKEN missing', status: 500 };
  if (!body.sync_token || body.sync_token !== token) return { ok: false, error: 'Invalid sync token', status: 401 };
  return { ok: true };
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const auth = validateToken(body);
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

    const base44 = createClientFromRequest(req);
    const action = body.action || 'ingest_pack';

    // ── SYSTEM STATUS ──
    if (action === 'system_status') {
      const entityCounts = {};
      const countResults = await Promise.allSettled(
        ENTITY_REGISTRY.map(async (name) => {
          const count = await base44.asServiceRole.entities[name]?.count?.({});
          return [name, count];
        })
      );
      for (const r of countResults) {
        if (r.status === 'fulfilled' && r.value) entityCounts[r.value[0]] = r.value[1];
      }
      return Response.json({
        status: 'online',
        platform: 'ApexForge / Strategic Minds AI',
        supabase_project: 'staging (uvdkzsbjackpjvpoxtyk)',
        entities: ENTITY_REGISTRY,
        entity_counts: entityCounts,
        functions: FUNCTION_REGISTRY,
        actions_available: [
          'system_status', 'query_entity', 'get_record', 'create_record',
          'update_record', 'delete_record', 'list_functions', 'invoke_function',
          'ingest_pack', 'get_strategy_session', 'set_strategy_session',
          'trigger_research', 'trigger_social', 'trigger_god_mode',
        ],
      });
    }

    // ── QUERY ENTITY ──
    if (action === 'query_entity') {
      const { entity, filter, limit, sort, fields } = body;
      if (!ENTITY_REGISTRY.includes(entity)) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
      const opts: any = {};
      if (limit) opts.limit = Math.min(limit, 200);
      if (sort) opts.sort = sort;
      if (fields) opts.fields = fields;
      const result = await base44.asServiceRole.entities[entity].filter(filter || {}, opts);
      return Response.json({ entity, items: result.items || result, has_more: result.has_more, next_cursor: result.next_cursor });
    }

    // ── GET RECORD ──
    if (action === 'get_record') {
      const { entity, id } = body;
      if (!ENTITY_REGISTRY.includes(entity)) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const record = await base44.asServiceRole.entities[entity].get(id);
      return Response.json({ entity, record });
    }

    // ── CREATE RECORD ──
    if (action === 'create_record') {
      const { entity, data } = body;
      if (!ENTITY_REGISTRY.includes(entity)) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
      if (!data || typeof data !== 'object') return Response.json({ error: 'data object is required' }, { status: 400 });
      const record = await base44.asServiceRole.entities[entity].create(data);
      return Response.json({ ok: true, entity, record });
    }

    // ── UPDATE RECORD ──
    if (action === 'update_record') {
      const { entity, id, data } = body;
      if (!ENTITY_REGISTRY.includes(entity)) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
      if (!id || !data) return Response.json({ error: 'id and data are required' }, { status: 400 });
      const record = await base44.asServiceRole.entities[entity].update(id, data);
      return Response.json({ ok: true, entity, record });
    }

    // ── DELETE RECORD ──
    if (action === 'delete_record') {
      const { entity, id } = body;
      if (!ENTITY_REGISTRY.includes(entity)) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      await base44.asServiceRole.entities[entity].delete(id);
      return Response.json({ ok: true, entity, deleted: id });
    }

    // ── LIST FUNCTIONS ──
    if (action === 'list_functions') {
      return Response.json({ functions: FUNCTION_REGISTRY });
    }

    // ── INVOKE FUNCTION ──
    if (action === 'invoke_function') {
      const { function_name, payload } = body;
      if (!FUNCTION_REGISTRY.includes(function_name)) return Response.json({ error: `Unknown function: ${function_name}` }, { status: 400 });
      const result = await base44.asServiceRole.functions.invoke(function_name, payload || {});
      return Response.json({ ok: true, function: function_name, result });
    }

    // ── INGEST PACK (backward compatible) ──
    if (action === 'ingest_pack') {
      if (!body.name) return Response.json({ error: 'name is required' }, { status: 400 });
      const pack = await base44.asServiceRole.entities.Pack.create({
        name: body.name,
        kind: body.kind || 'web_pack',
        preview_html: body.preview_html || '',
        brand_tokens: body.brand_tokens || '',
        source: body.source || 'gpt_sync',
        submitted_by_label: body.submitted_by_label || 'GPT',
        status: 'pending_review',
        metadata: body.metadata || '',
      });
      return Response.json({ ok: true, pack_id: pack.id, status: 'pending_review' });
    }

    // ── GET STRATEGY SESSION ──
    if (action === 'get_strategy_session') {
      const { session_id } = body;
      if (session_id) {
        const session = await base44.asServiceRole.entities.OnboardingSession.get(session_id);
        return Response.json({ session });
      }
      const result = await base44.asServiceRole.entities.OnboardingSession.filter(
        { status: 'in_progress' },
        { sort: '-created_date', limit: 1 }
      );
      const items = result.items || result;
      return Response.json({ session: items?.[0] || null });
    }

    // ── SET STRATEGY SESSION ──
    if (action === 'set_strategy_session') {
      const { session_id, data } = body;
      if (session_id) {
        const session = await base44.asServiceRole.entities.OnboardingSession.update(session_id, data);
        return Response.json({ ok: true, session });
      }
      const session = await base44.asServiceRole.entities.OnboardingSession.create({
        session_label: data.session_label || `GPT Session ${new Date().toISOString()}`,
        ...data,
        status: 'in_progress',
      });
      return Response.json({ ok: true, session });
    }

    // ── TRIGGER RESEARCH ──
    if (action === 'trigger_research') {
      const { industry } = body;
      if (!industry) return Response.json({ error: 'industry is required' }, { status: 400 });
      const result = await base44.asServiceRole.functions.invoke('autonomousResearchEngine', {
        action: 'run_full_research',
        industry,
      });
      return Response.json({ ok: true, result });
    }

    // ── TRIGGER SOCIAL ──
    if (action === 'trigger_social') {
      const { industry, platform, topic } = body;
      const result = await base44.asServiceRole.functions.invoke('socialMediaEngine', {
        action: 'create_30_day_content',
        industry,
        platform: platform || 'all',
        topic,
      });
      return Response.json({ ok: true, result });
    }

    // ── TRIGGER GOD MODE ──
    if (action === 'trigger_god_mode') {
      const { industry, url, location } = body;
      if (!industry) return Response.json({ error: 'industry is required' }, { status: 400 });
      const result = await base44.asServiceRole.functions.invoke('godModeSeo', {
        action: 'full_analysis',
        industry,
        url,
        location,
      });
      return Response.json({ ok: true, result });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
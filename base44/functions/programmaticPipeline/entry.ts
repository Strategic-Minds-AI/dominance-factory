import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { advanceRun, getContext, EXECUTABLE_STEPS } from '../../shared/pipelineRunner.ts';
import { fingerprint } from '../../shared/pipelineEvidence.ts';
import { saveArtifact } from '../../shared/pipelineStages.ts';
import { renderConcept } from '../../shared/pipelineConcepts.ts';
import { TEMPLATE_AUDIT, SYSTEM_AUDIT } from '../../shared/pipelineTemplateRegistry.ts';
import { aiComplete } from '../../shared/vercelAiGateway.ts';
import { runSimulation } from '../../shared/godModeEngine.ts';

function cleanProfile(input) {
  const fields = ['owner_name','business_name','industry','location','business_type','website_url','style','vision','email','phone'];
  const profile = Object.fromEntries(fields.map(key => [key, String(input?.[key] || '').trim().slice(0, key === 'vision' ? 2000 : 300)]));
  for (const key of ['owner_name','business_name','industry','location','vision']) if (!profile[key]) throw new Error(`Please fill in ${key.replace(/_/g, ' ')}.`);
  if (!['new_business','ai_enhanced','rebrand'].includes(profile.business_type)) throw new Error('Choose build new, enhance, or rebrand.');
  if (input.public_research_consent !== true) throw new Error('Consent to public business research is required. No private skip tracing is performed.');
  if (profile.website_url) { const u = new URL(profile.website_url); if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Use a public HTTPS business website.'); }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error('Please enter a valid business email.');
  return { ...profile, public_research_consent: true };
}
export default async function(req) {
  try {
    const client = createClientFromRequest(req); const user = await client.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Only administrators can control the pipeline.' }, { status: 403 });
    const body = await req.json(); const action = body.action;
    if (action === 'audit') return Response.json({ systems: SYSTEM_AUDIT, templates: TEMPLATE_AUDIT, catalog_count: await client.entities.SystemTemplate.count({}), audit_scope: 'Current phase orchestration and seven attached archives. Other catalog entries: inventory review only.' });
    if (action === 'diagnostics') {
      const market = { monthly_search_volume: 1000, lead_value: 100, cities_available: 1, competition_level: 'medium' }; const config = { name: 'Synthetic fixture, not market evidence', page_count: 10, cities: 1, ai_cost_per_page: 1, hosting_cost_monthly: 20, domain_cost_yearly: 12 };
      const a = runSimulation(market, config, 100); const b = runSimulation(market, config, 100);
      return Response.json({ deterministic_replay: JSON.stringify(a) === JSON.stringify(b), algorithm: 'seo-scenario-v2', initial_cost: a.assumptions.total_initial_cost, recurring_cost: a.assumptions.monthly_recurring_cost, first_month_cost: a.monthly_projection[0].costs_p50, demand_cap: a.assumptions.demand_cap, fixture_only: true });
    }
    if (action === 'sync_template_catalog') {
      const records = TEMPLATE_AUDIT.map((t, i) => ({ name: t.name === 'Blueprint Local' ? 'Blueprint Local Copy' : t.name, file_url: t.url, file_count: t.files, status: 'stored', category: i === 1 || i === 6 ? 'Marketplace Systems' : i === 2 ? 'Social Media' : i === 3 ? 'Portfolio' : 'Deployable Apps', template_type: i === 1 || i === 6 ? 'marketplace' : i === 2 ? 'social_media' : i === 3 ? 'portfolio' : 'base44_app', description: t.finding, tech_stack: 'React / Vite / Base44; source audited, not blindly deployed', key_features: `${t.status}. Routed to: ${t.stage}. ${t.files} files; ${t.functions} backend functions; ${t.agents} agents; ${t.workflows} workflows. SHA256: ${t.sha256}. Evidence: ${t.evidence}`, tags: `pipeline-audited, ${t.status}` }));
      const result = await client.entities.SystemTemplate.upsert(records, { key: 'name' });
      return Response.json({ created: result.created, updated: result.updated, total_audited: 7 });
    }
    if (action === 'refine_vision') {
      const input = body.profile || {}; const prompt = JSON.stringify({ vision: String(input.vision || '').slice(0, 2000), industry: String(input.industry || '').slice(0, 200), business_name: String(input.business_name || '').slice(0, 200), business_type: input.business_type, style: String(input.style || '').slice(0, 200) });
      const vision = await aiComplete({ model: 'openai/gpt-6-astra', temperature: 0, max_tokens: 500, messages: [{ role: 'system', content: 'Clarify this business vision in 2 to 4 sentences. Preserve the intent. Do not invent identity, contact details, facts, financial estimates or guaranteed outcomes. This is a draft suggestion for user review. Return only plain text.' }, { role: 'user', content: prompt }] });
      return Response.json({ vision: vision.slice(0, 2000) });
    }
    if (action === 'list') return Response.json(await client.entities.PipelineRun.filter({ owner_id: user.id }, { sort: '-created_date', limit: 20, cursor: body.cursor, fields: ['name','status','current_step','mode'] }));
    if (action === 'start') {
      if (!['autonomous','manual'].includes(body.mode)) return Response.json({ error: 'Choose autonomous or manual operation.' }, { status: 400 });
      const profile = cleanProfile(body.profile); const run = await client.entities.PipelineRun.create({ owner_id: user.id, name: profile.business_name, mode: body.mode, profile: JSON.stringify(profile), current_step: 'research', status: body.mode === 'autonomous' ? 'queued' : 'manual', pause_requested: false, revision: 'pipeline-v1' });
      return Response.json({ run });
    }
    let run;
    if (body.run_id) run = await client.entities.PipelineRun.get(body.run_id);
    else if (action === 'get') run = (await client.entities.PipelineRun.filter({ owner_id: user.id }, { sort: '-created_date', limit: 1 })).items[0];
    if (!run) return Response.json({ run: null, artifacts: [], previews: [] });
    if (run.owner_id !== user.id) return Response.json({ error: 'This pipeline belongs to another administrator.' }, { status: 403 });
    if (action === 'get') {
      const artifacts = await client.entities.PipelineArtifact.filter({ run_id: run.id }, { sort: 'completed_at', limit: 30 });
      const context = Object.fromEntries(artifacts.items.map(a => [a.step, JSON.parse(a.output)]));
      const profile = JSON.parse(run.profile);
      return Response.json({ run, artifacts: artifacts.items, previews: (context.designs?.designs || []).map(d => ({ index: d.index, html: renderConcept(profile, d) })) });
    }
    if (action === 'advance') return Response.json(await advanceRun(client, run.id, run.current_step));
    if (action === 'pause') {
      run = await client.entities.PipelineRun.update(run.id, { pause_requested: true, ...(run.status === 'running' ? {} : { status: 'paused' }) });
      return Response.json({ run });
    }
    if (action === 'resume') {
      if (run.status === 'running' && run.lease_until > new Date().toISOString()) return Response.json({ error: 'A stage is still running; wait for it to finish.' }, { status: 409 });
      if (run.current_step === 'release') return Response.json({ error: 'Release remains locked until the missing integrations and independent checks are implemented.' }, { status: 409 });
      if (run.status === 'needs_evidence') return Response.json({ error: 'Evidence is still missing. Choose design-only planning to withhold financial forecasts.' }, { status: 409 });
      run = await client.entities.PipelineRun.update(run.id, { pause_requested: false, status: run.current_step === 'approval' ? 'awaiting_approval' : run.mode === 'autonomous' ? 'queued' : 'manual', lease_token: '', lease_until: '', error: '' });
      return Response.json({ run });
    }
    if (action === 'design_only') {
      if (run.current_step !== 'simulate' || run.status !== 'needs_evidence') return Response.json({ error: 'Design-only continuation is available only at the missing-evidence gate.' }, { status: 409 });
      const context = await getContext(client, run);
      await saveArtifact(client, run, 'simulate', context, { withheld: true, reason: run.error, projections: null, approved_design_only_by: user.id, scope: 'Design planning only. No financial recommendation, spending, scale or launch authorization.' });
      run = await client.entities.PipelineRun.update(run.id, { current_step: 'designs', status: run.mode === 'autonomous' ? 'queued' : 'manual', error: '' });
      return Response.json({ run });
    }
    if (action === 'approve') {
      const index = body.design_index;
      if (!Number.isInteger(index) || index < 0 || index > 9 || run.current_step !== 'approval' || run.status !== 'awaiting_approval') return Response.json({ error: 'Choose one of the ten concepts at the approval step.' }, { status: 409 });
      const context = await getContext(client, run); const design = context.designs?.designs[index]; if (!design) throw new Error('Selected concept not found.');
      const lease = crypto.randomUUID();
      await client.entities.PipelineRun.updateMany({ id: run.id, current_step: 'approval', status: 'awaiting_approval' }, { $set: { status: 'running', lease_token: lease, lease_until: new Date(Date.now() + 300000).toISOString() } });
      run = await client.entities.PipelineRun.get(run.id); if (run.lease_token !== lease) return Response.json({ error: 'Another approval is already being saved.' }, { status: 409 });
      const now = new Date().toISOString(); await saveArtifact(client, run, 'approval', context, { index, design_hash: await fingerprint(design), approved_by: user.id, approved_at: now, scope: 'Generate drafts only; not permission to publish, buy domains, charge payments or contact customers.' });
      await client.entities.PipelineRun.update(run.id, { selected_design: index, approved_by: user.id, approved_at: now, current_step: 'draft', status: run.mode === 'autonomous' ? 'queued' : 'manual', lease_token: '', lease_until: '', error: '' });
      return Response.json({ run: await client.entities.PipelineRun.get(run.id) });
    }
    return Response.json({ error: 'Unsupported pipeline action.' }, { status: 400 });
  } catch (error) { return Response.json({ error: String(error.message).slice(0, 600) }, { status: 500 }); }
}
import { aiCompleteJson } from './vercelAiGateway.ts';
import { researchBusiness, requireMarketEvidence, fingerprint } from './pipelineEvidence.ts';
import { generateStrategies, pickWinner } from './godModeEngine.ts';
import { generateConcepts, renderConcept, DESIGN_DIRECTIONS } from './pipelineConcepts.ts';
import { TEMPLATE_AUDIT } from './pipelineTemplateRegistry.ts';

export async function saveArtifact(client, run, step, context, output) {
  const serialized = JSON.stringify(output);
  if (serialized.length > 16000) throw new Error('Stage output is too large; no result was silently truncated.');
  const artifact = { run_id: run.id, step, input_hash: await fingerprint(context), output_hash: await fingerprint(output), output: serialized, completed_at: new Date().toISOString(), algorithm_version: 'pipeline-v1 / seo-scenario-v2' };
  await client.entities.PipelineArtifact.upsert([artifact], { key: ['run_id', 'step'] });
  return artifact;
}
export async function performStage(client, run, context) {
  const profile = context.profile;
  if (run.current_step === 'research') return researchBusiness(profile);
  if (run.current_step === 'benchmark') {
    const report = await aiCompleteJson({ model: 'openai/gpt-6-astra', temperature: 0, max_tokens: 3500, messages: [
      { role: 'system', content: 'Analyze only supplied public feature observations. Do not claim to inspect private code, know proprietary architecture, independently verify ratings, or copy protected branding. Return valid JSON.' },
      { role: 'user', content: `Compounded context: ${JSON.stringify(context)}\nReturn {summary:string,comparisons:[{name:string,url:string,public_features:[string],differentiation_opportunity:string}],website_requirements:[string],adjacent_opportunities:[string],limitations:[string]}. Benchmark the three observed competitors; no invented ratings or financial metrics. Derive an original, practical website plan for this business. Limit requirements to 8.` }
    ] });
    return { ...report, evidence_class: 'analyst_recommendation_from_saved_research', reused_template_routes: TEMPLATE_AUDIT.map(t => ({ name: t.name, stage: t.stage, status: t.status })) };
  }
  if (run.current_step === 'simulate') {
    const market = context.research.market_data; requireMarketEvidence(market);
    const strategies = generateStrategies(market); const winner = pickWinner(strategies);
    return { market_snapshot: market, algorithm_version: 'seo-scenario-v2', interpretation: 'Scenario projections, not measured earnings or ranking probabilities. Demand is capped; conversion, close rate and time-to-rank remain explicit assumptions.', strategies: strategies.map(s => ({ name: s.name, page_count: s.page_count, cities: s.cities, total_cost: s.total_cost, roi_p50: s.roi_p50, p10: s.simulation.p10, p50: s.simulation.p50, p90: s.simulation.p90, assumptions: s.simulation.assumptions, monthly_projection: s.simulation.monthly_projection })), winner: winner.name, total_iterations: 3000, winner_rule: 'Highest P10 profit / total cost; P50 ROI then name break ties' };
  }
  if (run.current_step === 'designs') return { designs: await generateConcepts(context), proposal_only: true, approval_required: true };
  if (run.current_step === 'draft') {
    const design = context.designs.designs[run.selected_design];
    if (!design || !run.approved_by || !run.approved_at || context.approval?.design_hash !== await fingerprint(design)) throw new Error('The selected design lacks a matching saved approval.');
    const content = await aiCompleteJson({ model: 'openai/gpt-6-astra', temperature: 0, max_tokens: 4500, messages: [
      { role: 'system', content: 'Write draft business website copy using the supplied profile, public research, benchmark and approved design. No invented factual credentials, testimonials, statistics or promises. No scripts or HTML. Return JSON only.' },
      { role: 'user', content: `Compounded context: ${JSON.stringify(context)}\nApproved concept: ${JSON.stringify(design)}\nReturn {pages:[{slug:"home|about|services|faq|contact",title:string,heading:string,body:string,sections:[{title:string,body:string}]}]}. Exactly 5 pages, one of each slug. Each page has 3 helpful sections with body under 250 characters. Use the selected tone and business type. Mention verified service coverage only. No pretend checkout, login or client portal.` }
    ] });
    const slugs = ['home', 'about', 'services', 'faq', 'contact'];
    if (!Array.isArray(content.pages) || content.pages.length !== 5 || !slugs.every(slug => content.pages.filter(p => p.slug === slug && p.title && p.heading && p.body && Array.isArray(p.sections) && p.sections.length >= 3).length === 1)) throw new Error('All five complete draft pages are required.');
    const pages = content.pages.map(p => ({ slug: p.slug, title: String(p.title).slice(0, 120), heading: String(p.heading).slice(0, 180), body: String(p.body).slice(0, 600), sections: p.sections.slice(0, 3).map(s => ({ title: String(s.title).slice(0, 100), body: String(s.body).slice(0, 300) })) }));
    const home = pages.find(p => p.slug === 'home');
    const upsert = await client.entities.Website.upsert([{ source_pack_id: 'pipeline:' + run.id, name: profile.business_name, category: 'business', status: 'draft', description: `Pipeline ${run.id}. Approved concept: ${design.name}. Five draft pages; not deployed or independently validated.`, preview_html: renderConcept(profile, design, home), brand_tokens: JSON.stringify(DESIGN_DIRECTIONS[design.index]), url_pattern: profile.website_url || '' }], { key: 'source_pack_id' });
    const website = upsert.records?.[0]; if (!website?.id) throw new Error('The website draft did not persist.');
    for (const page of pages) await saveArtifact(client, run, 'page:' + page.slug, { approved_design: design, profile }, { ...page, html: renderConcept(profile, design, page) });
    await client.entities.GeneratedPage.upsert(pages.map(p => ({ website_id: website.id, url_slug: p.slug === 'home' ? '/' : p.slug, composite_key: 'pipeline:' + run.id + ':' + p.slug, location: profile.location, service: profile.industry, html_content: renderConcept(profile, design, p), status: 'ready', compliance_score: 0, compliance_notes: 'Draft only. Independent content, accessibility, performance and release acceptance not yet performed.' })), { key: 'composite_key' });
    return { website_id: website.id, pages: slugs, status: 'draft_ready_not_deployed', selected_design: design.name, release_blockers: ['Independent release acceptance', 'Deployment adapter and live receipt', 'Domain ownership and budget approval', 'PWA and authenticated client/admin portal implementation', 'Social publishing permissions and actual media rendering', 'Stripe installation, consent-aware communications and scoped agent execution'] };
  }
  throw new Error('This stage is gated and cannot execute automatically.');
}
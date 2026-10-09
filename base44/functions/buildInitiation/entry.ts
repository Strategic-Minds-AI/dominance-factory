import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiCompleteJson, MODELS } from "../../shared/vercelAiGateway.ts";
import { classifyAllSystems, findReusableAssets, type ClassifiedSystem } from "../../shared/systemClassifier.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'initiate';

    // ── INITIATE: Full build initiation pipeline ──────────────────
    if (action === 'initiate') {
      const industry = body.industry;
      const marketContext = body.market_context || '';
      const sessionId = body.session_id || '';
      if (!industry) return Response.json({ error: 'Industry is required' }, { status: 400 });

      // Step 1: Deterministic scan of all internal systems
      const inventory: ClassifiedSystem[] = classifyAllSystems();
      const categoryMap: Record<string, number> = {};
      const typeMap: Record<string, number> = {};
      for (const s of inventory) {
        categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;
        typeMap[s.system_type] = (typeMap[s.system_type] || 0) + 1;
      }

      // Step 2: Benchmark top 3 competitors via Vercel AI Gateway (web search)
      const searchPrompt = `Search the web and find the top 3 highest-rated, most successful systems/platforms in the "${industry}" industry${marketContext ? ` (market context: ${marketContext})` : ''}.

For each system provide: name, url, rating_score (0-100), rating_source, key_features (array of 5-8), tech_stack, market_position, competitive_advantages, weaknesses.

Return ONLY a JSON object: {"systems": [{"name": "...", "url": "...", "rating_score": 85, "rating_source": "...", "key_features": ["..."], "tech_stack": "...", "market_position": "...", "competitive_advantages": "...", "weaknesses": "..."}]}

Include exactly 3 systems ranked 1-3 by overall quality and market dominance. Use real, existing systems.`;

      const searchData = await aiCompleteJson<{ systems: any[] }>({
        model: MODELS.websearch,
        messages: [{ role: 'user', content: searchPrompt }],
        temperature: 0.2,
        max_tokens: 8192,
        online: true,
      });

      const systems = searchData.systems || [];
      if (!systems.length) return Response.json({ error: 'No benchmark systems found for this industry' }, { status: 404 });

      // Step 3: Reverse engineer each competitor + map to internal assets
      const benchmarks: any[] = [];
      const allFeatures: string[] = [];

      for (let i = 0; i < systems.length; i++) {
        const sys = systems[i];
        allFeatures.push(...(sys.key_features || []));

        const reversePrompt = `Reverse engineer "${sys.name}" (${sys.url}) in the "${industry}" industry. Create a deterministic, end-to-end blueprint for replicating it.

Return ONLY a JSON object: {"architecture_summary": "...", "core_modules": [{"name": "...", "purpose": "...", "dependencies": ["..."]}], "data_models": ["..."], "integration_points": ["..."], "implementation_steps": [{"phase": "...", "description": "...", "timeline": "..."}], "tech_recommendations": ["..."], "success_metrics": ["..."]}`;

        const blueprint = await aiCompleteJson<any>({
          model: MODELS.complex,
          messages: [{ role: 'user', content: reversePrompt }],
          temperature: 0.3,
          max_tokens: 8192,
        });

        const reusableAssets = findReusableAssets(sys.key_features || [], inventory);

        const benchmarkRecord = {
          industry,
          system_name: sys.name,
          system_url: sys.url,
          ranking: i + 1,
          rating_score: sys.rating_score || 0,
          rating_source: sys.rating_source || 'web_search',
          key_features: JSON.stringify(sys.key_features || []),
          tech_stack: sys.tech_stack || '',
          architecture_summary: blueprint.architecture_summary || '',
          reverse_engineering_blueprint: JSON.stringify(blueprint),
          replication_roadmap: JSON.stringify(blueprint.implementation_steps || []),
          competitive_advantages: sys.competitive_advantages || '',
          weaknesses: sys.weaknesses || '',
          market_position: sys.market_position || '',
          internal_asset_mapping: JSON.stringify(reusableAssets.map(a => ({ registry_key: a.registry_key, system_name: a.system_name, category: a.category, reuse_potential: a.reuse_potential }))),
          benchmark_date: new Date().toISOString(),
          status: 'benchmarked',
          session_id: sessionId,
        };

        const created = await base44.asServiceRole.entities.BenchmarkSystem.create(benchmarkRecord);
        benchmarks.push({ id: created.id, name: sys.name, ranking: i + 1, rating_score: sys.rating_score || 0, key_features: sys.key_features || [], reusable_asset_count: reusableAssets.length });
      }

      // Step 4: Map all competitor features to reusable internal assets
      const allReusable = findReusableAssets(allFeatures, inventory);

      // Step 5: Gap analysis + phased build plan via Vercel AI Gateway
      const gapPrompt = `You are a system architect. A new build is being initiated for the "${industry}" industry.

INTERNAL INVENTORY (what we already have — ${inventory.length} systems):
${inventory.map(s => `- ${s.registry_key}: ${s.system_name} (${s.category.replace(/_/g, ' ')}, reuse: ${s.reuse_potential}, capabilities: ${s.capabilities.join(', ')})`).join('\n')}

TOP 3 COMPETITOR FEATURES (the standard we must match):
${systems.map((s, i) => `${i + 1}. ${s.name}: ${(s.key_features || []).join(', ')}`).join('\n')}

REUSABLE ASSETS ALREADY IDENTIFIED (${allReusable.length}):
${allReusable.map(a => `- ${a.system_name} (covers: ${a.capabilities.join(', ')})`).join('\n')}

Analyze the gaps between what we have and what the top competitors offer. Return ONLY a JSON object:
{
  "covered": [{"feature": "...", "asset": "...", "coverage": "full"}],
  "gaps": [{"feature": "...", "priority": "critical", "build_effort": "medium", "description": "..."}],
  "build_plan": [{"phase": "Phase 1: ...", "items": ["..."], "timeline": "...", "priority": "..."}],
  "coverage_percentage": 65,
  "summary": "Overall assessment in 2-3 sentences"
}`;

      const gapAnalysis = await aiCompleteJson<any>({
        model: MODELS.complex,
        messages: [{ role: 'user', content: gapPrompt }],
        temperature: 0.3,
        max_tokens: 8192,
      });

      // Step 6: Store BuildPlan record
      const buildPlan = await base44.asServiceRole.entities.BuildPlan.create({
        industry,
        market_context: marketContext,
        scan_summary: JSON.stringify({ total_systems: inventory.length, categories: categoryMap, types: typeMap }),
        total_internal_systems: inventory.length,
        benchmark_ids: JSON.stringify(benchmarks.map(b => b.id)),
        reusable_assets: JSON.stringify(allReusable.map(a => ({ registry_key: a.registry_key, system_name: a.system_name, category: a.category, reuse_potential: a.reuse_potential }))),
        gaps: JSON.stringify(gapAnalysis.gaps || []),
        build_plan: JSON.stringify(gapAnalysis.build_plan || []),
        coverage_percentage: gapAnalysis.coverage_percentage || 0,
        status: 'complete',
        session_id: sessionId,
      });

      return Response.json({
        status: 'complete',
        plan_id: buildPlan.id,
        industry,
        scan: { total_systems: inventory.length, categories: categoryMap, types: typeMap },
        benchmarks,
        reusable_assets: allReusable.map(a => ({ registry_key: a.registry_key, system_name: a.system_name, category: a.category, reuse_potential: a.reuse_potential })),
        gaps: gapAnalysis.gaps || [],
        build_plan: gapAnalysis.build_plan || [],
        coverage_percentage: gapAnalysis.coverage_percentage || 0,
        summary: gapAnalysis.summary || '',
        provider: 'vercel_ai_gateway',
      });
    }

    // ── GET_PLANS: List all build plans ────────────────────────────
    if (action === 'get_plans') {
      const result = await base44.asServiceRole.entities.BuildPlan.filter({}, { sort: '-created_date', limit: 50 });
      return Response.json({ plans: result.items });
    }

    // ── GET_PLAN: Get a specific plan ──────────────────────────────
    if (action === 'get_plan') {
      const id = body.id;
      if (!id) return Response.json({ error: 'Plan ID required' }, { status: 400 });
      const plan = await base44.asServiceRole.entities.BuildPlan.get(id);
      return Response.json({ plan });
    }

    return Response.json({ error: 'Unknown action. Use: initiate, get_plans, or get_plan' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
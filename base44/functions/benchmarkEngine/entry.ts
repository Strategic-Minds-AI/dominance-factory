import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiCompleteJson, MODELS } from "../../shared/vercelAiGateway.ts";
import { classifyAllSystems, findReusableAssets } from "../../shared/systemClassifier.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'benchmark';

    if (action === 'benchmark') {
      const industry = body.industry;
      const marketContext = body.market_context || '';
      const sessionId = body.session_id || '';

      if (!industry) {
        return Response.json({ error: 'Industry is required' }, { status: 400 });
      }

      // Step 1: Search the web for top 3 rated systems in this industry
      // Uses Vercel AI Gateway with online mode (web search) via Perplexity Sonar
      const searchPrompt = `Search the web and find the top 3 highest-rated, most successful existing systems/platforms/websites in the "${industry}" industry${marketContext ? ` (market context: ${marketContext})` : ''}.

For each system, provide:
1. name: The system/platform name
2. url: Its primary URL
3. rating_score: Overall rating or reputation score (0-100, based on reviews, market presence, user satisfaction)
4. rating_source: Where that rating comes from (e.g., G2, Capterra, Trustpilot, industry reports)
5. key_features: Array of 5-8 key features
6. tech_stack: Known technology stack
7. market_position: Its market position and dominance
8. competitive_advantages: What gives it an edge
9. weaknesses: Known weaknesses or gaps

Return ONLY a JSON object with this exact structure:
{"systems": [{"name": "...", "url": "...", "rating_score": 85, "rating_source": "...", "key_features": ["..."], "tech_stack": "...", "market_position": "...", "competitive_advantages": "...", "weaknesses": "..."}]}

Include exactly 3 systems, ranked 1-3 by overall quality and market dominance. Be specific and factual — use real, existing systems.`;

      const searchData = await aiCompleteJson<{
        systems: Array<{
          name: string;
          url: string;
          rating_score: number;
          rating_source: string;
          key_features: string[];
          tech_stack: string;
          market_position: string;
          competitive_advantages: string;
          weaknesses: string;
        }>;
      }>({
        model: MODELS.websearch,
        messages: [{ role: 'user', content: searchPrompt }],
        temperature: 0.2,
        max_tokens: 8192,
        online: true,
      });

      const systems = searchData.systems || [];

      if (!systems || systems.length === 0) {
        return Response.json({ error: 'No benchmark systems found for this industry' }, { status: 404 });
      }

      // Step 2: Get internal inventory for asset mapping
      const internalInventory = classifyAllSystems();

      // Step 3: For each benchmark system, reverse engineer it and create a blueprint
      // Uses Vercel AI Gateway with Claude Sonnet for complex reasoning
      const benchmarks = [];
      for (let i = 0; i < systems.length; i++) {
        const sys = systems[i];

        const reversePrompt = `Reverse engineer the following system/platform in the "${industry}" industry and create a deterministic, end-to-end systematic and programmatic blueprint for replicating it.

System: ${sys.name}
URL: ${sys.url}
Key Features: ${(sys.key_features || []).join(", ")}
Tech Stack: ${sys.tech_stack || "Unknown"}
Market Position: ${sys.market_position || "Unknown"}
Competitive Advantages: ${sys.competitive_advantages || "Unknown"}

Create a detailed replication roadmap. Return ONLY a JSON object with this exact structure:
{
  "architecture_summary": "High-level architecture description",
  "core_modules": [{"name": "...", "purpose": "...", "dependencies": ["..."]}],
  "data_models": ["entity1", "entity2"],
  "integration_points": ["service1", "service2"],
  "implementation_steps": [{"phase": "Phase 1: ...", "description": "...", "timeline": "X weeks"}],
  "tech_recommendations": ["tech1", "tech2"],
  "success_metrics": ["KPI1", "KPI2"]
}

Be specific and actionable. This blueprint will be followed deterministically to build a competing system.`;

        const blueprint = await aiCompleteJson<{
          architecture_summary: string;
          core_modules: Array<{ name: string; purpose: string; dependencies: string[] }>;
          data_models: string[];
          integration_points: string[];
          implementation_steps: Array<{ phase: string; description: string; timeline: string }>;
          tech_recommendations: string[];
          success_metrics: string[];
        }>({
          model: MODELS.complex,
          messages: [{ role: 'user', content: reversePrompt }],
          temperature: 0.3,
          max_tokens: 8192,
        });

        // Map benchmark features to reusable internal assets
        const reusableAssets = findReusableAssets(sys.key_features || [], internalInventory);

        const benchmarkRecord = {
          industry,
          system_name: sys.name,
          system_url: sys.url,
          ranking: i + 1,
          rating_score: sys.rating_score || 0,
          rating_source: sys.rating_source || "web_search",
          key_features: JSON.stringify(sys.key_features || []),
          tech_stack: sys.tech_stack || "",
          architecture_summary: blueprint.architecture_summary || "",
          reverse_engineering_blueprint: JSON.stringify(blueprint),
          replication_roadmap: JSON.stringify(blueprint.implementation_steps || []),
          competitive_advantages: sys.competitive_advantages || "",
          weaknesses: sys.weaknesses || "",
          market_position: sys.market_position || "",
          internal_asset_mapping: JSON.stringify(reusableAssets.map(a => ({
            registry_key: a.registry_key,
            system_name: a.system_name,
            category: a.category,
            reuse_potential: a.reuse_potential,
          }))),
          benchmark_date: new Date().toISOString(),
          status: "benchmarked",
          session_id: sessionId,
        };

        const created = await base44.asServiceRole.entities.BenchmarkSystem.create(benchmarkRecord);
        benchmarks.push({ ...benchmarkRecord, id: created.id, reusable_asset_count: reusableAssets.length });
      }

      return Response.json({
        status: 'complete',
        industry,
        benchmark_count: benchmarks.length,
        benchmarks,
        provider: 'vercel_ai_gateway',
      });
    }

    if (action === 'get_blueprints') {
      const industry = body.industry;
      const filter: Record<string, unknown> = {};
      if (industry) filter.industry = industry;

      const result = await base44.asServiceRole.entities.BenchmarkSystem.filter(filter, {
        sort: '-benchmark_date',
        limit: 50,
      });

      return Response.json({
        total: result.items.length,
        blueprints: result.items,
      });
    }

    if (action === 'get_blueprint') {
      const id = body.id;
      if (!id) return Response.json({ error: 'Blueprint ID required' }, { status: 400 });

      const blueprint = await base44.asServiceRole.entities.BenchmarkSystem.get(id);
      return Response.json({ blueprint });
    }

    return Response.json({ error: 'Unknown action. Use: benchmark, get_blueprints, or get_blueprint' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
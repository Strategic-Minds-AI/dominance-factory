import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
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
      const searchPrompt = `Search the web and find the top 3 highest-rated, most successful existing systems/platforms/websites in the "${industry}" industry. For each one, provide:
1. The system/platform name
2. Its URL
3. Its overall rating or reputation score (out of 100)
4. The source of that rating (e.g., G2, Capterra, Trustpilot, industry reports)
5. Its key features (list 5-8)
6. Its tech stack if known
7. Its market position and competitive advantages
8. Its known weaknesses or gaps

Return ONLY these 3 systems, ranked 1-3 by overall quality and market dominance. Be specific and factual.`;

      const searchResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: searchPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            systems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                  rating_score: { type: "number" },
                  rating_source: { type: "string" },
                  key_features: { type: "array", items: { type: "string" } },
                  tech_stack: { type: "string" },
                  market_position: { type: "string" },
                  competitive_advantages: { type: "string" },
                  weaknesses: { type: "string" },
                },
                required: ["name", "url", "rating_score", "key_features"],
              },
            },
          },
          required: ["systems"],
        },
      });

      const searchData = typeof searchResponse === 'string' ? JSON.parse(searchResponse) : searchResponse;
      const systems = searchData.systems || [];

      if (!systems || systems.length === 0) {
        return Response.json({ error: 'No benchmark systems found for this industry' }, { status: 404 });
      }

      // Step 2: Get internal inventory for asset mapping
      const internalInventory = classifyAllSystems();

      // Step 3: For each benchmark system, reverse engineer it and create a blueprint
      const benchmarks = [];
      for (let i = 0; i < systems.length; i++) {
        const sys = systems[i];

        // Reverse engineering prompt
        const reversePrompt = `Reverse engineer the following system/platform in the "${industry}" industry and create a deterministic, end-to-end systematic and programmatic blueprint for replicating it.

System: ${sys.name}
URL: ${sys.url}
Key Features: ${(sys.key_features || []).join(", ")}
Tech Stack: ${sys.tech_stack || "Unknown"}
Market Position: ${sys.market_position || "Unknown"}
Competitive Advantages: ${sys.competitive_advantages || "Unknown"}

Create a detailed replication roadmap with these sections:
1. architecture_summary: High-level architecture description
2. core_modules: List of modules/components needed (each with name, purpose, dependencies)
3. data_models: Key data entities needed
4. integration_points: External services/APIs required
5. implementation_steps: Ordered step-by-step implementation phases
6. tech_recommendations: Specific technologies and tools to use
7. timeline_estimate: Rough timeline for each phase
8. success_metrics: KPIs to measure replication success

Be specific and actionable. This blueprint will be followed deterministically.`;

        const reverseResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: reversePrompt,
          response_json_schema: {
            type: "object",
            properties: {
              architecture_summary: { type: "string" },
              core_modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    purpose: { type: "string" },
                    dependencies: { type: "array", items: { type: "string" } },
                  },
                },
              },
              data_models: { type: "array", items: { type: "string" } },
              integration_points: { type: "array", items: { type: "string" } },
              implementation_steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    description: { type: "string" },
                    timeline: { type: "string" },
                  },
                },
              },
              tech_recommendations: { type: "array", items: { type: "string" } },
              success_metrics: { type: "array", items: { type: "string" } },
            },
            required: ["architecture_summary", "core_modules", "implementation_steps"],
          },
        });

        const blueprint = typeof reverseResponse === 'string' ? JSON.parse(reverseResponse) : reverseResponse;

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
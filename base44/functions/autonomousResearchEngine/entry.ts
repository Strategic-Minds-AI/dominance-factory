import { aiCompleteJson, MODELS } from '../../shared/vercelAiGateway.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ── Helper: Extract industry from vision statement ──
async function extractIndustry(visionStatement: string, sessionLabel: string): Promise<string> {
  const result = await aiCompleteJson<{ industry: string }>({
    model: MODELS.fast,
    messages: [
      { role: 'system', content: 'You are an expert business analyst. Extract the primary industry/niche from the user\'s vision statement. Return ONLY valid JSON: {"industry": "the industry name in 1-3 words"}' },
      { role: 'user', content: `Session label: "${sessionLabel}"\nVision statement: "${visionStatement}"\n\nWhat is the primary industry or niche? Return ONLY JSON.` },
    ],
    temperature: 0.2,
    max_tokens: 256,
  });
  return result.industry || sessionLabel || 'General Business';
}

// ── Helper: Execute full research pipeline (shared by all actions) ──
async function executeFullResearch(industry: string): Promise<{
  industry: string;
  parallel_runs: number;
  godModeRuns: any[];
  bestStrategy: any;
  dominance: any;
  top30: any[];
  strategies: any[];
  total_strategies: number;
}> {
  // Step 1: Run God Mode 3 times in PARALLEL + digital dominance in parallel
  const [godMode1, godMode2, godMode3, dominance] = await Promise.all([
    runGodModeOnce(industry, 1),
    runGodModeOnce(industry, 2),
    runGodModeOnce(industry, 3),
    discoverDominanceTargets(industry),
  ]);

  // Step 2: Merge the 3 God Mode runs — pick the best strategy
  const allRuns = [godMode1, godMode2, godMode3];
  const bestRun = allRuns.reduce((best, current) => {
    const currentScore = (current.ranking_factors?.length || 0) + (current.algorithm_shortcuts?.length || 0);
    const bestScore = (best.ranking_factors?.length || 0) + (best.algorithm_shortcuts?.length || 0);
    return currentScore > bestScore ? current : best;
  });

  const allFactors = [...new Set([
    ...(godMode1.ranking_factors || []),
    ...(godMode2.ranking_factors || []),
    ...(godMode3.ranking_factors || []),
  ].map((f: any) => JSON.stringify(f)))].map((s: string) => JSON.parse(s));

  const allShortcuts = [...new Set([
    ...(godMode1.algorithm_shortcuts || []),
    ...(godMode2.algorithm_shortcuts || []),
    ...(godMode3.algorithm_shortcuts || []),
  ].map((s: any) => JSON.stringify(s)))].map((s: string) => JSON.parse(s));

  const bestStrategy = {
    ...bestRun,
    merged_from: 3,
    all_ranking_factors: allFactors,
    all_algorithm_shortcuts: allShortcuts,
    unique_angles: [godMode1.unique_angle, godMode2.unique_angle, godMode3.unique_angle].filter(Boolean),
  };

  // Step 3: Generate top 30 names/URLs
  const top30 = await generateTop30(industry, bestStrategy, dominance);

  // Step 4: Generate 10 ultimate strategies with ROI
  const strategiesResult = await generate10Strategies(industry, bestStrategy, dominance, top30);

  return {
    industry,
    parallel_runs: 3,
    godModeRuns: allRuns,
    bestStrategy,
    dominance,
    top30: top30.top30 || [],
    strategies: strategiesResult.strategies || [],
    total_strategies: (strategiesResult.strategies || []).length,
  };
}

// ── Helper: Run one God Mode analysis ──
async function runGodModeOnce(industry: string, variation: number): Promise<any> {
  return aiCompleteJson({
    model: MODELS.complex,
    messages: [
      { role: 'system', content: 'You are the ultimate Google algorithm cracker. You know every ranking factor, every shortcut, and every strategy to dominate Google page 1. Return ONLY valid JSON.' },
      { role: 'user', content: `Crack Google's algorithm for the "${industry}" industry. This is parallel run #${variation}. Be creative and find unique angles.

Return JSON: {
  "industry": "${industry}",
  "run_number": ${variation},
  "fastest_path_to_page1": "...",
  "estimated_timeline": "...",
  "ranking_factors": [{"factor": "...", "impact": "critical|high", "how_to_crack": "...", "time_to_implement": "..."}],
  "algorithm_shortcuts": [{"shortcut": "...", "how_it_works": "...", "risk_level": "low|medium"}],
  "schema_types": ["..."],
  "eeat_signals": [{"signal": "...", "how_to_build": "..."}],
  "nearme_advantage": "...",
  "unique_angle": "what makes this run different from other approaches"
}` },
    ],
    temperature: 0.6 + (variation * 0.1),
    max_tokens: 8192,
  });
}

// ── Helper: Discover digital dominance targets ──
async function discoverDominanceTargets(industry: string): Promise<any> {
  return aiCompleteJson({
    model: MODELS.research,
    messages: [
      { role: 'system', content: 'You are a digital dominance expert. Return ONLY valid JSON — no markdown, no code fences, just the raw JSON object.' },
      { role: 'user', content: `List the TOP 15 most important digital submission targets for the "${industry}" industry (directories, review sites, citation sources, Google properties). Keep entries concise.

Return ONLY this JSON (no markdown):
{"targets": [{"name": "...", "url": "...", "category": "...", "priority": "critical|high|medium", "submission_type": "..."}], "summary": "one sentence"}` },
    ],
    temperature: 0.3,
    max_tokens: 8192,
  });
}

// ── Helper: Generate top 30 names/URLs ──
async function generateTop30(industry: string, bestStrategy: any, dominance: any): Promise<any> {
  return aiCompleteJson({
    model: MODELS.complex,
    messages: [
      { role: 'system', content: 'You are the ultimate SEO business name and URL strategist. You know NearMe.com patterns, piggyback strategies, and exact-match domain advantages. Return ONLY valid JSON.' },
      { role: 'user', content: `Generate the TOP 30 business names + URLs for the "${industry}" industry using this cracked Google algorithm strategy:

${JSON.stringify(bestStrategy).slice(0, 3000)}

For each: business_name, url (prefer .com NearMe pattern), pattern_type, seo_score (0-100), commercial_intent, reasoning, google_advantage, time_to_page1, nearme_benefit (0-100), piggyback_potential.

Return JSON: {"top30": [{"rank": 1, "business_name": "...", "url": "...", "pattern_type": "...", "seo_score": 95, "commercial_intent": "very_high", "reasoning": "...", "google_advantage": "...", "time_to_page1": "...", "nearme_benefit": 95, "piggyback_potential": "high"}]}` },
    ],
    temperature: 0.6,
    max_tokens: 8192,
  });
}

// ── Helper: Generate 10 ultimate strategies with ROI ──
async function generate10Strategies(industry: string, bestStrategy: any, dominance: any, top30: any): Promise<any> {
  return aiCompleteJson({
    model: MODELS.complex,
    messages: [
      { role: 'system', content: 'You are the ultimate business strategist and ROI analyst. You create comprehensive, deterministic, programmatic strategies with exact financial projections. You know how to scale from 1 to 2000 websites, how to automate social media, and how to deploy super agents for fully autonomous operation. Return ONLY valid JSON.' },
      { role: 'user', content: `Generate 10 ULTIMATE STRATEGIES for the "${industry}" industry. Each strategy must be a complete, end-to-end plan for programmatic SEO domination with fully autonomous website generation, social media automation, and super agent operation.

Context:
- Best God Mode Strategy: ${JSON.stringify(bestStrategy).slice(0, 2000)}
- Digital Dominance Targets: ${dominance?.targets?.length || 0} targets discovered
- Top 30 Names/URLs: ${top30?.top30?.length || 0} generated

For EACH of the 10 strategies, provide:
1. strategy_name (memorable, descriptive)
2. strategy_rank (1-10, where 1 is best)
3. roi_estimate (e.g., "5x ROI in 12 months")
4. monthly_revenue (estimated $)
5. monthly_cost (estimated $)
6. net_profit (monthly $)
7. time_to_profitability (e.g., "4-6 months")
8. website_count (how many websites in this strategy: 10, 50, 100, 500, 2000)
9. what_included (array of everything included: websites, social media, agents, A/B testing, analytics, etc.)
10. steps (array of sequential steps from industry research to full autonomous operation)
11. agents (array of super agents needed with their roles)
12. full_strategy (comprehensive paragraph describing the complete strategy)

The 10 strategies should range from conservative (low cost, fewer sites) to aggressive (high cost, 2000+ sites). Include:
- Strategy 1-3: Conservative (10-50 sites, $5K-15K/mo cost)
- Strategy 4-6: Moderate (100-500 sites, $15K-50K/mo cost)
- Strategy 7-9: Aggressive (500-2000 sites, $50K-200K/mo cost)
- Strategy 10: Ultimate (2000+ sites, full autonomous operation, maximum ROI)

Each strategy MUST include:
- Website generation plan
- Social media automation system (30-day content creator, image/video generators, scheduling agent)
- Super agent deployment plan
- A/B testing system
- Analytics system
- Financial projections

Return JSON: {
  "strategies": [{
    "strategy_name": "...",
    "strategy_rank": 1,
    "roi_estimate": "...",
    "monthly_revenue": 50000,
    "monthly_cost": 10000,
    "net_profit": 40000,
    "time_to_profitability": "4-6 months",
    "website_count": 100,
    "what_included": ["...", "..."],
    "steps": ["Step 1: ...", "Step 2: ..."],
    "agents": [{"name": "...", "role": "...", "responsibility": "..."}],
    "full_strategy": "..."
  }]
}` },
    ],
    temperature: 0.5,
    max_tokens: 16384,
  });
}

export default async function handler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  // ── Action: generate_strategies — reads session, extracts industry, runs full research via Vercel AI Gateway ──
  if (action === 'generate_strategies') {
    try {
    const { session_id } = body;
    if (!session_id) return Response.json({ error: 'session_id is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    let session: any;
    try {
      session = await base44.asServiceRole.entities.OnboardingSession.get(session_id);
    } catch {
      return Response.json({ error: 'Session not found or invalid session ID' }, { status: 404 });
    }
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    // Extract industry from the vision statement or session label
    const industry = await extractIndustry(
      session.vision_statement || '',
      session.session_label || '',
    );

    // Run the full research pipeline via Vercel AI Gateway (no Base44 integration credits needed)
    const research = await executeFullResearch(industry);

    // Save the 10 strategies to the ResearchStrategy entity
    if (research.strategies.length > 0) {
      const strategyRecords = research.strategies.map((s: any) => ({
        industry,
        strategy_name: s.strategy_name || `Strategy ${s.strategy_rank}`,
        strategy_rank: s.strategy_rank || 0,
        roi_estimate: s.roi_estimate || '',
        monthly_revenue: s.monthly_revenue || 0,
        monthly_cost: s.monthly_cost || 0,
        net_profit: s.net_profit || 0,
        time_to_profitability: s.time_to_profitability || '',
        website_count: s.website_count || 0,
        what_included: JSON.stringify(s.what_included || []),
        steps: JSON.stringify(s.steps || []),
        agents: JSON.stringify(s.agents || []),
        full_strategy: s.full_strategy || '',
        status: 'draft',
      }));
      await base44.asServiceRole.entities.ResearchStrategy.bulkCreate(strategyRecords);
    }

    // Update the session with a compact summary (full data is in ResearchStrategy entity)
    await base44.asServiceRole.entities.OnboardingSession.update(session_id, {
      compounded_context: JSON.stringify({
        industry,
        strategy_count: research.total_strategies,
        top_names: research.top30.slice(0, 5).map((t: any) => t.business_name || t.url),
        dominance_target_count: research.dominance?.targets?.length || 0,
      }),
      current_step: 3,
    });

    return Response.json({
      ...research,
      session_id,
      saved_strategies: research.strategies.length,
    });
    } catch (error) {
      return Response.json({ error: error.message || 'Research failed', stack: error.stack?.substring(0, 500) }, { status: 500 });
    }
  }

  // ── Action: run_full_research — runs ALL Phase 1 steps automatically ──
  if (action === 'run_full_research') {
    const { industry } = body;
    if (!industry) return Response.json({ error: 'Industry is required' }, { status: 400 });

    const research = await executeFullResearch(industry);
    return Response.json(research);
  }

  // ── Action: get_industries — returns top recommended industries ──
  if (action === 'get_industries') {
    const result = await aiCompleteJson({
      model: MODELS.research,
      messages: [
        { role: 'system', content: 'You are an expert SEO industry analyst. You know which industries have the highest SEO domination potential. Return ONLY valid JSON.' },
        { role: 'user', content: `Rank the top 10 industries for programmatic SEO domination. For each: name, naics_sector, seo_difficulty (0-100), commercial_intent (0-100), avg_cpc, lead_value, nearme_potential (0-100), reasoning, recommended_url.

Return JSON: {"industries": [{"name": "...", "naics_sector": "...", "seo_difficulty": 35, "commercial_intent": 90, "avg_cpc": 15, "lead_value": 2000, "nearme_potential": 95, "reasoning": "...", "recommended_url": "..."}]}` },
      ],
      temperature: 0.3,
      max_tokens: 8192,
    });
    return Response.json({ industries: result.industries || [] });
  }

  return Response.json({ error: 'Invalid action. Use: generate_strategies, run_full_research, get_industries' }, { status: 400 });
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { aiCompleteJson, MODELS } from '../../shared/vercelAiGateway.ts';

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

// ── Domain availability via Vercel + GoDaddy APIs ──
async function checkVercelDomain(domain: string, token: string): Promise<{ available: boolean | null; price: number }> {
  try {
    const r = await fetch(`https://api.vercel.com/v1/registrar/domains/${domain}/availability`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { available: null, price: 0 };
    const data = await r.json();
    return { available: !!data.available, price: data.price || 0 };
  } catch { return { available: null, price: 0 }; }
}

async function checkGoDaddyDomain(domain: string): Promise<{ available: boolean | null; price: number }> {
  try {
    const key = secrets.get('GODADDY_API_KEY');
    if (!key) return { available: null, price: 0 };
    const r = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${domain}`, {
      headers: { Authorization: `sso-key ${key}:${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { available: null, price: 0 };
    const data = await r.json();
    return { available: !!data.available, price: data.price ? data.price / 1000000 : 0 };
  } catch { return { available: null, price: 0 }; }
}

async function checkDomainAvailability(domain: string): Promise<{ available: boolean | null; price: number; source: string }> {
  const vercelToken = secrets.get('VERCEL_API_TOKEN');
  if (vercelToken) {
    const v = await checkVercelDomain(domain, vercelToken);
    if (v.available !== null) return { ...v, source: 'vercel' };
  }
  const g = await checkGoDaddyDomain(domain);
  if (g.available !== null) return { ...g, source: 'godaddy' };
  return { available: null, price: 0, source: 'none' };
}

const URL_PATTERNS = [
  { id: 'nearme', label: '[niche]nearme.com', template: '{niche}nearme.com' },
  { id: 'near', label: '[niche]near.com', template: '{niche}near.com' },
  { id: 'nearyou', label: '[niche]nearyou.com', template: '{niche}nearyou.com' },
  { id: 'phrase', label: '[phrase].com', template: '{phrase}.com' },
  { id: 'exact_match', label: '[exact-industry].com', template: '{industry}.com' },
  { id: 'local_modifier', label: '[city][niche].com', template: '{city}{niche}.com' },
];

function generateUrls(niche: string, patterns: string[], cities: string[] = []): string[] {
  const cleanNiche = niche.toLowerCase().replace(/[^a-z0-9]/g, '');
  const urls: string[] = [];
  for (const p of patterns) {
    const pattern = URL_PATTERNS.find(u => u.id === p);
    if (!pattern) continue;
    if (p === 'local_modifier' && cities.length > 0) {
      for (const city of cities) {
        urls.push(pattern.template.replace('{city}', city.toLowerCase().replace(/[^a-z0-9]/g, '')).replace('{niche}', cleanNiche));
      }
    } else if (p === 'phrase') {
      // Generate phrase-based URLs from niche variations
      const phrases = [cleanNiche, `best${cleanNiche}`, `top${cleanNiche}`, `find${cleanNiche}`, `${cleanNiche}pros`, `${cleanNiche}expert`];
      for (const phrase of phrases) urls.push(`${phrase}.com`);
    } else {
      urls.push(pattern.template.replace('{niche}', cleanNiche).replace('{industry}', cleanNiche));
    }
  }
  return [...new Set(urls)];
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── Action: generate_names — AI-assisted business name generation ──
    if (action === 'generate_names') {
      const { industry, location, style } = body;
      const result = await aiCompleteJson({
        model: MODELS.complex,
        messages: [
          { role: 'system', content: 'You are an expert brand strategist and SEO specialist. You generate business names that are optimized for Google search rankings, brand memorability, and industry dominance. Return ONLY valid JSON.' },
          { role: 'user', content: `Generate 10 optimal business names for a company in the "${industry}" industry${location ? ` based in ${location}` : ''}.
Style preference: ${style || 'professional and SEO-optimized'}.

For each name, provide:
1. The business name
2. Why it's optimized for Google (keyword relevance, exact match potential, brand memorability)
3. A potential domain URL (prefer .com, include nearme/nearyou variations where relevant)
4. SEO score (0-100) based on keyword relevance, memorability, and domain potential
5. Commercial intent level (low/medium/high/very_high)

Return JSON: {"names": [{"name": "...", "seo_reasoning": "...", "suggested_url": "...", "seo_score": 85, "commercial_intent": "high"}]}` },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      });
      return Response.json({ names: result.names || [] });
    }

    // ── Action: generate_urls — Generate NearMe/NearYou URL candidates ──
    if (action === 'generate_urls') {
      const { niche, patterns, cities } = body;
      const selectedPatterns = patterns || ['nearme', 'near', 'nearyou'];
      const selectedCities = cities || [];
      const domains = generateUrls(niche, selectedPatterns, selectedCities);

      // AI-score each domain for SEO potential
      const scored = await aiCompleteJson({
        model: MODELS.research,
        messages: [
          { role: 'system', content: 'You are an expert SEO strategist specializing in exact-match domain valuation and local search. Return ONLY valid JSON.' },
          { role: 'user', content: `Score these domains for SEO potential in the "${niche}" niche. For each domain, estimate:
1. Demand score (0-100) — how much search volume this domain pattern captures
2. Estimated monthly search volume
3. Estimated CPC in USD
4. Commercial intent (low/medium/high/very_high)
5. SEO score (0-100) — overall ranking potential
6. Whether to recommend it (true/false)

Domains: ${JSON.stringify(domains)}

Return JSON: {"candidates": [{"domain": "...", "demand_score": 85, "search_volume_estimate": 5000, "cpc_estimate": 3.50, "commercial_intent": "high", "seo_score": 90, "recommended": true}]}` },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });

      // Save candidates to entity
      const candidates = scored.candidates || [];
      if (candidates.length > 0) {
        await base44.entities.NearMeCandidate.bulkCreate(
          candidates.map((c: any) => ({
            domain: c.domain,
            niche,
            pattern_type: c.domain.includes('nearme') ? 'nearme' : c.domain.includes('nearyou') ? 'nearyou' : c.domain.includes('near.') ? 'near' : 'phrase',
            demand_score: c.demand_score || 0,
            search_volume_estimate: c.search_volume_estimate || 0,
            cpc_estimate: c.cpc_estimate || 0,
            commercial_intent: c.commercial_intent || 'high',
            seo_score: c.seo_score || 0,
            recommended: c.recommended || false,
            availability_status: 'unknown',
          }))
        );
      }

      return Response.json({ candidates, total: candidates.length });
    }

    // ── Action: check_availability — Check domain availability via Vercel + GoDaddy ──
    if (action === 'check_availability') {
      const { domains, limit } = body;
      let toCheck: string[] = [];

      if (domains && Array.isArray(domains)) {
        toCheck = domains;
      } else {
        // Get unchecked candidates from entity
        const candidates = await base44.entities.NearMeCandidate.filter(
          { availability_status: 'unknown' },
          { limit: limit || 20, fields: ['domain'] }
        );
        toCheck = candidates.items.map((c: any) => c.domain);
      }

      const results: any[] = [];
      for (const domain of toCheck) {
        const check = await checkDomainAvailability(domain);
        results.push({ domain, ...check });

        // Update entity record
        const records = await base44.entities.NearMeCandidate.filter({ domain }, { limit: 1 });
        if (records.items?.length > 0) {
          await base44.entities.NearMeCandidate.update(records.items[0].id, {
            availability_status: check.available === true ? 'available' : check.available === false ? 'unavailable' : 'unknown',
            registration_price: check.price,
          });
        }
      }

      const available = results.filter(r => r.available === true);
      return Response.json({ checked: results.length, available: available.length, results });
    }

    // ── Action: optimize_url — AI recommends the best URL for the industry ──
    if (action === 'optimize_url') {
      const { industry, location, budget } = body;
      const result = await aiCompleteJson({
        model: MODELS.complex,
        messages: [
          { role: 'system', content: 'You are an expert SEO strategist who specializes in Google algorithm optimization and exact-match domain acquisition. You know how to crack Google\'s local search algorithm using NearMe patterns, exact-match domains, and programmatic SEO. Return ONLY valid JSON.' },
          { role: 'user', content: `Recommend the BEST URL strategy for a business in the "${industry}" industry${location ? ` in ${location}` : ''}.
Budget: ${budget || 'any'}.

Consider:
1. NearMe.com patterns (e.g., "${industry.toLowerCase().replace(/[^a-z]/g, '')}nearme.com")
2. NearYou.com patterns
3. Exact-match industry domains
4. City + niche combinations
5. Google algorithm cracking methods for fastest page-1 rankings
6. Which URL pattern will achieve page 1 fastest and why

Return JSON: {
  "recommended_url": "the single best URL",
  "url_pattern": "nearme|nearyou|exact_match|local_modifier",
  "reasoning": "why this URL will rank fastest",
  "google_algorithm_advantage": "how this cracks Google's algorithm",
  "estimated_time_to_page1": "estimated time",
  "alternative_urls": ["3-5 backup URLs"],
  "registration_cost_estimate": "estimated cost",
  "seo_strategy_summary": "brief strategy for achieving page 1"
}` },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      });
      return Response.json({ recommendation: result });
    }

    // ── Action: generate_top30 — Combines all strategy session context to generate top 30 names+URLs ──
    if (action === 'generate_top30') {
      const { industry, location, god_mode_strategy, digital_dominance_targets, business_name_hint } = body;

      const contextStr = [
        industry ? `Industry: ${industry}` : '',
        location ? `Location: ${location}` : '',
        god_mode_strategy ? `God Mode Strategy: ${JSON.stringify(god_mode_strategy).slice(0, 2000)}` : '',
        digital_dominance ? `Digital Dominance Targets: ${(digital_dominance_targets || []).length} submission targets identified` : '',
      ].filter(Boolean).join('\n');

      const result = await aiCompleteJson({
        model: MODELS.complex,
        messages: [
          { role: 'system', content: 'You are the ultimate SEO business name and URL strategist. You combine industry intelligence, Google algorithm cracking strategies, and digital dominance data to generate the PERFECT business names and URLs. You know NearMe.com patterns, piggyback strategies, and exact-match domain advantages. Return ONLY valid JSON.' },
          { role: 'user', content: `Using ALL the accumulated strategy context below, generate the TOP 30 business names and URLs that are perfectly chosen for Google domination.

CONTEXT:
${contextStr}

Business name hint (if any): ${business_name_hint || 'none'}

For each of the 30 names+URLs:
1. Business name (memorable, SEO-optimized, brandable)
2. URL (prefer .com with NearMe/NearYou pattern)
3. URL pattern type (nearme, nearyou, exact_match, local_modifier, phrase)
4. SEO score (0-100)
5. Commercial intent (low/medium/high/very_high)
6. Why this name+URL will dominate Google
7. Google algorithm advantage (how it cracks a specific ranking factor)
8. Estimated time to page 1
9. NearMe benefit score (0-100, how much the NearMe pattern helps)
10. Piggyback potential (can this name expand to other industries?)

Rank them from #1 (best) to #30. The top 5 should be NearMe.com patterns.

Return JSON: {
  "top30": [{
    "rank": 1,
    "business_name": "...",
    "url": "...",
    "pattern_type": "nearme",
    "seo_score": 95,
    "commercial_intent": "very_high",
    "reasoning": "...",
    "google_advantage": "...",
    "time_to_page1": "2-3 months",
    "nearme_benefit": 95,
    "piggyback_potential": "high"
  }]
}` },
        ],
        temperature: 0.6,
        max_tokens: 8192,
      });

      const top30 = result.top30 || [];

      // Check availability for the top 10
      const top10Domains = top30.slice(0, 10).map((t: any) => t.url);
      const availabilityResults: any[] = [];
      for (const domain of top10Domains) {
        const check = await checkDomainAvailability(domain);
        availabilityResults.push({ domain, ...check });
      }

      // Enrich top30 with availability
      const enriched = top30.map((t: any) => {
        const avail = availabilityResults.find(a => a.domain === t.url);
        return {
          ...t,
          availability: avail?.available,
          registration_price: avail?.price || 0,
        };
      });

      return Response.json({ top30: enriched, total: enriched.length, available_count: enriched.filter((t: any) => t.availability === true).length });
    }

    return Response.json({ error: 'Invalid action. Use: generate_names, generate_urls, check_availability, optimize_url, generate_top30' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
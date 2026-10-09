// ─────────────────────────────────────────────────────────────────────────────
// GodModeEngine — Real Monte Carlo SEO Simulation
// Uses ACTUAL market data (search volume, CPC, lead value) to project
// realistic revenue, profit, and break-even timelines.
//
// Forecasts are scenarios, NOT observed revenue or Google's ranking algorithm.
// Inputs need provenance; conversion and ranking defaults are modelling assumptions.
// Seeded mathematics models hypothetical SEO dynamics:
//   indexation → ranking → traffic → leads → revenue → profit
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketData {
  industry: string;
  monthly_search_volume: number;
  avg_cpc: number;
  lead_value: number;
  competition_level: string;
  cities_available: number;
  top_competitors: string[];
  keyword_examples: string[];
  niche_description: string;
}

export interface SimConfig {
  name: string;
  page_count: number;
  cities: number;
  services_per_city: number;
  ai_cost_per_page: number;
  hosting_cost_monthly: number;
  domain_cost_yearly: number;
}

export interface IterationResult {
  revenue_12mo: number;
  profit_12mo: number;
  break_even_month: number;
  leads_12mo: number;
  traffic_12mo: number;
}

export interface SimulationResult {
  p10: IterationResult;
  p50: IterationResult;
  p90: IterationResult;
  assumptions: {
    base_time_to_rank: number;
    base_ctr: number;
    base_conversion_rate: number;
    search_volume_per_page: number;
    total_initial_cost: number;
    monthly_recurring_cost: number;
  };
  monthly_projection: Array<{
    month: number;
    traffic_p50: number;
    leads_p50: number;
    revenue_p50: number;
    costs_p50: number;
    profit_p50: number;
  }>;
  iterations: number;
}

// Competition-based defaults (from SEO industry benchmarks)
// ctr = click-through rate from search results to site
// conversionRate = visitor → lead (form fill, call, etc.)
// closeRate = lead → paying customer (typical 10-20% for local services)
function getCompetitionDefaults(competition: string) {
  switch (competition?.toLowerCase()) {
    case 'low': return { timeToRank: 2, ctr: 0.12, conversionRate: 0.04, closeRate: 0.20 };
    case 'medium': return { timeToRank: 4, ctr: 0.08, conversionRate: 0.03, closeRate: 0.15 };
    case 'high': return { timeToRank: 6, ctr: 0.05, conversionRate: 0.02, closeRate: 0.12 };
    case 'very_high': return { timeToRank: 8, ctr: 0.03, conversionRate: 0.015, closeRate: 0.10 };
    default: return { timeToRank: 4, ctr: 0.08, conversionRate: 0.03, closeRate: 0.15 };
  }
}

export function seededRandom(input: string) {
  let state = 2166136261;
  for (let i = 0; i < input.length; i++) state = Math.imul(state ^ input.charCodeAt(i), 16777619);
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Box-Muller, driven only by a frozen input seed.
function gaussian(mean: number, stdDev: number, random: () => number): number {
  const u1 = Math.max(1e-10, random());
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function clamp(v: number, min: number): number {
  return Math.max(min, v);
}

export function runSimulation(market: MarketData, config: SimConfig, iterations = 1000): SimulationResult {
  if (![market.monthly_search_volume, market.lead_value, market.cities_available].every(v => Number.isFinite(v) && v > 0)) throw new Error('Missing numeric market inputs; simulation withheld.');
  iterations = Math.max(100, Math.min(5000, Math.floor(iterations)));
  const numericInputs = { monthly_search_volume: market.monthly_search_volume, lead_value: market.lead_value, cities_available: market.cities_available, competition_level: market.competition_level };
  const seed = JSON.stringify({ algorithm: 'seo-scenario-v2', market: numericInputs, config, iterations });
  const random = seededRandom(seed);
  const defaults = getCompetitionDefaults(market.competition_level);
  const coveredSearchVolume = market.monthly_search_volume * Math.min(1, config.cities / market.cities_available);
  const searchVolumePerPage = coveredSearchVolume / Math.max(config.page_count, 1);

  const totalInitialCost = config.ai_cost_per_page * config.page_count + config.domain_cost_yearly;
  const monthlyRecurringCost = config.hosting_cost_monthly;

  const results: IterationResult[] = [];
  const monthlyAccumulator: IterationResult[][] = Array.from({ length: 12 }, () => []);

  for (let i = 0; i < iterations; i++) {
    // Sample from distributions centered on REAL data
    const timeToRank = clamp(Math.round(gaussian(defaults.timeToRank, 1.5, random)), 1);
    const ctr = Math.min(1, clamp(gaussian(defaults.ctr, 0.02, random), 0.01));
    const conversionRate = Math.min(1, clamp(gaussian(defaults.conversionRate, 0.01, random), 0.005));
    const closeRate = Math.min(1, clamp(gaussian(defaults.closeRate, 0.03, random), 0.05));
    const leadValue = clamp(gaussian(market.lead_value, market.lead_value * 0.2, random), 0.01);

    let cumulativeProfit = -totalInitialCost;
    let breakEvenMonth = -1;
    let totalRevenue = 0;
    let totalLeads = 0;
    let totalTraffic = 0;

    const monthly: IterationResult[] = [];

    for (let month = 1; month <= 12; month++) {
      let traffic: number;
      if (month < timeToRank) {
        // Indexation phase — minimal traffic (2% of potential)
        traffic = config.page_count * searchVolumePerPage * 0.02;
      } else {
        // Ranking phase — ramp up over 3 months to full potential
        const rampFactor = Math.min(1, (month - timeToRank + 1) / 3);
        traffic = config.page_count * searchVolumePerPage * ctr * rampFactor;
      }

      const leads = traffic * conversionRate;
      const customers = leads * closeRate;
      const revenue = customers * leadValue;
      const costs = monthlyRecurringCost;
      const profit = revenue - costs;

      cumulativeProfit += profit;
      if (breakEvenMonth === -1 && cumulativeProfit > 0) {
        breakEvenMonth = month;
      }

      totalRevenue += revenue;
      totalLeads += leads;
      totalTraffic += traffic;

      monthly.push({
        revenue_12mo: revenue,
        profit_12mo: profit - (month === 1 ? totalInitialCost : 0),
        break_even_month: breakEvenMonth,
        leads_12mo: leads,
        traffic_12mo: traffic,
      });
    }

    const finalResult: IterationResult = {
      revenue_12mo: totalRevenue,
      profit_12mo: cumulativeProfit,
      break_even_month: breakEvenMonth === -1 ? 99 : breakEvenMonth,
      leads_12mo: totalLeads,
      traffic_12mo: totalTraffic,
    };
    results.push(finalResult);

    for (let m = 0; m < 12; m++) {
      monthlyAccumulator[m].push(monthly[m]);
    }
  }

  // Sort by profit and get percentiles
  const sorted = [...results].sort((a, b) => a.profit_12mo - b.profit_12mo);
  const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];

  const roundResult = (r: IterationResult): IterationResult => ({
    revenue_12mo: Math.round(r.revenue_12mo),
    profit_12mo: Math.round(r.profit_12mo),
    break_even_month: r.break_even_month,
    leads_12mo: Math.round(r.leads_12mo),
    traffic_12mo: Math.round(r.traffic_12mo),
  });

  // Median monthly projection
  const monthlyProjection = monthlyAccumulator.map((monthResults, idx) => {
    const sortedMonth = [...monthResults].sort((a, b) => a.profit_12mo - b.profit_12mo);
    const median = sortedMonth[Math.floor(sortedMonth.length / 2)];
    return {
      month: idx + 1,
      traffic_p50: Math.round(median.traffic_12mo),
      leads_p50: Math.round(median.leads_12mo),
      revenue_p50: Math.round(median.revenue_12mo),
      costs_p50: Math.round(monthlyRecurringCost + (idx === 0 ? totalInitialCost : 0)),
      profit_p50: Math.round(median.profit_12mo),
    };
  });

  return {
    p10: roundResult(pct(0.1)),
    p50: roundResult(pct(0.5)),
    p90: roundResult(pct(0.9)),
    assumptions: {
      base_time_to_rank: defaults.timeToRank,
      base_ctr: defaults.ctr,
      base_conversion_rate: defaults.conversionRate,
      base_close_rate: defaults.closeRate,
      search_volume_per_page: Math.round(searchVolumePerPage),
      total_initial_cost: Math.round(totalInitialCost),
      monthly_recurring_cost: Math.round(monthlyRecurringCost),
      assumption_disclosure: 'CTR, conversion, close rate, ranking delay, hosting and generation prices are scenario assumptions, not measured statistics.',
      demand_cap: market.monthly_search_volume,
      algorithm_version: 'seo-scenario-v2',
    },
    monthly_projection: monthlyProjection,
    iterations,
  };
}

// Generate 3 deterministic strategies from market data
export function generateStrategies(market: MarketData): Array<SimConfig & { simulation: SimulationResult; total_cost: number; roi_p50: number }> {
  const configs: SimConfig[] = [
    {
      name: 'Conservative',
      page_count: 50,
      cities: 10,
      services_per_city: 5,
      ai_cost_per_page: 1.50,
      hosting_cost_monthly: 20,
      domain_cost_yearly: 12,
    },
    {
      name: 'Moderate',
      page_count: 200,
      cities: 40,
      services_per_city: 5,
      ai_cost_per_page: 1.00,
      hosting_cost_monthly: 50,
      domain_cost_yearly: 12,
    },
    {
      name: 'Aggressive',
      page_count: 500,
      cities: 100,
      services_per_city: 5,
      ai_cost_per_page: 0.75,
      hosting_cost_monthly: 100,
      domain_cost_yearly: 12,
    },
  ];

  return configs.map(config => {
    const simulation = runSimulation(market, config, 1000);
    const total_cost = config.ai_cost_per_page * config.page_count + config.hosting_cost_monthly * 12 + config.domain_cost_yearly;
    const roi_p50 = simulation.p50.profit_12mo / total_cost;
    return { ...config, simulation, total_cost: Math.round(total_cost), roi_p50: Math.round(roi_p50 * 100) / 100 };
  });
}

// Rank by downside return; stable tie-breaking is independent of AI opinion.
export function pickWinner(strategies: any[]): any {
  if (!strategies.length) throw new Error('No strategies to compare.');
  return [...strategies].sort((a, b) =>
    (b.simulation.p10.profit_12mo / b.total_cost) - (a.simulation.p10.profit_12mo / a.total_cost)
    || b.roi_p50 - a.roi_p50 || a.name.localeCompare(b.name)
  )[0];
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-6-astra';

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const requestBody = JSON.stringify({
    model: DEFAULT_MODEL,
    messages,
    stream: false,
  });

  let response: Response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
      signal: AbortSignal.timeout(120000),
    });
    if (response.ok) break;
    if ([403, 429, 500, 503].includes(response.status) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      continue;
    }
    const errText = await response.text();
    throw new Error(`AI Gateway error: ${response.status} — ${errText.substring(0, 200)}`);
  }

  const data = await response!.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseJsonResponse(raw: string): any {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return null;
}

function buildContextSummary(context: any): string {
  const lines: string[] = [];
  if (context?.full_name) lines.push(`Name: ${context.full_name}`);
  if (context?.phone) lines.push(`Phone: ${context.phone}`);
  if (context?.email) lines.push(`Email: ${context.email}`);
  if (context?.business_address) lines.push(`Business Address: ${context.business_address}`);
  if (context?.business_type) lines.push(`Business Type: ${context.business_type}`);
  if (context?.vision_statement) lines.push(`Vision Statement: ${context.vision_statement}`);
  if (context?.selected_topic) lines.push(`Selected Research Topic: ${context.selected_topic}`);
  return lines.join('\n') || '(no prior context — this is the first step)';
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action, context, field, partialText, sessionId } = body;

    const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
    if (!apiKey) return Response.json({ error: 'VERCEL_AI_GATEWAY_API_KEY not set' }, { status: 500 });

    const ctxSummary = buildContextSummary(context || {});

    // ── Action: complete (AI-assisted field completion) ──
    if (action === 'complete') {
      const fieldLabels: Record<string, string> = {
        full_name: 'the person\'s full name',
        phone: 'a realistic US phone number in (XXX) XXX-XXXX format',
        email: 'a professional email address',
        business_address: 'a realistic street address with city, state, and ZIP',
        vision_statement: 'a compelling vision statement continuation',
      };
      const guidance = fieldLabels[field] || 'a relevant suggestion for this field';

      const systemPrompt = `You are an expert business strategist AI assistant. You help users fill out an onboarding form by suggesting intelligent completions based on what they've typed and the context of their business. Return ONLY valid JSON: {"suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]}`;

      const userPrompt = `The user is filling out a form field for "${field}". They typed so far: "${partialText || '(nothing yet)'}".

Everything they've provided in prior steps:
${ctxSummary}

Generate 5 of the BEST suggestions to complete this field. Each suggestion should be ${guidance}. Tailor each suggestion to the prior context. Make them distinct from each other. Return ONLY JSON.`;

      const raw = await callAI(apiKey, systemPrompt, userPrompt);
      const parsed = parseJsonResponse(raw);
      if (parsed?.suggestions) return Response.json({ suggestions: parsed.suggestions });
      return Response.json({ suggestions: [], raw });
    }

    // ── Action: generate_vision (AI completes the vision statement) ──
    if (action === 'generate_vision') {
      const systemPrompt = `You are an expert brand strategist. The user started typing a vision statement. Your job is to FINISH their sentence with intelligent word and sentence completion. Return ONLY the completed vision statement text — no JSON, no markdown, no explanation. The completed statement should be 2-4 sentences, compelling, and tailored to the user's context.`;

      const userPrompt = `The user started typing their vision statement:
"${partialText || ''}"

Everything they've provided in prior steps:
${ctxSummary}

Finish their vision statement. Keep what they wrote and complete it intelligently. Return ONLY the completed vision statement text.`;

      const raw = await callAI(apiKey, systemPrompt, userPrompt);
      const completed = raw.trim().replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
      return Response.json({ vision: completed });
    }

    // ── Action: discover_topics (top 10 Google-searched problem topics) ──
    if (action === 'discover_topics') {
      const year = new Date().getFullYear();
      const systemPrompt = `You are an expert market researcher and SEO strategist. You know the top Google search trends and most-searched topics. Return ONLY valid JSON: {"topics": [{"title": "short topic name (3-6 words)", "search_volume": "estimated monthly searches", "problem": "the core problem this topic addresses (1-2 sentences)", "opportunity": "why solving this is a business opportunity (1 sentence)"}]}`;

      const userPrompt = `Based on the user's business context below, identify the TOP 10 most-searched Google topics related to PROBLEMS THAT NEED SOLVED in their industry/area. These should be real, high-search-volume topics that people actively Google when they have a problem this business could solve.

User context:
${ctxSummary}

For each topic, provide: title, estimated search volume, the core problem, and the business opportunity. Rank them by search volume (highest first). Return ONLY JSON with exactly 10 topics.`;

      const raw = await callAI(apiKey, systemPrompt, userPrompt);
      const parsed = parseJsonResponse(raw);
      if (parsed?.topics) return Response.json({ topics: parsed.topics });
      return Response.json({ topics: [], raw });
    }

    // ── Action: skip_trace (background research on user + business) ──
    if (action === 'skip_trace') {
      const systemPrompt = `You are an expert skip tracer and business intelligence analyst. You research publicly available information about a person and their business to build a comprehensive profile. Return ONLY valid JSON.`;

      const userPrompt = `Conduct a thorough skip trace and business intelligence analysis on the following person and their business. Use your knowledge to research and infer publicly available information.

PERSON & BUSINESS INFO:
${ctxSummary}

Analyze and return a JSON object with this structure:
{
  "business_analysis": {
    "industry_outlook": "2-3 sentences on the industry outlook for this type of business",
    "target_market": "who their likely customers are",
    "competitive_landscape": "2-3 sentences on the competitive landscape",
    "key_differentiators": ["3-5 potential differentiators for this business"]
  },
  "digital_footprint": {
    "likely_online_presence": "what online presence they likely have or need",
    "social_media_recommendations": ["3-5 platform recommendations with why"],
    "website_assessment": "assessment of their likely current website situation"
  },
  "market_opportunities": {
    "top_opportunities": ["3-5 specific market opportunities"],
    "local_seo_potential": "assessment of local SEO potential based on their address",
    "content_gaps": ["3-5 content gaps they could exploit"]
  },
  "risk_factors": ["3-5 potential risk factors to be aware of"],
  "recommended_next_steps": ["5-7 specific actionable next steps for this business"],
  "research_summary": "2-3 sentence summary of findings"
}

Return ONLY the JSON object.`;

      const raw = await callAI(apiKey, systemPrompt, userPrompt);
      const parsed = parseJsonResponse(raw);
      if (parsed) return Response.json({ results: parsed });
      return Response.json({ results: null, raw });
    }

    return Response.json({ error: 'Invalid action. Use: complete, generate_vision, discover_topics, or skip_trace' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
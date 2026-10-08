import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-6-astra';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { website_id, location, service, model } = body;

    if (!website_id || !location || !service) {
      return Response.json({ error: 'website_id, location, and service are required' }, { status: 400 });
    }

    // Load the website template
    const website = await base44.entities.Website.get(website_id);
    if (!website) return Response.json({ error: 'Website not found' }, { status: 404 });

    // Load active programmatic rules
    const rulesPage = await base44.entities.ProgrammaticRule.filter({ active: true }, { limit: 100 });
    const rules = (rulesPage.items || []).map((r: any) => `- ${r.rule_name}: ${r.rule_description}`);

    // Build the generation prompt
    const prompt = `You are a programmatic SEO expert. Generate a complete, Google-compliant HTML page by adapting the template below for the location "${location}" and service "${service}".

TEMPLATE HTML:
${website.preview_html || '(no template provided — create from scratch)'}

BRAND TOKENS:
${website.brand_tokens || '(none provided)'}

GOOGLE COMPLIANCE RULES (follow ALL of these):
${rules.join('\n')}

REQUIREMENTS:
1. Adapt the template for ${location} and ${service} — do NOT just swap tokens. Each section must have genuinely different content.
2. Include real local specifics about ${location} (landmarks, neighborhoods, local context, nearby areas).
3. Make the content genuinely unique and valuable for this specific location+service combination.
4. Include proper <title> tag, <meta name="description">, <link rel="canonical">, and structured data (schema.org LocalBusiness or Service).
5. Ensure mobile-first responsive design with proper viewport meta tag.
6. Include internal links to related pages (e.g., /{location}/{other-services}).
7. Demonstrate E-E-A-T signals (expertise, experience, authority, trust).
8. Return ONLY the complete HTML document. No markdown, no code fences, no explanations.`;

    // Call Vercel AI Gateway
    const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
    if (!apiKey) return Response.json({ error: 'VERCEL_AI_GATEWAY_API_KEY not set' }, { status: 500 });

    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return Response.json({ error: `AI Gateway error: ${aiResponse.status} — ${errText.substring(0, 500)}` }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    const htmlContent = aiData.choices?.[0]?.message?.content || '';

    if (!htmlContent) {
      return Response.json({ error: 'AI Gateway returned empty content' }, { status: 502 });
    }

    // Self-assess compliance
    const compliancePrompt = `You are a Google compliance auditor. Score this HTML page against these rules. Return ONLY a JSON object (no markdown, no code fences) with "score" (integer 0-100) and "notes" (one sentence per critical rule: pass or fail).

RULES:
${rules.join('\n')}

HTML PAGE (first 8000 chars):
${htmlContent.substring(0, 8000)}

Return ONLY: {"score": 85, "notes": "..."}`;

    let complianceScore = 0;
    let complianceNotes = '';

    try {
      const complianceResponse = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          messages: [{ role: 'user', content: compliancePrompt }],
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();
        const complianceText = complianceData.choices?.[0]?.message?.content || '';
        const jsonMatch = complianceText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          complianceScore = parsed.score || 0;
          complianceNotes = parsed.notes || '';
        }
      }
    } catch (e) {
      complianceNotes = 'Compliance check skipped';
    }

    // Generate URL slug
    const slug = `${String(location).toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${String(service).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    // Create the generated page record
    const page = await base44.entities.GeneratedPage.create({
      website_id,
      location,
      service,
      url_slug: slug,
      html_content: htmlContent,
      compliance_score: complianceScore,
      compliance_notes: complianceNotes,
      status: 'ready',
    });

    return Response.json({
      page_id: page.id,
      html_content: htmlContent,
      compliance_score: complianceScore,
      compliance_notes: complianceNotes,
      url_slug: slug,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
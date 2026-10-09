// Generates AI-driven social media content via Vercel AI Gateway.
// Creates SocialPost records ready for scheduling and publishing.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiCompleteJson, MODELS } from '../../shared/vercelAiGateway.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { topic, platform, count, brand_info, category } = body;

    if (!topic) return Response.json({ error: 'topic is required' }, { status: 400 });

    const platformTarget = platform || 'all';
    const postCount = Math.min(count || 3, 10);
    const brand = brand_info || 'a growing digital marketing agency';
    const cat = category || 'promotional';

    const prompt = `You are a social media content expert. Generate ${postCount} unique social media posts about "${topic}" for ${brand}.
Platform: ${platformTarget}
Category: ${cat}

Return ONLY a JSON object (no markdown, no code fences) with this exact shape:
{
  "posts": [
    {
      "title": "Short title for internal tracking",
      "content": "The full post text, ready to publish. Include relevant hashtags. Tailored for ${platformTarget}.",
      "category": "${cat}",
      "platform": "${platformTarget}"
    }
  ]
}

Make each post genuinely different in angle, tone, and hook. No generic filler.`;

    const result = await aiCompleteJson<{ posts: any[] }>({
      model: MODELS.social,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 4096,
    });

    const posts = result.posts || [];
    if (!posts.length) return Response.json({ error: 'AI generated no posts' }, { status: 500 });

    // Create SocialPost records
    const created = await base44.asServiceRole.entities.SocialPost.bulkCreate(
      posts.map((p: any) => ({
        title: p.title || `Post about ${topic}`,
        content: p.content || '',
        category: p.category || cat,
        platform: p.platform || platformTarget,
        status: 'draft',
      }))
    );

    return Response.json({ created: created.length, posts: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
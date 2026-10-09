// Generates media assets — social posts, ad creatives, image prompts, business cards.
// Uses Vercel AI Gateway for content generation. Creates MediaAsset records.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiComplete, aiCompleteJson, MODELS } from '../../shared/vercelAiGateway.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { name, asset_type, prompt, platform, count, business_info } = body;

    if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });

    const type = asset_type || 'image';
    const plat = platform || 'general';
    const numAssets = Math.min(count || 1, 5);
    const biz = business_info || 'a digital marketing agency';

    // Create initial MediaAsset record(s)
    const assets = await base44.asServiceRole.entities.MediaAsset.bulkCreate(
      Array.from({ length: numAssets }, (_, i) => ({
        name: name || `Asset ${Date.now()}_${i}`,
        asset_type: type,
        prompt,
        platform: plat,
        status: 'generating',
      }))
    );

    let generatedContent: any = {};

    switch (type) {
      case 'social_post': {
        const result = await aiCompleteJson({
          model: MODELS.social,
          messages: [{ role: 'user', content: `Generate a ${plat} social media post for ${biz}. Topic: ${prompt}. Return JSON: {"content": "post text with hashtags", "title": "short title"}` }],
          temperature: 0.85,
        });
        generatedContent = result;
        break;
      }

      case 'card':
      case 'graphic': {
        // Generate a detailed image prompt + copy for a business card or graphic
        const result = await aiCompleteJson({
          model: MODELS.complex,
          messages: [{ role: 'user', content: `Design a ${type} for ${biz}. Details: ${prompt}. Return JSON with: {"image_prompt": "detailed DALL-E image generation prompt", "headline": "main text", "subtext": "supporting text", "color_scheme": "hex colors"}` }],
          temperature: 0.6,
        });
        generatedContent = result;
        break;
      }

      case 'ad_creative': {
        const result = await aiCompleteJson({
          model: MODELS.social,
          messages: [{ role: 'user', content: `Create ${numAssets} ad creative variants for ${biz}. Product/Service: ${prompt}. Platform: ${plat}. Return JSON: {"ads": [{"headline": "", "body": "", "cta": "", "image_prompt": ""}]}` }],
          temperature: 0.8,
        });
        generatedContent = result;
        break;
      }

      case 'image':
      case 'video':
      default: {
        // Generate a detailed prompt and content description
        const result = await aiComplete({
          model: MODELS.complex,
          messages: [{ role: 'user', content: `Create a detailed ${type} generation prompt for: ${prompt}. Context: ${biz}. Platform: ${plat}. Return only the prompt text, ready to paste into an image/video generator.` }],
          temperature: 0.7,
        });
        generatedContent = { generation_prompt: result };
        break;
      }
    }

    // Update all created assets with the generated content
    const updatePromises = assets.map((a: any) =>
      base44.asServiceRole.entities.MediaAsset.update(a.id, {
        status: 'ready',
        file_url: generatedContent.image_prompt || generatedContent.generation_prompt || '',
        metadata: JSON.stringify(generatedContent).substring(0, 5000),
      })
    );
    await Promise.allSettled(updatePromises);

    return Response.json({ count: assets.length, assets: assets.map((a: any) => a.id), content: generatedContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
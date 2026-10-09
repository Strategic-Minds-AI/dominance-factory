import { aiCompleteJson, generateImage, MODELS } from '../../shared/vercelAiGateway.ts';

export default async function handler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  // ── Action: create_30_day_content — 30 days of social media content ──
  if (action === 'create_30_day_content') {
    const { industry, business_name, platforms, tone } = body;
    const result = await aiCompleteJson({
      model: MODELS.complex,
      messages: [
        { role: 'system', content: 'You are an expert social media content strategist. You create engaging, viral-worthy content with proper hashtags, optimal posting times, and platform-specific formatting. Return ONLY valid JSON.' },
        { role: 'user', content: `Create a 30-DAY social media content calendar for "${business_name || industry}" in the "${industry}" industry.

Platforms: ${platforms || 'facebook, instagram, twitter, linkedin, tiktok'}
Tone: ${tone || 'professional yet engaging'}

For EACH of the 30 days, create content for ALL platforms:
1. Day number and date (starting tomorrow)
2. Content theme for the day
3. For each platform:
   - Post text (platform-optimized: Instagram=visual+hashtags, Twitter=concise, LinkedIn=professional, TikTok=trendy, Facebook=engaging)
   - Hashtags (5-15 relevant hashtags, including #NearMe and industry-specific)
   - Best posting time for that platform
   - Content type (text, image, video, carousel, story, reel)
   - Call to action
   - Image prompt (for image posts)
   - Video script (for video posts)

Mix content types: educational (30%), promotional (20%), engagement (20%), behind-the-scenes (15%), user-generated/case-study (15%)

Return JSON: {
  "calendar": [{
    "day": 1,
    "date": "2026-10-10",
    "theme": "...",
    "posts": [{
      "platform": "instagram",
      "text": "...",
      "hashtags": ["#nearme", "#industry"],
      "best_time": "09:00",
      "content_type": "image",
      "cta": "...",
      "image_prompt": "...",
      "video_script": "..."
    }]
  }],
  "strategy_summary": "..."
}` },
      ],
      temperature: 0.6,
      max_tokens: 16384,
    });
    return Response.json({ calendar: result.calendar || [], strategy_summary: result.strategy_summary || '' });
  }

  // ── Action: find_video_templates — finds top video templates from trending videos ──
  if (action === 'find_video_templates') {
    const { industry, niche } = body;
    const result = await aiCompleteJson({
      model: MODELS.research,
      messages: [
        { role: 'system', content: 'You are a viral video strategist. You know which video formats, hooks, and templates perform best on TikTok, Instagram Reels, and YouTube Shorts. You find the top-performing video templates and adapt them for any industry. Return ONLY valid JSON.' },
        { role: 'user', content: `Find the TOP 10 viral video templates for the "${industry || niche}" industry. These should be based on real trending video formats that work right now.

For each template:
1. Template name (e.g., "Before/After Transformation", "Day in the Life", "POV")
2. Why it goes viral (the psychology)
3. Hook (first 3 seconds — the most important part)
4. Video structure (step-by-step breakdown)
5. Duration (15s, 30s, 60s)
6. Platform (TikTok, Reels, Shorts)
7. NearMe adaptation (how to make it location-specific)
8. Script template (with [BRACKETS] for customizable parts)
9. Hashtags
10. Estimated views range

Return JSON: {
  "templates": [{
    "name": "...",
    "why_viral": "...",
    "hook": "...",
    "structure": ["Step 1: ...", "Step 2: ..."],
    "duration": "30s",
    "platform": "TikTok",
    "nearme_adaptation": "...",
    "script_template": "...",
    "hashtags": ["#nearme", "#viral"],
    "est_views": "10K-100K"
  }]
}` },
      ],
      temperature: 0.4,
      max_tokens: 16384,
    });
    return Response.json({ templates: result.templates || [] });
  }

  // ── Action: generate_social_image — generates an image for social media ──
  if (action === 'generate_social_image') {
    const { prompt, platform } = body;
    const size = platform === 'instagram' || platform === 'tiktok' ? '1024x1024' : '1792x1024';
    const result = await generateImage({ prompt, size: size as any, quality: 'hd' });
    return Response.json({ urls: result.urls });
  }

  // ── Action: generate_video_script — generates a NearMe video script ──
  if (action === 'generate_video_script') {
    const { industry, business_name, template, location } = body;
    const result = await aiCompleteJson({
      model: MODELS.complex,
      messages: [
        { role: 'system', content: 'You are a viral video script writer specializing in NearMe local business videos. You write scripts that rank on YouTube and go viral on TikTok/Reels. Return ONLY valid JSON.' },
        { role: 'user', content: `Write a complete video script for "${business_name || industry}" using the "${template || 'Before/After'}" template.

Location: ${location || 'national'}
Industry: ${industry}

The script must include:
1. Hook (first 3 seconds — must grab attention)
2. Intro (5 seconds)
3. Main content (body of the video)
4. NearMe call-out (mention "near me" naturally)
5. Social proof / credibility
6. Call to action
7. Outro

Also include:
- Scene-by-scene visual directions
- Voiceover text
- On-screen text overlays
- Music suggestion
- Estimated duration
- Thumbnail concept

Return JSON: {
  "script": {
    "hook": "...",
    "intro": "...",
    "main_content": "...",
    "nearme_callout": "...",
    "social_proof": "...",
    "cta": "...",
    "outro": "..."
  },
  "scenes": [{"scene": 1, "visual": "...", "voiceover": "...", "on_screen_text": "...", "duration": "3s"}],
  "music": "...",
  "total_duration": "30s",
  "thumbnail_concept": "...",
  "hashtags": ["#nearme", "#industry"]
}` },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    });
    return Response.json({ script: result });
  }

  // ── Action: create_autonomous_agent_plan — plan for super agents to operate everything ──
  if (action === 'create_autonomous_agent_plan') {
    const { industry, business_name, website_count } = body;
    const result = await aiCompleteJson({
      model: MODELS.heavy,
      messages: [
        { role: 'system', content: 'You are an expert AI agent architect. You design super agent systems that can autonomously operate websites, social media, and customer communication end-to-end without human intervention. Return ONLY valid JSON.' },
        { role: 'user', content: `Design a complete super agent system for "${business_name || industry}" in the "${industry}" industry with ${website_count || 100} websites.

The system must be FULLY AUTONOMOUS — super agents that:
1. Generate websites automatically
2. Create and post social media content automatically
3. Schedule posts across all platforms
4. Respond to comments and messages
5. Run A/B tests automatically
6. Monitor analytics and optimize
7. Generate new content based on performance
8. Communicate with customers/leads
9. Manage the entire online presence

For each agent, provide:
- Agent name and ID
- Role (what it does)
- Responsibilities (detailed list)
- Tools it uses (which APIs, platforms, systems)
- Autonomy level (what it can do without approval)
- Approval gates (what requires human approval)
- Schedule (how often it runs)
- Inputs and outputs
- How it coordinates with other agents

Return JSON: {
  "agents": [{
    "id": "A01",
    "name": "Website Generation Agent",
    "role": "...",
    "responsibilities": ["..."],
    "tools": ["..."],
    "autonomy_level": "fully autonomous for website generation",
    "approval_gates": ["domain registration requires approval"],
    "schedule": "continuous",
    "inputs": "...",
    "outputs": "...",
    "coordinates_with": ["A02", "A03"]
  }],
  "orchestration": "how the agents work together",
  "autonomous_workflow": "step-by-step of how the system runs without humans"
}` },
      ],
      temperature: 0.5,
      max_tokens: 16384,
    });
    return Response.json({ agents: result.agents || [], orchestration: result.orchestration, autonomous_workflow: result.autonomous_workflow });
  }

  return Response.json({ error: 'Invalid action. Use: create_30_day_content, find_video_templates, generate_social_image, generate_video_script, create_autonomous_agent_plan' }, { status: 400 });
}
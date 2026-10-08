import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const AI_GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-6-astra';

const SYSTEM_PROMPT = `You are a helpful AI assistant (like ChatGPT) that can also edit a live HTML visual preview the user sees on the right side of their screen.

When the user asks you to create, build, modify, redesign, or edit the design/website/page:
- Return JSON: {"action": "edit", "html": "the complete updated HTML document", "message": "a brief friendly description of what you changed"}

When the user is chatting, asking questions, discussing ideas, or NOT requesting design changes:
- Return JSON: {"action": "chat", "message": "your natural conversational response"}

Rules for editing:
- Always return the COMPLETE HTML document (full <!DOCTYPE html>...</html>), not just the changed parts.
- Preserve all existing content the user didn't ask to change.
- Make clean, modern, responsive designs with good typography and spacing.
- Use inline CSS or <style> tags within the HTML (no external stylesheets).
- Use high-quality stock images from Unsplash where images are needed (https://images.unsplash.com/...).

Always return ONLY valid JSON. No markdown, no code fences, no text before or after.`;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { message, current_html, history, model } = body;

    if (!message) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
    if (!apiKey) return Response.json({ error: 'VERCEL_AI_GATEWAY_API_KEY not set' }, { status: 500 });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []),
      {
        role: 'user',
        content: `CURRENT HTML:\n\`\`\`html\n${current_html || '(empty — create from scratch)'}\n\`\`\`\n\nUSER COMMAND: ${message}`,
      },
    ];

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `AI Gateway error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsed: any;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {}

    if (parsed && parsed.action === 'chat' && parsed.message) {
      return Response.json({
        action: 'chat',
        message: parsed.message,
      });
    }

    if (parsed && parsed.html) {
      return Response.json({
        action: 'edit',
        html: parsed.html,
        message: parsed.message || 'Updated the design.',
      });
    }

    // Fallback: if response looks like HTML, use it directly
    const trimmed = rawContent.trim().replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
    if (trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE')) {
      return Response.json({
        action: 'edit',
        html: trimmed,
        message: 'Updated the design.',
      });
    }

    // Fallback: treat as plain chat
    if (rawContent.trim()) {
      return Response.json({
        action: 'chat',
        message: rawContent.trim(),
      });
    }

    return Response.json({ error: 'AI returned an empty response' }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
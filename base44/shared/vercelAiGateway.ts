// Unified Vercel AI Gateway — routes ALL LLM calls through https://ai-gateway.vercel.sh/v1
// Bypasses Base44 integration credit limits entirely. Uses the user's Vercel account.
import { secrets } from 'base44:runtime';

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

export const MODELS = {
  fast: 'openai/gpt-6-astra',
  research: 'google/gemini-2.5-flash',
  complex: 'anthropic/claude-sonnet-4',
  heavy: 'anthropic/claude-opus-4',
  social: 'openai/gpt-6-astra',
  outreach: 'openai/gpt-6-astra',
  default: 'openai/gpt-6-astra',
};

export function getApiKey(): string {
  const key = secrets.get('VERCEL_AI_GATEWAY_API_KEY');
  if (!key) throw new Error('VERCEL_AI_GATEWAY_API_KEY not configured');
  return key;
}

export async function aiComplete(params: {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || MODELS.default,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      stream: false,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || !content.trim()) throw new Error('AI Gateway returned empty response');
  return content;
}

export async function aiCompleteJson<T = any>(params: {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<T> {
  const text = await aiComplete({ ...params, temperature: params.temperature ?? 0.3 });
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
  }
  throw new Error('AI Gateway did not return valid JSON: ' + text.substring(0, 200));
}
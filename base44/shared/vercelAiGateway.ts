// Unified Vercel AI Gateway — routes ALL AI calls through https://ai-gateway.vercel.sh/v1
// Covers: chat/completions, images/generations, audio/speech, audio/transcriptions.
// Bypasses Base44 integration credit limits entirely. Uses the user's Vercel account.
import { secrets } from 'base44:runtime';

const GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1';
const GATEWAY_URL = `${GATEWAY_BASE}/chat/completions`;
const IMAGE_URL = `${GATEWAY_BASE}/images/generations`;
const SPEECH_URL = `${GATEWAY_BASE}/audio/speech`;
const TRANSCRIPTION_URL = `${GATEWAY_BASE}/audio/transcriptions`;

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

// ── Image Generation ──────────────────────────────────────────
export const IMAGE_MODELS = {
  fast: 'openai/dall-e-3',
  quality: 'openai/dall-e-3',
  default: 'openai/dall-e-3',
};

export async function generateImage(params: {
  prompt: string;
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
}): Promise<{ urls: string[] }> {
  const apiKey = getApiKey();
  const res = await fetch(IMAGE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || IMAGE_MODELS.default,
      prompt: params.prompt,
      size: params.size || '1024x1024',
      quality: params.quality || 'standard',
      n: params.n || 1,
      response_format: 'url',
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway image error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  const urls = (data.data || []).map((d: any) => d.url || d.b64_json).filter(Boolean);
  if (!urls.length) throw new Error('AI Gateway image: no image returned');
  return { urls };
}

// ── Text-to-Speech ────────────────────────────────────────────
export const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
export const SPEECH_MODELS = { default: 'openai/tts-1', hd: 'openai/tts-1-hd' };

export async function generateSpeech(params: {
  text: string;
  model?: string;
  voice?: typeof VOICES[number];
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
}): Promise<{ audio_url: string }> {
  const apiKey = getApiKey();
  const res = await fetch(SPEECH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || SPEECH_MODELS.default,
      input: params.text,
      voice: params.voice || 'alloy',
      response_format: params.format || 'mp3',
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway speech error ${res.status}: ${err.substring(0, 400)}`);
  }
  // Response may be binary audio or JSON with a URL
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return { audio_url: data.url || data.audio_url || '' };
  }
  // Binary response — return as base64 data URL
  const buffer = await res.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return { audio_url: `data:audio/${params.format || 'mp3'};base64,${base64}` };
}

// ── Audio Transcription (Whisper) ─────────────────────────────
export async function transcribeAudio(params: {
  audio_url: string;
  model?: string;
  language?: string;
}): Promise<{ text: string }> {
  const apiKey = getApiKey();
  // The gateway expects a file URL or base64 — we pass the audio URL
  const res = await fetch(TRANSCRIPTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model || 'openai/whisper-1',
      url: params.audio_url,
      language: params.language,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway transcription error ${res.status}: ${err.substring(0, 400)}`);
  }
  const data = await res.json();
  return { text: data.text || '' };
}

// ── File/Data Extraction via LLM ──────────────────────────────
export async function extractDataFromFile(params: {
  file_url: string;
  instructions: string;
  response_schema?: object;
  model?: string;
}): Promise<any> {
  const prompt = `Extract data from the file at this URL: ${params.file_url}\n\nInstructions: ${params.instructions}\n\nReturn ONLY a JSON object matching the requested schema. No markdown, no code fences.`;
  const result = await aiCompleteJson({
    model: params.model || MODELS.complex,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 8192,
  });
  return result;
}
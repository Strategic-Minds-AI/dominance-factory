// Cloud Browser Gateway — calls the user's Railway-hosted Playwright browser engine.
// Uses ENGINE_URL and ENGINE_API_KEY secrets for the browser service connection.
import { secrets } from 'base44:runtime';

export function getBrowserUrl(): string {
  const url = secrets.get('ENGINE_URL');
  if (!url) throw new Error('ENGINE_URL not configured — set your browser engine URL');
  return url.replace(/\/$/, '');
}

export function getEngineKey(): string {
  const key = secrets.get('ENGINE_API_KEY');
  if (!key) throw new Error('ENGINE_API_KEY not configured');
  return key;
}

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'X-Engine-Key': getEngineKey() };
}

export function isConfigured(): boolean {
  try { return !!getBrowserUrl(); } catch { return false; }
}

// Run a natural-language browser task: navigate, fill forms, click, extract data.
export async function runBrowserTask(task: string, options?: {
  url?: string;
  waitFor?: string;
  extractData?: boolean;
  screenshot?: boolean;
}): Promise<{ status: string; result: any; screenshots: string[]; url?: string }> {
  const base = getBrowserUrl();
  const res = await fetch(`${base}/api/run`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ task, ...options }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloud browser error ${res.status}: ${err.substring(0, 400)}`);
  }
  return await res.json();
}

// Check browser service health and queue depth.
export async function getBrowserStatus(): Promise<{ status: string; queue: number; uptime: number }> {
  const base = getBrowserUrl();
  const res = await fetch(`${base}/api/status`, { headers: authHeaders(), signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Browser status error ${res.status}`);
  return await res.json();
}

// Fill a specific form on a target URL with provided data.
export async function fillForm(params: {
  url: string;
  fields: Record<string, string>;
  submitSelector?: string;
}): Promise<{ status: string; result: any; screenshots: string[] }> {
  const task = `Go to ${params.url}. Fill in the following form fields: ${JSON.stringify(params.fields)}.${params.submitSelector ? ` Then click the element matching selector "${params.submitSelector}".` : ''} Take a screenshot of the result.`;
  return runBrowserTask(task, { url: params.url, extractData: true, screenshot: true });
}

// Scrape data from a URL using a natural-language extraction prompt.
export async function scrapePage(params: {
  url: string;
  extractPrompt: string;
}): Promise<{ status: string; result: any }> {
  const task = `Go to ${params.url}. ${params.extractPrompt} Return the extracted data as JSON.`;
  return runBrowserTask(task, { url: params.url, extractData: true });
}
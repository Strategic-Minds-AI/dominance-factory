import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateImage, generateSpeech, transcribeAudio, MODELS, IMAGE_MODELS } from "../../shared/vercelAiGateway.ts";

// Direct media generation via Vercel AI Gateway — bypasses Base44 GenerateImage, GenerateSpeech, TranscribeAudio.
// Uses the user's VERCEL_AI_GATEWAY_API_KEY. No Base44 integration credits consumed.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action || 'image';

    // ── IMAGE: Generate an image via Vercel AI Gateway ──
    if (action === 'image') {
      const { prompt, size, quality, model, n } = body;
      if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });

      const result = await generateImage({
        prompt,
        size: size || '1024x1024',
        quality: quality || 'standard',
        model: model || IMAGE_MODELS.default,
        n: n || 1,
      });

      return Response.json({ status: 'generated', urls: result.urls, provider: 'vercel-ai-gateway' });
    }

    // ── SPEECH: Generate speech audio via Vercel AI Gateway ──
    if (action === 'speech') {
      const { text, voice, model, format } = body;
      if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

      const result = await generateSpeech({
        text,
        voice: voice || 'alloy',
        model: model || 'openai/tts-1',
        format: format || 'mp3',
      });

      return Response.json({ status: 'generated', audio_url: result.audio_url, provider: 'vercel-ai-gateway' });
    }

    // ── TRANSCRIBE: Transcribe audio via Vercel AI Gateway ──
    if (action === 'transcribe') {
      const { audio_url, model, language } = body;
      if (!audio_url) return Response.json({ error: 'audio_url is required' }, { status: 400 });

      const result = await transcribeAudio({
        audio_url,
        model: model || 'openai/whisper-1',
        language,
      });

      return Response.json({ status: 'transcribed', text: result.text, provider: 'vercel-ai-gateway' });
    }

    return Response.json({ error: 'Unknown action. Use: image, speech, transcribe' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
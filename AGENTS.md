# AGENTS.md — ApexForge / DominanceFactory

## Architecture: External Service Independence

This system is designed to operate independently of Base44 integration credit limits. All critical operations route through the user's own external accounts via backend functions with secrets — NOT through Base44's built-in integrations.

### Bypass Architecture (as of 2026-10-09)

| Operation | Base44 Integration (credit-limited) | Bypass Function | External Service | Secret Used |
|---|---|---|---|---|
| AI Chat/Completion | InvokeLLM | `vercelAiGateway.ts` (shared module) | Vercel AI Gateway | VERCEL_AI_GATEWAY_API_KEY |
| Image Generation | GenerateImage | `generateMediaDirect` | Vercel AI Gateway | VERCEL_AI_GATEWAY_API_KEY |
| Text-to-Speech | GenerateSpeech | `generateMediaDirect` | Vercel AI Gateway | VERCEL_AI_GATEWAY_API_KEY |
| Audio Transcription | TranscribeAudio | `generateMediaDirect` | Vercel AI Gateway | VERCEL_AI_GATEWAY_API_KEY |
| Email Sending | SendEmail | `sendEmailDirect` | Resend API | RESEND_API_KEY |
| File Upload (private) | UploadPrivateFile | `uploadFileDirect` | Supabase Storage | SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY |
| File Upload (public) | UploadPublicFile | `uploadFileDirect` | Supabase Storage | SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY |
| Scheduled Automations | Base44 Workflows | `cronRunner` | Any external cron | PACK_SYNC_TOKEN |
| Web Scraping/Browser | N/A | `cloudBrowserGateway.ts` | Railway Engine | ENGINE_URL + ENGINE_API_KEY |
| SMS/MMS | N/A | `sendOutreach` | Telnyx | TELNYX_API_KEY |
| Domain Management | N/A | `provisionSystem` | GoDaddy API | GODADDY_API_KEY |
| Deployment | N/A | `provisionSystem` | Vercel + Railway | VERCEL_API_TOKEN + RAILWAY_API_TOKEN |
| Database Provisioning | N/A | `supabaseConvergence` | Supabase Management API | SUPABASE_SERVICE_ROLE_KEY |

### Rules for New Development

1. **NEVER use Base44 Core integrations** (InvokeLLM, SendEmail, GenerateImage, GenerateSpeech, UploadFile, etc.) — always use the bypass functions or shared modules above.
2. **All AI calls** go through `vercelAiGateway.ts` — import `aiComplete`, `aiCompleteJson`, `generateImage`, `generateSpeech`, or `transcribeAudio`.
3. **All email sends** go through `sendEmailDirect` backend function (Resend API).
4. **All file uploads** go through `uploadFileDirect` backend function (Supabase Storage).
5. **All scheduled tasks** are triggered via `cronRunner` backend function using PACK_SYNC_TOKEN — set up external cron (Vercel Cron, GitHub Actions, cron-job.org) to call it.
6. **Entity CRUD** uses Base44 SDK normally — this is NOT credit-limited.
7. **Connectors** (Gmail, Calendar, Drive, etc.) use Base44 SDK normally — these are NOT credit-limited.

### Connected Infrastructure

- **Supabase**: 3 projects (A, B, D) + Management API — all secrets configured
- **Vercel**: API token configured for deployment + AI Gateway
- **Railway**: API token configured + cloud browser engine running
- **GoDaddy**: API key configured for domain management
- **GitHub**: workspace connector registered
- **Google Suite**: Calendar, Gmail, Drive, Docs, Sheets, Tasks — all connected
- **HubSpot**: workspace connector registered
- **Telnyx**: API key configured for SMS/MMS
- **Resend**: API key configured for email

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `base44/shared/vercelAiGateway.ts`: ALL AI operations (chat, image, speech, transcription).
- `base44/shared/cloudBrowserGateway.ts`: Railway-hosted browser automation.
- `base44/shared/assetClassifier.ts`: deterministic asset categorization.
- `base44/functions/sendEmailDirect/`: Resend email bypass.
- `base44/functions/uploadFileDirect/`: Supabase Storage upload bypass.
- `base44/functions/generateMediaDirect/`: Vercel AI Gateway media bypass.
- `base44/functions/cronRunner/`: external cron trigger endpoint.
- `base44/functions/systemReflection/`: self-scanning and auto-repair.
- `base44/functions/ingestAsset/`: deterministic asset ingestion.

## Working Notes

- Use `base44 dev` as the default local development command.
- Prefer bypass functions over Base44 Core integrations.
- Run `npm run build` before finishing code changes to verify.
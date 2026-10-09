# Dominance Factory: Base44-independent migration control packet

Status: DISCOVERY / BRANCH ONLY. Generated 2026-10-09.
Branch: migration/base44-independent-v1
Canonical repository: Strategic-Minds-AI/dominance-factory
Production release: NOT APPROVED.

## Verified blockers
- Frontend `src/api/base44Client.js` uses `@base44/sdk`.
- `package.json` includes `@base44/sdk` and `@base44/vite-plugin`.
- `README.md` describes Base44 as runtime and warns that repository pushes sync into the Base44 builder.
- `AGENTS.md` still directs entity CRUD and connectors through Base44 and uses `base44 dev`.
- Existing functions in `base44/functions` require API, runtime, auth and data adapters before independent deployment.
- This GitHub repo is publicly visible; no secret values or private client data may be committed.

## Target ownership (verify before changes)
- Strategic Intelligence Supabase: jadlpbokfdkonvnfxjzs — business data, strategies, clients and portfolio records.
- X1 AI Hub production: vgsmyhqqtkkluhypxyua — authoritative task queue, leases, agent execution and receipts.
- X1 AI Hub staging: uvdkzsbjackpjvpoxtyk — integration tests, never silent production.
- Universal Property Intelligence: fwtchbsebygwifmmqhur — optional specialized module.
- Vercel: private command-center frontend, API gateway, preview and approved hosting.
- Railway: existing durable workers; avoid another heartbeat or competing queue.
- Vercel AI Gateway: model requests and usage telemetry.

## Migration order
1. Snapshot source, data schema, route inventory, external dependencies and baseline UI.
2. Inventory and map every `base44.entities`, `base44.functions`, `base44.auth`, connector and `base44:runtime` call.
3. Build independent authenticated adapter with tenant authorization, rate limits, budgets, typed errors and audit receipts. Keep secrets on server.
4. Replace browser-side Base44 SDK with an independent API client and Supabase Auth/session flow.
5. Implement versioned strategies, adapters and safe data migration; test RLS in staging.
6. Move backend functions to server APIs and/or X1 durable workers preserving request/response contracts.
7. Reconcile scheduler: one authority, idempotent leases, retries, deadlines and recovery.
8. Test AI Gateway, media, messaging drafts, provisioning simulation, social drafts, billing webhooks and analytics.
9. Build an isolated preview without Base44 credentials; run synthetic client onboarding -> simulation -> mockup -> website -> SEO/QA -> social -> receipts.
10. Independently compare UI/functional parity and security; perform operator-approved production cutover only after rollback verified.

## Acceptance gates
- No required Base44 SDK/runtime/network calls in independent preview.
- All protected mutations require server-enforced approval; no generic unlimited `invoke_function` or `delete_record` privileges.
- Site factory pages are useful and distinguishable, without scaled-content abuse.
- Zero cross-tenant data leakage in tests.
- Critical routes, API health, agent queues, retries and webhooks pass.
- Repeatable Vercel AI Gateway canary using authorized preview credential.
- Preview can sustain shutdown of all Base44 links in isolation.
- Production release, DNS, payments, real social publishing, customer messaging, and credential changes remain separately gated.

## Validation status
- Repo and write-capable connector VERIFIED.
- Dependency evidence VERIFIED in checked source files.
- Preview build NOT TESTED.
- Supabase integration NOT TESTED in this branch.
- Railway deployment NOT TESTED in this branch.
- Vercel AI Gateway canary NOT TESTED.
- Production cutover NOT AUTHORIZED.

## Next eligible actions
Perform exact dependency inventory on branch; preserve current working components; add non-production independent runtime adapter and tests. Do not modify main or disable Base44 yet.

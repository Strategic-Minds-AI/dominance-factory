# Website Launch Engine: Independent Factory Contract v1
Status: DEVELOPMENT ONLY. Approved social mode: APPROVE_ONCE_THEN_AUTOMATE.
Date: 2026-10-09
Source truth: the operator's approved Website Launch Engine design and current instructions. This branch is an extraction/migration contract, NOT authorization to operate Base44 or publish.

## Non-negotiable boundaries
- ChatGPT is the operator-facing workspace; durable state lives in GitHub, Supabase, and Vercel/worker infrastructure.
- Base44 packages, services, entity storage, integration credits, app auth, and deployment controls MUST NOT appear on the critical path of the replacement.
- Preserve existing public deployments; development stays in isolated branches and previews.
- No production publishing, payments, paid media generation, DNS, secrets, customer messaging, or live social actions without scoped operator approval.
- No programmatic doorway sites, thin city swaps, fabricated reviews, fake locations, or unverified claims. Each market version must provide meaningful differentiation.
- Preview READY is not operational PASS. Independent validator must check browser, auth, tenant isolation, leads, workflow receipts and rollback.

## Systems
1. Website Studio: visually locked premium design, large uncropped template images, readable navigation, desktop/mobile full-page preview, approval manifest.
2. Client portal: Supabase Auth, tenant-scoped users/roles, assets, websites, leads, analytics, billing sandbox, approval history; deny-by-default RLS and tests.
3. Site multiplier: typed batch plans (1/10/25/50/100), explicit approved markets, durable queue/lease/idempotency, template pack hash, per-site preview URL, per-site receipts, retry/dead-letter, cost guardrails.
4. Social factory: extract permitted facts from approved website content; generate image/video briefs, media through authorized providers when configured, captions, hashtags, 30-day calendar, review and scheduled release.

## Campaign authorization: APPROVE_ONCE_THEN_AUTOMATE
- An owner may explicitly approve one immutable campaign revision and its posts, channels, scheduling window, approved media, brand rules, exclusions, reply permissions, and maximum spend.
- Store campaign_approval_id, tenant_id, owner_user_id, manifest_sha256, channel_ids, start_at, end_at, post_ids, approval_time, permissions, revocation_time, and receipt IDs.
- Scheduler executes only items in the approved immutable manifest within date window and tenant/channel entitlement.
- Edits to content, destinations, schedules outside tolerance, or generated media invalidate that item's approval. Material campaign changes require reapproval.
- Revoke/pause immediately prevents subsequent dispatch. A single idempotency key per platform/post prevents duplicates. Log provider IDs and failures.
- Default replies/comments/DMs to DRAFT ONLY; live engagement needs a separate, explicit scoped customer authorization and safety policy.
- User has chosen the workflow POLICY, not approved any actual campaign, channel binding, public post, or spend.
- Synthetic test traffic and sandbox draft schedules are allowed. No live social post may be sent by this development branch.

## Minimum schemas
tenants(id), users(id,tenant_id), tenant_memberships(tenant_id,user_id,role),
sites(id,tenant_id,pack_hash,market,status,preview_url,prod_url),
site_build_jobs(id,tenant_id,batch_id,lease_until,idempotency_key,status),
site_build_receipts(id,job_id,sha,preview_url,validator_id,passed),
social_campaigns(id,tenant_id,revision_hash,status,window_start,window_end),
social_posts(id,campaign_id,tenant_id,channel_id,scheduled_at,content_hash,media_hash,status),
social_approvals(id,campaign_id,owner_id,manifest_hash,approved_at,revoked_at),
social_dispatch_receipts(id,post_id,platform_post_id,idempotency_key,status).
All tenant-scoped tables require verified row-level isolation in staging before use.

## Acceptance gates
G1: audit repository and identify donor code vs replacement source.
G2: lock approved screenshot/design tokens, verify large uncropped gallery images at mobile/tablet/desktop.
G3: implement non-Base44 auth and RLS; unauthorized cross-tenant access must fail.
G4: produce one fully functional website with synthetic lead-form validation.
G5: produce ten distinct market previews with independent per-site receipts.
G6: simulate 100-site concurrency, retries, rate limits and budget with NO production provisioning.
G7: generate 30-day draft social calendar from approved website source, test image/video job status, approval lock, revocation, idempotency and scheduler sandbox.
G8: complete release checklist; request operator approval for anything protected.

## Known facts and gaps
Verified: existing Strategic-Minds-AI/dominance-factory repository is Base44-dependent (@base44/sdk and @base44/vite-plugin in package.json). Do not claim it is an independent implementation.
Unknown: operational client login, 100-site execution, social provider authorization, actual media production, payment flow and independent browser parity.
Next safe action: extract and implement a new Base44-free codebase on a development branch, keeping this repository read-only except for migration contract artifacts until canonical replacement identity is verified.

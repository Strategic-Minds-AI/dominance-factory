# DominanceFactory Pack Sync Contract v1
Status: PROPOSED, branch-only, pending operator review
Canonical source: Strategic-Minds-AI/dominance-factory, branch factory/pack-contract-v1
Base44 runtime app: DominanceFactory (6ac74a836169b94bd04cf453)
Ingress: POST https://build-scale-dominate.base44.app/functions/ingestPack
Approval UI: https://build-scale-dominate.base44.app/packs
Rules:
1. Ingress requires body sync_token corresponding to PACK_SYNC_TOKEN (never commit or log its value).
2. name is required. preview_html is mandatory per V1 specification, even though the current runtime function only requires name.
3. Runtime kind enum currently: web_pack | social_pack | content_pack | other.
4. Public specification kind: web_pack | landing_page | full_site.
5. Compatibility mapping WITHOUT changing production DB: landing_page -> web_pack; full_site -> web_pack; preserve requested_kind and artifact topology in metadata JSON string. Keep social_pack/content_pack/other unchanged.
6. brand_tokens and metadata are JSON-encoded *strings*, not nested objects.
7. preview_html must be a full HTML document with embedded CSS, system fonts, no third-party scripts or remote resources, semantic headings, responsive rules and accessible controls.
8. status is ALWAYS pending_review on creation; no creation path may publish. Approval and publication are separate independent gates.
9. Each pack includes provenance, unique idempotency key, manifest version, exact source Git commit SHA when available, and validation receipt in metadata. Current endpoint does NOT enforce idempotency or a bounded payload size: implementation hardening is separate.
10. HTML review preview is untrusted. Never treat embedded HTML as authorized scripts; use a sandboxed preview frame without allow-same-origin combined with allow-scripts. Prefer scripts disallowed.
11. Test only on drafts/previews. Never publish, provision paid resources, send client messages, migrate production schema, or change secrets without separate scoped approval.

## Acceptance criteria
- Invalid token -> 401, no record.
- Valid authenticated submission -> 200, returns {ok:true, pack_id, status:"pending_review"}.
- Read-back record matches pack name, metadata and pending status.
- Approval UI renders approved design safely on desktop and mobile.
- No production release triggered.
- Duplicate submission behavior measured and remediated before large batches.
- Reviewer identity and immutable approval receipts retained.

## Sample
File: examples/austin-plumbing-landing.html
Public requested kind: landing_page
Runtime kind: web_pack
Metadata requested_kind: landing_page
Purpose: non-client fictional demo, no fake reviews/claims/prices, no live lead collection.

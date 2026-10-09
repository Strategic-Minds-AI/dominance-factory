import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { aiComplete, MODELS } from "../../shared/vercelAiGateway.ts";

// All entities in the system
const ALL_ENTITIES = [
  "Website", "Pack", "Agent", "AgentTask", "SocialPost", "SocialAccount", "PostSchedule",
  "LaunchCampaign", "GeneratedPage", "MediaOutlet", "ProvisioningJob", "OutreachCampaign",
  "MediaAsset", "ResearchStrategy", "ABTest", "OnboardingSession", "NearMeCandidate",
  "SystemTemplate", "SystemInventory", "BenchmarkSystem", "BuildPlan",
  "HubProduct", "InfoCategory", "SwarmGenerator", "DiscoveryMethod",
  "ProblemPattern", "WorkflowPack", "PromptEntry", "DemandTheme",
  "ContractorPersona", "BuyerPersona", "ContractorStep", "ConnectorEntry",
  "ContractorTechOption", "Opportunity", "ProgrammaticRule",
  "IngestedAsset", "SystemIssue",
];

const CRITICAL_ENTITIES = [
  "Website", "Agent", "SocialPost", "SocialAccount", "LaunchCampaign",
  "GeneratedPage", "ProvisioningJob", "OutreachCampaign", "MediaAsset",
  "ResearchStrategy", "OnboardingSession", "SwarmGenerator", "WorkflowPack",
  "ConnectorEntry", "HubProduct", "IngestedAsset",
];

const CONNECTORS_TO_CHECK = [
  "supabase", "github", "googlecalendar", "gmail", "googledrive",
  "googledocs", "googlesheets", "googletasks",
];

const SECRETS_TO_CHECK = [
  "VERCEL_API_TOKEN", "RAILWAY_API_TOKEN", "GODADDY_API_KEY",
  "ENGINE_URL", "ENGINE_API_KEY", "VERCEL_AI_GATEWAY_API_KEY",
  "TELNYX_API_KEY", "RESEND_API_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "PACK_SYNC_TOKEN",
];

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || new URL(req.url).searchParams.get('token') || '';
    const task = body.task || new URL(req.url).searchParams.get('task') || 'system_reflection';

    // Auth via shared secret (PACK_SYNC_TOKEN) — allows external cron services to trigger this
    const expectedToken = secrets.get('PACK_SYNC_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      return Response.json({ error: 'Invalid or missing token. Pass {"token": "<PACK_SYNC_TOKEN>"} in the body or ?token= in the query string.' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // ── SYSTEM REFLECTION: Scan + auto-fix ──
    if (task === 'system_reflection' || task === 'all') {
      const scanId = `cron_scan_${Date.now()}`;
      const issues: any[] = [];

      // Count all entities
      const entityCounts: Record<string, number> = {};
      for (const entity of ALL_ENTITIES) {
        try {
          const count = await base44.asServiceRole.entities[entity]?.count?.({});
          if (typeof count === 'number') entityCounts[entity] = count;
        } catch {}
      }

      // Flag empty critical entities
      for (const entity of CRITICAL_ENTITIES) {
        if (entityCounts[entity] === 0) {
          issues.push({
            title: `Empty Entity: ${entity}`,
            description: `Entity "${entity}" has 0 records. This entity is marked as critical for system operations.`,
            issue_type: 'empty_entity',
            severity: 'high',
            component: entity,
            entity_name: entity,
            auto_fixable: true,
            fix_action: JSON.stringify({ type: 'seed_entity', entity }),
          });
        }
      }

      // Check connectors
      for (const connType of CONNECTORS_TO_CHECK) {
        try {
          const conn = await base44.asServiceRole.connectors.getConnection(connType);
          if (!conn?.accessToken) {
            issues.push({
              title: `Missing Connector: ${connType}`,
              description: `Connector "${connType}" is not connected.`,
              issue_type: 'missing_connector',
              severity: 'medium',
              component: connType,
              auto_fixable: false,
            });
          }
        } catch {
          issues.push({
            title: `Missing Connector: ${connType}`,
            description: `Connector "${connType}" failed to retrieve token.`,
            issue_type: 'missing_connector',
            severity: 'medium',
            component: connType,
            auto_fixable: false,
          });
        }
      }

      // Check secrets
      for (const secretName of SECRETS_TO_CHECK) {
        try {
          const value = secrets.get(secretName);
          if (!value) {
            issues.push({
              title: `Missing Secret: ${secretName}`,
              description: `Secret "${secretName}" is not configured.`,
              issue_type: 'missing_secret',
              severity: 'high',
              component: secretName,
              auto_fixable: false,
            });
          }
        } catch {}
      }

      // Create SystemIssue records
      let createdCount = 0;
      for (const issue of issues) {
        try {
          await base44.asServiceRole.entities.SystemIssue.create({
            ...issue,
            detected_at: new Date().toISOString(),
            status: 'open',
            scan_id: scanId,
            fix_attempts: 0,
          });
          createdCount++;
        } catch {}
      }

      // Auto-fix: seed empty entities
      let fixedCount = 0;
      const fixableIssues = issues.filter(i => i.auto_fixable);
      for (const issue of fixableIssues) {
        try {
          const fixAction = JSON.parse(issue.fix_action);
          if (fixAction.type === 'seed_entity' && fixAction.entity) {
            const seedData: any = { name: `Auto-seeded ${fixAction.entity}` };
            if (fixAction.entity === 'Agent') {
              seedData.name = 'Apex Commander';
              seedData.agent_type = 'orchestrator';
              seedData.status = 'active';
              seedData.config = JSON.stringify({ role: 'Mission planning and task routing' });
              seedData.capabilities = JSON.stringify(['Task delegation', 'Result aggregation']);
            } else if (fixAction.entity === 'SocialAccount') {
              seedData.platform = 'general';
              seedData.status = 'pending';
            } else if (fixAction.entity === 'Website') {
              seedData.name = 'Auto-seeded Website';
              seedData.status = 'draft';
              seedData.template = 'default';
            }
            await base44.asServiceRole.entities[fixAction.entity]?.create(seedData);
            fixedCount++;
          }
        } catch {}
      }

      return Response.json({
        task: 'system_reflection',
        scan_id: scanId,
        entities_scanned: ALL_ENTITIES.length,
        issues_found: issues.length,
        issues_created: createdCount,
        auto_fixed: fixedCount,
        entity_counts: entityCounts,
        timestamp: new Date().toISOString(),
      });
    }

    // ── QUEUE PROCESS: Trigger page generation queue ──
    if (task === 'queue_process') {
      // Call the processGenerationQueue function internally
      const origin = new URL(req.url).origin;
      try {
        const res = await fetch(`${origin}/functions/processGenerationQueue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch_size: 5 }),
          signal: AbortSignal.timeout(120000),
        });
        const data = await res.json();
        return Response.json({ task: 'queue_process', result: data, timestamp: new Date().toISOString() });
      } catch (e) {
        return Response.json({ task: 'queue_process', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── ASSET CATEGORIZE: Scan and catalog new assets into SystemInventory ──
    if (task === 'asset_categorize') {
      const origin = new URL(req.url).origin;
      try {
        const res = await fetch(`${origin}/functions/assetCategorizer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          signal: AbortSignal.timeout(60000),
        });
        const data = await res.json();
        return Response.json({ task: 'asset_categorize', result: data, timestamp: new Date().toISOString() });
      } catch (e) {
        return Response.json({ task: 'asset_categorize', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── GOOGLE BACKUP: Back up generated content to Drive and Sheets ──
    if (task === 'google_backup') {
      const origin = new URL(req.url).origin;
      try {
        const res = await fetch(`${origin}/functions/googleBackup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          signal: AbortSignal.timeout(120000),
        });
        const data = await res.json();
        return Response.json({ task: 'google_backup', result: data, timestamp: new Date().toISOString() });
      } catch (e) {
        return Response.json({ task: 'google_backup', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── HEALTH CHECK ──
    if (task === 'health') {
      return Response.json({
        task: 'health',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Cron runner is operational. Available tasks: system_reflection, queue_process, asset_categorize, google_backup, health, all',
      });
    }

    return Response.json({
      error: `Unknown task: "${task}". Available tasks: system_reflection, queue_process, asset_categorize, google_backup, health, all`,
    }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { aiComplete, MODELS } from "../../shared/vercelAiGateway.ts";
import { categorizeAssets, backupToGoogle } from "../../shared/automationEngine.ts";

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
      try {
        const result = await categorizeAssets(base44);
        return Response.json({ task: 'asset_categorize', result, timestamp: new Date().toISOString() });
      } catch (e) {
        return Response.json({ task: 'asset_categorize', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── GOOGLE BACKUP: Back up generated content to Drive and Sheets ──
    if (task === 'google_backup') {
      try {
        const result = await backupToGoogle(base44);
        return Response.json({ task: 'google_backup', result, timestamp: new Date().toISOString() });
      } catch (e) {
        return Response.json({ task: 'google_backup', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── MORNING SUMMARY: Generate daily system integrity + growth metrics report ──
    if (task === 'morning_summary') {
      try {
        const now = new Date();
        const reportDate = now.toISOString().split('T')[0];

        // Count all entities
        const entityCounts: Record<string, number> = {};
        let totalRecords = 0;
        for (const entity of ALL_ENTITIES) {
          try {
            const count = await base44.asServiceRole.entities[entity]?.count?.({});
            if (typeof count === 'number') {
              entityCounts[entity] = count;
              totalRecords += count;
            }
          } catch {}
        }

        // Check connectors
        const connectorsStatus: Record<string, boolean> = {};
        let connectedCount = 0;
        for (const connType of CONNECTORS_TO_CHECK) {
          try {
            const conn = await base44.asServiceRole.connectors.getConnection(connType);
            const isConnected = !!conn?.accessToken;
            connectorsStatus[connType] = isConnected;
            if (isConnected) connectedCount++;
          } catch {
            connectorsStatus[connType] = false;
          }
        }

        // Count system issues
        let openIssues = 0;
        let totalIssues = 0;
        try {
          totalIssues = await base44.asServiceRole.entities.SystemIssue.count({});
          openIssues = await base44.asServiceRole.entities.SystemIssue.count({ status: 'open' });
        } catch {}

        // Count system inventory
        let inventoryCount = 0;
        try {
          inventoryCount = await base44.asServiceRole.entities.SystemInventory.count({});
        } catch {}

        // Calculate health score
        const connectorScore = (connectedCount / CONNECTORS_TO_CHECK.length) * 40;
        const issueScore = totalIssues > 0 ? (1 - openIssues / totalIssues) * 30 : 30;
        const inventoryScore = Math.min(inventoryCount / 100, 1) * 30;
        const healthScore = Math.round(connectorScore + issueScore + inventoryScore);

        // Build summary text
        const summaryText = [
          `APEXFORGE MORNING BRIEFING - ${reportDate}`,
          ``,
          `SYSTEM HEALTH: ${healthScore}/100`,
          `Connectors: ${connectedCount}/${CONNECTORS_TO_CHECK.length} connected`,
          `System Issues: ${openIssues} open / ${totalIssues} total`,
          `Inventory: ${inventoryCount} systems cataloged`,
          ``,
          `GROWTH METRICS:`,
          `Total Records: ${totalRecords}`,
          `Websites: ${entityCounts.Website || 0}`,
          `Agents: ${entityCounts.Agent || 0}`,
          `Social Posts: ${entityCounts.SocialPost || 0}`,
          `Launch Campaigns: ${entityCounts.LaunchCampaign || 0}`,
          `Generated Pages: ${entityCounts.GeneratedPage || 0}`,
          `Packs: ${entityCounts.Pack || 0}`,
          ``,
          `RECOMMENDATIONS:`,
          openIssues > 0 ? `- ${openIssues} open issues need attention` : '- No open issues',
          connectedCount < CONNECTORS_TO_CHECK.length ? `- ${CONNECTORS_TO_CHECK.length - connectedCount} connectors not connected` : '- All connectors connected',
          entityCounts.Website === 0 ? '- No websites created yet, start with Phase 3' : '- Websites are active',
          entityCounts.Agent === 0 ? '- No agents enabled, enable from Unified Library' : '- Agents are active',
        ].join('\n');

        // Save to DailyReport entity
        let reportId: string | undefined;
        try {
          const report = await base44.asServiceRole.entities.DailyReport.create({
            report_date: reportDate,
            report_type: 'morning_summary',
            health_score: healthScore,
            entity_counts: JSON.stringify(entityCounts),
            growth_metrics: JSON.stringify({
              totalRecords,
              websites: entityCounts.Website || 0,
              agents: entityCounts.Agent || 0,
              socialPosts: entityCounts.SocialPost || 0,
              campaigns: entityCounts.LaunchCampaign || 0,
              generatedPages: entityCounts.GeneratedPage || 0,
              packs: entityCounts.Pack || 0,
            }),
            issues_summary: JSON.stringify({ openIssues, totalIssues }),
            connectors_status: JSON.stringify(connectorsStatus),
            recommendations: JSON.stringify({
              openIssues,
              disconnectedConnectors: CONNECTORS_TO_CHECK.length - connectedCount,
            }),
            summary_text: summaryText,
          });
          reportId = report?.id;
        } catch {}

        return Response.json({
          task: 'morning_summary',
          report_id: reportId,
          health_score: healthScore,
          total_records: totalRecords,
          connected_connectors: connectedCount,
          open_issues: openIssues,
          inventory_count: inventoryCount,
          timestamp: now.toISOString(),
        });
      } catch (e) {
        return Response.json({ task: 'morning_summary', error: e.message, timestamp: new Date().toISOString() }, { status: 500 });
      }
    }

    // ── HEALTH CHECK ──
    if (task === 'health') {
      return Response.json({
        task: 'health',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Cron runner is operational. Available tasks: system_reflection, queue_process, asset_categorize, google_backup, morning_summary, health, all',
      });
    }

    return Response.json({
      error: `Unknown task: "${task}". Available tasks: system_reflection, queue_process, asset_categorize, google_backup, morning_summary, health, all`,
    }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
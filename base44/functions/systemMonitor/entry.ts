import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { SYSTEM_REGISTRY } from "../../shared/systemClassifier.ts";

// System Monitor — returns real-time status, capacity, and health of every
// agent, workflow, and connected service. Called by the dashboard UI.

const CONNECTORS_TO_CHECK = [
  'supabase', 'github', 'googlecalendar', 'gmail', 'googledrive',
  'googledocs', 'googlesheets', 'googletasks',
];

const CAPACITY_ENTITIES = [
  'Website', 'Pack', 'Agent', 'AgentTask', 'SocialPost', 'LaunchCampaign',
  'GeneratedPage', 'ProvisioningJob', 'OutreachCampaign', 'MediaAsset',
  'ResearchStrategy', 'SystemInventory', 'SystemIssue', 'IngestedAsset',
  'BenchmarkSystem', 'BuildPlan',
];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    // 1. Agents
    let agents: any[] = [];
    let agentTaskStats: any = { total: 0, pending: 0, running: 0, completed: 0, error: 0 };
    try {
      const agentPage = await base44.asServiceRole.entities.Agent.list({ limit: 100 });
      agents = agentPage.items || agentPage;
    } catch {}
    try {
      agentTaskStats.total = await base44.asServiceRole.entities.AgentTask.count({});
      agentTaskStats.pending = await base44.asServiceRole.entities.AgentTask.count({ status: 'pending' });
      agentTaskStats.running = await base44.asServiceRole.entities.AgentTask.count({ status: 'running' });
      agentTaskStats.completed = await base44.asServiceRole.entities.AgentTask.count({ status: 'completed' });
      agentTaskStats.error = await base44.asServiceRole.entities.AgentTask.count({ status: 'error' });
    } catch {}

    // 2. Workflows (from deterministic registry)
    const workflows = SYSTEM_REGISTRY.workflows.map((name: string) => ({
      name,
      type: 'workflow',
      configured: true,
      status: 'active',
    }));

    // 3. Connected services
    const services: any[] = [];
    for (const connType of CONNECTORS_TO_CHECK) {
      try {
        const conn = await base44.asServiceRole.connectors.getConnection(connType);
        services.push({
          name: connType,
          connected: !!conn?.accessToken,
          type: 'connector',
        });
      } catch {
        services.push({ name: connType, connected: false, type: 'connector' });
      }
    }

    // Also check secrets as "infrastructure services"
    const secretServices = [
      'VERCEL_API_TOKEN', 'RAILWAY_API_TOKEN', 'GODADDY_API_KEY',
      'VERCEL_AI_GATEWAY_API_KEY', 'TELNYX_API_KEY', 'RESEND_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY', 'PACK_SYNC_TOKEN',
    ];
    for (const secretName of secretServices) {
      try {
        const value = secrets.get(secretName);
        services.push({
          name: secretName,
          connected: !!value,
          type: 'secret',
        });
      } catch {
        services.push({ name: secretName, connected: false, type: 'secret' });
      }
    }

    // 4. System issues stats
    let issueStats: any = { open: 0, resolved: 0, critical: 0, high: 0, auto_fixable: 0 };
    try {
      issueStats.open = await base44.asServiceRole.entities.SystemIssue.count({ status: 'open' });
      issueStats.resolved = await base44.asServiceRole.entities.SystemIssue.count({ status: 'resolved' });
      issueStats.critical = await base44.asServiceRole.entities.SystemIssue.count({ severity: 'critical', status: 'open' });
      issueStats.high = await base44.asServiceRole.entities.SystemIssue.count({ severity: 'high', status: 'open' });
      issueStats.auto_fixable = await base44.asServiceRole.entities.SystemIssue.count({ auto_fixable: true, status: 'open' });
    } catch {}

    // 5. Entity capacity
    const capacity: Record<string, number> = {};
    for (const entity of CAPACITY_ENTITIES) {
      try {
        const count = await base44.asServiceRole.entities[entity]?.count?.({});
        if (typeof count === 'number') capacity[entity] = count;
      } catch {}
    }

    // 6. Calculate health score (0-100)
    const connectedServices = services.filter(s => s.connected).length;
    const totalServices = services.length;
    const serviceHealth = totalServices > 0 ? (connectedServices / totalServices) * 100 : 100;

    const agentsHealthy = agents.filter(a => a.status !== 'error').length;
    const agentHealth = agents.length > 0 ? (agentsHealthy / agents.length) * 100 : 100;

    const totalIssues = issueStats.open + issueStats.resolved;
    const issueHealth = totalIssues > 0 ? (issueStats.resolved / totalIssues) * 100 : 100;

    const healthScore = Math.round(serviceHealth * 0.4 + agentHealth * 0.2 + issueHealth * 0.4);

    return Response.json({
      agents,
      agent_task_stats: agentTaskStats,
      workflows,
      services,
      issues: issueStats,
      capacity,
      health_score: healthScore,
      service_health: { connected: connectedServices, total: totalServices, pct: Math.round(serviceHealth) },
      agent_health: { healthy: agentsHealthy, total: agents.length, pct: Math.round(agentHealth) },
      issue_health: { resolved: issueStats.resolved, total: totalIssues, pct: Math.round(issueHealth) },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
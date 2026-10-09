import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// One-time setup: sets PACK_SYNC_TOKEN env var in the apexforge-cron Vercel project
// and redeploys so the cron function can authenticate to the Base44 cronRunner.

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const vercelToken = secrets.get('VERCEL_API_TOKEN');
    const packToken = secrets.get('PACK_SYNC_TOKEN');
    if (!vercelToken || !packToken) {
      return Response.json({ error: 'VERCEL_API_TOKEN and PACK_SYNC_TOKEN must be configured as secrets' }, { status: 500 });
    }

    // 1. Find the apexforge-cron project
    const projectsRes = await fetch('https://api.vercel.com/v9/projects?limit=100', {
      headers: { Authorization: `Bearer ${vercelToken}` }
    });
    const projectsData = await projectsRes.json();
    const project = projectsData.projects?.find((p: any) => p.name === 'apexforge-cron');
    if (!project) return Response.json({ error: 'apexforge-cron Vercel project not found. Run the initial deployment first.' }, { status: 400 });

    // 2. Check if PACK_SYNC_TOKEN env var already exists
    const envRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}/env`, {
      headers: { Authorization: `Bearer ${vercelToken}` }
    });
    const envData = await envRes.json();
    const existingEnv = envData.envs?.find((e: any) => e.key === 'PACK_SYNC_TOKEN');

    if (existingEnv) {
      // Update existing env var
      await fetch(`https://api.vercel.com/v10/projects/${project.id}/env/${existingEnv.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: packToken, target: ['production'] }),
        signal: AbortSignal.timeout(15000),
      });
    } else {
      // Create new env var
      await fetch(`https://api.vercel.com/v10/projects/${project.id}/env`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'PACK_SYNC_TOKEN', value: packToken, type: 'encrypted', target: ['production'] }),
        signal: AbortSignal.timeout(15000),
      });
    }

    // 3. Redeploy with the same files so the new env var takes effect
    const vercelJson = JSON.stringify({
      crons: [
        { path: "/api/cron?task=health", schedule: "0 * * * *" },
        { path: "/api/cron?task=system_reflection", schedule: "0 */6 * * *" },
        { path: "/api/cron?task=queue_process", schedule: "*/30 * * * *" }
      ]
    }, null, 2);

    const apiCronJs = [
      "export default async function handler(req, res) {",
      "  const task = req.query.task || 'health';",
      "  const cronUrl = 'https://build-scale-dominate.base44.app/functions/cronRunner';",
      "  const packToken = process.env.PACK_SYNC_TOKEN;",
      "  if (!packToken) { return res.status(500).json({ error: 'PACK_SYNC_TOKEN not set' }); }",
      "  try {",
      "    const response = await fetch(cronUrl, {",
      "      method: 'POST',",
      "      headers: { 'Content-Type': 'application/json' },",
      "      body: JSON.stringify({ task, token: packToken }),",
      "      signal: AbortSignal.timeout(120000),",
      "    });",
      "    const data = await response.json();",
      "    res.status(200).json({ task, result: data, timestamp: new Date().toISOString() });",
      "  } catch (error) { res.status(500).json({ task, error: error.message }); }",
      "}",
    ].join('\n');

    const packageJson = JSON.stringify({ name: "apexforge-cron", version: "1.0.0", private: true }, null, 2);

    const files = [
      { file: "vercel.json", data: base64Encode(vercelJson), encoding: "base64" },
      { file: "api/cron.js", data: base64Encode(apiCronJs), encoding: "base64" },
      { file: "package.json", data: base64Encode(packageJson), encoding: "base64" },
    ];

    const deployRes = await fetch('https://api.vercel.com/v13/deployments?forceNew=1', {
      method: 'POST',
      headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'apexforge-cron',
        files,
        target: 'production',
        projectSettings: { framework: null, buildCommand: null, outputDirectory: null, installCommand: null }
      }),
      signal: AbortSignal.timeout(30000),
    });
    const deployData = await deployRes.json();

    return Response.json({
      status: 'fully_configured',
      project_id: project.id,
      project_name: 'apexforge-cron',
      env_var_set: true,
      env_var_action: existingEnv ? 'updated' : 'created',
      new_deployment_id: deployData.id,
      new_deployment_url: deployData.url ? `https://${deployData.url}` : null,
      cron_schedules: [
        { task: 'health', schedule: 'Every hour (0 * * * *)', description: 'Lightweight health ping' },
        { task: 'system_reflection', schedule: 'Every 6 hours (0 */6 * * *)', description: 'Full system scan + auto-fix empty entities + connector/secret checks' },
        { task: 'queue_process', schedule: 'Every 30 minutes (*/30 * * * *)', description: 'Process pending page generation queue' },
      ],
      message: 'Vercel Cron is fully configured and automated. PACK_SYNC_TOKEN has been set as an encrypted env var. Cron jobs will fire automatically on schedule — no manual triggering needed.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
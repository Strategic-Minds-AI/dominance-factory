import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Admin-only: queries the Supabase Management API connector for all projects,
// inspects each schema, and returns convergence status for the dashboard.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const conn = await base44.asServiceRole.connectors.getConnection('supabase');
    const accessToken = conn.accessToken;

    // List all projects
    const projectsRes = await fetch('https://api.supabase.com/v1/projects', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!projectsRes.ok) {
      return Response.json({ error: 'Failed to list Supabase projects' }, { status: 502 });
    }
    const projects = await projectsRes.json();

    // Check which project URL secrets are configured
    const secretKeys = ['SUPABASE_PROJECT_A_URL', 'SUPABASE_PROJECT_B_URL', 'SUPABASE_URL', 'SUPABASE_PROJECT_D_URL'];
    const configuredSecrets: Record<string, boolean> = {};
    for (const key of secretKeys) {
      configuredSecrets[key] = !!secrets.get(key);
    }

    // For each project, inspect schema (list public tables)
    const settled = await Promise.allSettled(
      (projects as any[]).map(async (p) => {
        let tables: string[] = [];
        let tableCount = 0;
        let schemaError: string | null = null;
        try {
          const schemaRes = await fetch(
            `https://api.supabase.com/v1/projects/${p.id}/database/query`,
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;" }),
              signal: AbortSignal.timeout(10000),
            }
          );
          if (schemaRes.ok) {
            const schemaData = await schemaRes.json();
            tables = Array.isArray(schemaData) ? schemaData.map((r: any) => r.tablename) : [];
            tableCount = tables.length;
          } else {
            schemaError = `Schema query returned ${schemaRes.status}`;
          }
        } catch (e: any) {
          schemaError = e.message;
        }

        // Match project ref to configured secret slot
        let secretSlot: string | null = null;
        for (const key of secretKeys) {
          const url = secrets.get(key);
          if (url && url.includes(p.id)) { secretSlot = key; break; }
        }

        // Convergence score: healthy (25) + secrets configured (25) + schema deployed (25) + has data (25)
        let score = 0;
        if (p.status === 'ACTIVE_HEALTHY') score += 25;
        if (secretSlot) score += 25;
        if (tableCount > 0) score += 25;
        if (tableCount >= 5) score += 25; // has meaningful data

        return {
          ref: p.id,
          name: p.name,
          status: p.status,
          region: p.region,
          organization_id: p.organization_id,
          tableCount,
          tables: tables.slice(0, 50),
          schemaError,
          secretSlot,
          convergenceScore: score,
        };
      })
    );

    const results = settled
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    return Response.json({
      projects: results,
      configuredSecrets,
      totalProjects: results.length,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
// Provisioning Engine — orchestrates Railway, Vercel, and Supabase provisioning.
// Creates services, deploys code, sets env vars, and returns live URLs.
import { secrets } from 'base44:runtime';

// ── Railway GraphQL Client ────────────────────────────────────
const RAILWAY_GQL = 'https://backboard.railway.app/graphql/v2';

export async function railwayGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  const token = secrets.get('RAILWAY_API_TOKEN');
  if (!token) throw new Error('RAILWAY_API_TOKEN not configured');
  const res = await fetch(RAILWAY_GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Project-Access-Token': token.trim() },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Railway API error ${res.status}`);
  const data = await res.json();
  if (data.errors?.length) throw new Error(`Railway: ${data.errors[0].message}`);
  return data.data;
}

export async function getProjectMeta(): Promise<{ projectId: string; environmentId: string }> {
  const data = await railwayGraphQL(`query { projectToken { projectId environmentId } }`);
  return { projectId: data.projectToken.projectId, environmentId: data.projectToken.environmentId };
}

export async function provisionRailwayService(name: string, repoUrl: string, envVars: Record<string, string> = {}): Promise<{ serviceId: string; url: string }> {
  const { projectId, environmentId } = await getProjectMeta();

  // Create service
  const createRes = await railwayGraphQL(
    `mutation($input: ServiceCreateInput!) { serviceCreate(input: $input) { id } }`,
    { input: { name, projectId, source: { repo: repoUrl } } }
  );
  const serviceId = createRes.serviceCreate.id;

  // Set env vars (batch — max 6 concurrent)
  const entries = Object.entries(envVars);
  for (let i = 0; i < entries.length; i += 6) {
    const batch = entries.slice(i, i + 6);
    await Promise.allSettled(batch.map(([key, value]) =>
      railwayGraphQL(
        `mutation($input: VariableCreateInput!) { variableCreate(input: $input) { id } }`,
        { input: { serviceId, environmentId, name: key, value } }
      )
    ));
  }

  // Trigger deployment
  await railwayGraphQL(
    `mutation($input: DeploymentCreateInput!) { deploymentCreate(input: $input) { id } }`,
    { input: { serviceId, environmentId, status: 'DEPLOYING', source: { repo: repoUrl } } }
  );

  // Get domain (may take a moment to be ready)
  let url = '';
  try {
    const domainRes = await railwayGraphQL(
      `query($serviceId: String!, $environmentId: String!) { service(id: $serviceId) { serviceInstances(environmentId: $environmentId) { edges { node { domains { edges { node { domain } } } } } } } }`,
      { serviceId, environmentId }
    );
    const domain = domainRes?.service?.serviceInstances?.edges?.[0]?.node?.domains?.edges?.[0]?.node?.domain;
    if (domain) url = `https://${domain}`;
  } catch { /* domain not ready yet */ }

  return { serviceId, url };
}

// ── Vercel Deployment ─────────────────────────────────────────
export async function vercelRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = secrets.get('VERCEL_API_TOKEN');
  if (!token) throw new Error('VERCEL_API_TOKEN not configured');
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${err.substring(0, 400)}`);
  }
  return await res.json();
}

export async function provisionVercelProject(name: string, files: Array<{ file: string; data: string }>): Promise<{ projectId: string; deploymentId: string; url: string }> {
  // Create or get project
  let project;
  try {
    project = await vercelRequest('/v11/projects', { method: 'POST', body: JSON.stringify({ name }) });
  } catch {
    project = await vercelRequest(`/v11/projects/${name}`);
  }

  // Create deployment with inline files
  const deployment = await vercelRequest('/v13/deployments', {
    method: 'POST',
    body: JSON.stringify({ name, project: name, files, target: 'production' }),
  });

  return {
    projectId: project.id,
    deploymentId: deployment.id,
    url: deployment.url ? `https://${deployment.url}` : '',
  };
}

// ── Supabase Schema Provisioning ──────────────────────────────
export async function provisionSupabaseSchema(sql: string): Promise<any> {
  const key = secrets.get('SUPABASE_SERVICE_ROLE_KEY');
  const url = secrets.get('SUPABASE_URL');
  if (!key || !url) throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not configured');
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err.substring(0, 400)}`);
  }
  return await res.json();
}
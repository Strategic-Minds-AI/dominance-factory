// Full automated provisioning — creates Railway services, Vercel deployments,
// and orchestrates the entire infrastructure for a new system or client.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { provisionRailwayService, provisionVercelProject, getProjectMeta, railwayGraphQL, checkDomainAvailability, purchaseDomain } from '../../shared/provisioningEngine.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { name, job_type, repo_url, env_vars, files, domain, purchase_domain, contact_info } = body;

    if (!name) return Response.json({ error: 'name is required' }, { status: 400 });

    // Create provisioning job record
    const job = await base44.asServiceRole.entities.ProvisioningJob.create({
      name,
      job_type: job_type || 'website',
      status: 'provisioning',
      config: JSON.stringify({ repo_url, env_vars, domain, files_count: files?.length || 0 }),
    });

    const results: any = { job_id: job.id };
    const errors: string[] = [];

    // ── Provision Railway service (for backend/browser/agent systems) ──
    if (job_type === 'browser_service' || job_type === 'agent_system' || job_type === 'full_stack' || job_type === 'social_suite') {
      try {
        const repo = repo_url || 'https://github.com/microsoft/playwright-python';
        const railway = await provisionRailwayService(name, repo, env_vars || {});
        results.railway = railway;
        await base44.asServiceRole.entities.ProvisioningJob.update(job.id, {
          railway_service_id: railway.serviceId,
          railway_url: railway.url,
        });
      } catch (e) {
        errors.push(`Railway: ${e.message}`);
      }
    }

    // ── Provision Vercel deployment (for websites/frontend) ──
    if (job_type === 'website' || job_type === 'full_stack' || job_type === 'social_suite') {
      try {
        if (!files?.length) throw new Error('files array required for Vercel deployment');
        const vercel = await provisionVercelProject(name, files);
        results.vercel = vercel;
        await base44.asServiceRole.entities.ProvisioningJob.update(job.id, {
          vercel_project_id: vercel.projectId,
          vercel_url: vercel.url,
        });
      } catch (e) {
        errors.push(`Vercel: ${e.message}`);
      }
    }

    // ── Purchase domain via GoDaddy (if requested) ──
    if (domain && purchase_domain) {
      try {
        const availability = await checkDomainAvailability(domain);
        results.domain_availability = availability;
        if (availability.available) {
          const purchase = await purchaseDomain({ domain, contactInfo: contact_info });
          results.domain_purchase = purchase;
          await base44.asServiceRole.entities.ProvisioningJob.update(job.id, { domain });
        } else {
          errors.push(`Domain ${domain} not available`);
        }
      } catch (e) {
        errors.push(`GoDaddy: ${e.message}`);
      }
    }

    // ── List existing Railway services (for status dashboard) ──
    if (job_type === 'browser_service' && !repo_url) {
      try {
        const { projectId, environmentId } = await getProjectMeta();
        const services = await railwayGraphQL(
          `query($projectId: String!) { project(id: $projectId) { services { edges { node { id name } } } } }`,
          { projectId }
        );
        results.available_services = services?.project?.services?.edges?.map((e: any) => e.node) || [];
      } catch (e) {
        errors.push(`Railway listing: ${e.message}`);
      }
    }

    // ── Update job status ──
    const success = errors.length === 0;
    await base44.asServiceRole.entities.ProvisioningJob.update(job.id, {
      status: success ? 'deployed' : 'failed',
      result: JSON.stringify(results),
      error: errors.join('; ') || '',
      domain: domain || '',
    });

    return Response.json({ job_id: job.id, status: success ? 'deployed' : 'failed', results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
// Auto-provisions a live Vercel website from an approved Pack's preview_html.
// Triggered by the "Pack Approval Provisioning" workflow when a Pack's status
// changes to "approved". Uses service role (no user context from workflows).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { provisionVercelProject } from '../../shared/provisioningEngine.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { pack_id } = body;

    if (!pack_id) return Response.json({ error: 'pack_id is required' }, { status: 400 });

    const entities = base44.asServiceRole.entities;

    // 1. Fetch the approved pack
    const pack = await entities.Pack.get(pack_id);
    if (!pack) return Response.json({ error: 'Pack not found' }, { status: 404 });
    if (pack.status !== 'approved') return Response.json({ error: 'Pack is not approved' }, { status: 400 });

    if (!pack.preview_html) return Response.json({ error: 'Pack has no preview_html to deploy' }, { status: 400 });

    // 2. Deploy preview_html to Vercel as a static site
    const slug = pack.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pack-' + pack_id.slice(-6);
    const files = [{ file: 'index.html', data: pack.preview_html }];
    const vercel = await provisionVercelProject(slug, files);

    // 3. Create a Website record linked to the source pack
    const website = await entities.Website.create({
      name: pack.name,
      category: 'landing_page',
      preview_html: pack.preview_html,
      brand_tokens: pack.brand_tokens || '',
      status: 'published',
      source_pack_id: pack_id,
      url_pattern: vercel.url || '',
      description: `Auto-provisioned from pack: ${pack.name}`,
    });

    // 4. Update the Pack to "published" with the live URL
    const metadata = JSON.stringify({
      vercel_project_id: vercel.projectId,
      vercel_url: vercel.url,
      website_id: website.id,
      provisioned_at: new Date().toISOString(),
    });

    await entities.Pack.update(pack_id, {
      status: 'published',
      metadata,
    });

    return Response.json({
      pack_id,
      website_id: website.id,
      vercel_url: vercel.url,
      vercel_project_id: vercel.projectId,
      status: 'published',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { classifyAllSystems } from "../../shared/systemClassifier.ts";

// Asset Categorizer — deterministically scans all system components and
// catalogs any new ones into the SystemInventory master library.
// Called by Vercel Cron (via cronRunner) every 12 hours.

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || new URL(req.url).searchParams.get('token') || '';
    const expectedToken = secrets.get('PACK_SYNC_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      return Response.json({ error: 'Invalid or missing token' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // 1. Classify all systems deterministically
    const allSystems = classifyAllSystems();

    // 2. Get existing inventory records
    const existingPage = await base44.asServiceRole.entities.SystemInventory.list({ limit: 500 });
    const existingRecords: any[] = existingPage.items || existingPage;
    const existingMap = new Map(existingRecords.map((r: any) => [r.registry_key, r]));

    // 3. Find missing systems and create them
    const missing = allSystems.filter(s => !existingMap.has(s.registry_key));
    let created = 0;
    for (const system of missing) {
      try {
        await base44.asServiceRole.entities.SystemInventory.create({
          system_name: system.system_name,
          system_type: system.system_type,
          category: system.category,
          subcategory: system.subcategory,
          description: system.description,
          capabilities: JSON.stringify(system.capabilities),
          dependencies: JSON.stringify(system.dependencies),
          reuse_potential: system.reuse_potential,
          classification_confidence: 100,
          status: 'active',
          tags: JSON.stringify(system.tags),
          registry_key: system.registry_key,
          last_scanned_at: new Date().toISOString(),
        });
        created++;
      } catch {}
    }

    // 4. Update last_scanned_at for existing records (batch)
    let updated = 0;
    const now = new Date().toISOString();
    for (const system of allSystems) {
      const record = existingMap.get(system.registry_key);
      if (record) {
        try {
          await base44.asServiceRole.entities.SystemInventory.update(record.id, {
            last_scanned_at: now,
            status: 'active',
          });
          updated++;
        } catch {}
      }
    }

    return Response.json({
      status: 'categorized',
      total_systems: allSystems.length,
      already_cataloged: allSystems.length - missing.length,
      newly_categorized: created,
      updated: updated,
      timestamp: now,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
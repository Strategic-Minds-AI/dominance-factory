import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { classifyAllSystems, type ClassifiedSystem } from "../../shared/systemClassifier.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'scan';

    if (action === 'scan') {
      // Run deterministic classification on all components
      const classified = classifyAllSystems();
      const now = new Date().toISOString();

      // Upsert all classified systems into SystemInventory
      const records = classified.map((s: ClassifiedSystem) => ({
        registry_key: s.registry_key,
        system_name: s.system_name,
        system_type: s.system_type,
        category: s.category,
        subcategory: s.subcategory,
        description: s.description,
        capabilities: JSON.stringify(s.capabilities),
        dependencies: JSON.stringify(s.dependencies),
        integration_points: s.capabilities.join(", "),
        reuse_potential: s.reuse_potential,
        classification_confidence: 100,
        last_scanned_at: now,
        status: 'active',
        tags: JSON.stringify(s.tags),
      }));

      await base44.asServiceRole.entities.SystemInventory.upsert(records, { key: 'registry_key' });

      // Build category summary
      const categoryMap: Record<string, number> = {};
      const typeMap: Record<string, number> = {};
      for (const s of classified) {
        categoryMap[s.category] = (categoryMap[s.category] || 0) + 1;
        typeMap[s.system_type] = (typeMap[s.system_type] || 0) + 1;
      }

      return Response.json({
        status: 'complete',
        total_systems: classified.length,
        categories: categoryMap,
        types: typeMap,
        systems: classified,
        scanned_at: now,
      });
    }

    if (action === 'query') {
      // Query the stored inventory, optionally filtered
      const filter: Record<string, unknown> = {};
      if (body.category) filter.category = body.category;
      if (body.system_type) filter.system_type = body.system_type;
      if (body.reuse_potential) filter.reuse_potential = body.reuse_potential;

      const result = await base44.asServiceRole.entities.SystemInventory.filter(filter, {
        sort: 'category',
        limit: 500,
      });

      // Group by category
      const grouped: Record<string, any[]> = {};
      for (const item of result.items) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      }

      return Response.json({
        total: result.items.length,
        grouped,
        items: result.items,
      });
    }

    if (action === 'find_reusable') {
      // Given a set of features/requirements, find reusable internal assets
      const features: string[] = body.features || [];
      const inventoryResult = await base44.asServiceRole.entities.SystemInventory.filter(
        { reuse_potential: { $in: ['high', 'medium'] } },
        { limit: 500 }
      );

      // Parse capabilities back from JSON
      const inventory = inventoryResult.items.map(item => ({
        ...item,
        capabilities: (() => { try { return JSON.parse(item.capabilities || '[]'); } catch { return []; } })(),
      }));

      const reusable: any[] = [];
      for (const feature of features) {
        const featureLower = feature.toLowerCase();
        for (const item of inventory) {
          const caps = Array.isArray(item.capabilities) ? item.capabilities : [];
          const matches = caps.some((c: string) => featureLower.includes(c.replace(/_/g, " "))) ||
                          featureLower.includes(item.system_name.toLowerCase()) ||
                          featureLower.includes(item.category.replace(/_/g, " "));
          if (matches && !reusable.find(r => r.id === item.id)) {
            reusable.push(item);
          }
        }
      }

      return Response.json({
        requested_features: features,
        reusable_assets: reusable,
        count: reusable.length,
      });
    }

    return Response.json({ error: 'Unknown action. Use: scan, query, or find_reusable' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
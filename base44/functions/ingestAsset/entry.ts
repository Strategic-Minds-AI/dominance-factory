import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { classifyAsset } from "../../shared/assetClassifier.ts";
import { aiComplete, MODELS } from "../../shared/vercelAiGateway.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'ingest';

    // ── INGEST: Process a new asset from a URL ──
    if (action === 'ingest') {
      const fileUrl = body.file_url || '';
      const fileName = body.file_name || fileUrl.split('/').pop() || 'unknown';
      const fileSize = body.file_size || 0;
      const providedMetadata = body.metadata || '';

      if (!fileUrl.trim()) return Response.json({ error: 'file_url is required' }, { status: 400 });

      // Deterministic classification
      const classification = classifyAsset(fileName);

      // For zip archives, try to get more info
      let contentSummary = '';
      let extractedMetadata: any = { file_name: fileName, file_url: fileUrl };
      let detectedSystems = classification.detected_systems;

      // If metadata was provided (e.g., zip file list from frontend), use it
      if (providedMetadata) {
        try {
          const parsed = typeof providedMetadata === 'string' ? JSON.parse(providedMetadata) : providedMetadata;
          extractedMetadata = { ...extractedMetadata, ...parsed };
          if (parsed.file_list) {
            // Re-classify based on zip contents
            const fileNames = parsed.file_list.map((f: string) => f.toLowerCase()).join(' ');
            const reclassified = classifyAsset(fileNames);
            if (reclassified.category !== 'Uncategorized') {
              classification.category = reclassified.category;
              classification.subcategory = reclassified.subcategory;
              classification.source_type = reclassified.source_type;
              classification.tags = [...new Set([...classification.tags, ...reclassified.tags])];
              detectedSystems = [...new Set([...detectedSystems, ...reclassified.detected_systems])];
            }
            extractedMetadata.file_count = parsed.file_list.length;
          }
        } catch {}
      }

      // Generate AI summary via Vercel AI Gateway
      try {
        const summaryPrompt = `Analyze this uploaded asset and provide a 2-3 sentence summary of what it is and what it does.
File name: ${fileName}
Category: ${classification.category}
Subcategory: ${classification.subcategory}
Detected systems: ${detectedSystems.join(', ')}
${providedMetadata ? `Additional metadata: ${JSON.stringify(providedMetadata).substring(0, 1000)}` : ''}

Provide only the summary, no other text.`;
        contentSummary = await aiComplete({
          model: MODELS.fast,
          messages: [{ role: 'user', content: summaryPrompt }],
          temperature: 0.3,
          max_tokens: 500,
        });
      } catch {
        contentSummary = `Auto-categorized as ${classification.category} / ${classification.subcategory}`;
      }

      // Create the IngestedAsset record
      const record = await base44.asServiceRole.entities.IngestedAsset.create({
        name: fileName,
        source_type: classification.source_type,
        category: classification.category,
        subcategory: classification.subcategory,
        file_url: fileUrl,
        file_type: fileName.split('.').pop()?.toLowerCase() || 'unknown',
        file_size: fileSize,
        content_summary: contentSummary.trim(),
        extracted_metadata: JSON.stringify(extractedMetadata),
        organization_tags: JSON.stringify(classification.tags),
        auto_categorized: true,
        processing_status: 'categorized',
        detected_systems: JSON.stringify(detectedSystems),
        file_count: extractedMetadata.file_count || 0,
        ingest_date: new Date().toISOString(),
      });

      return Response.json({
        status: 'categorized',
        asset_id: record.id,
        classification,
        content_summary: contentSummary.trim(),
      });
    }

    // ── LIST: Query ingested assets ──
    if (action === 'list') {
      const filter = body.filter || {};
      const limit = body.limit || 50;
      const res = await base44.asServiceRole.entities.IngestedAsset.filter(filter, {
        sort: '-ingest_date',
        limit,
      });
      return Response.json({
        assets: res.items || [],
        count: (res.items || []).length,
        has_more: res.has_more,
      });
    }

    // ── CATEGORIES: Get all categories with counts ──
    if (action === 'categories') {
      const res = await base44.asServiceRole.entities.IngestedAsset.aggregate({
        groupBy: 'category',
        sort: '-count',
        limit: 100,
      });
      return Response.json({ categories: res.rows || [] });
    }

    // ── REORGANIZE: Re-scan and re-categorize all assets ──
    if (action === 'reorganize') {
      const res = await base44.asServiceRole.entities.IngestedAsset.filter(
        { processing_status: 'categorized' },
        { sort: '-ingest_date', limit: 500 }
      );
      let updated = 0;
      for (const asset of res.items || []) {
        const reclassified = classifyAsset(asset.name || '');
        if (reclassified.category !== asset.category) {
          await base44.asServiceRole.entities.IngestedAsset.update(asset.id, {
            category: reclassified.category,
            subcategory: reclassified.subcategory,
            source_type: reclassified.source_type,
            organization_tags: JSON.stringify(reclassified.tags),
            detected_systems: JSON.stringify(reclassified.detected_systems),
          });
          updated++;
        }
      }
      return Response.json({ reorganized: updated, total_scanned: (res.items || []).length });
    }

    // ── DELETE ──
    if (action === 'delete') {
      if (!body.id) return Response.json({ error: 'id is required' }, { status: 400 });
      await base44.asServiceRole.entities.IngestedAsset.delete(body.id);
      return Response.json({ status: 'deleted', id: body.id });
    }

    return Response.json({ error: 'Unknown action. Use: ingest, list, categories, reorganize, delete' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Direct file upload to Supabase Storage — bypasses Base44 UploadPrivateFile/UploadPublicFile.
// Uses the user's SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.
// Files are stored in the user's own Supabase project, not Base44's storage.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // Use the user's own Supabase project (Project A) — not the Base44 internal Supabase
    const supabaseUrl = body.supabase_url || secrets.get('SUPABASE_PROJECT_A_URL') || secrets.get('SUPABASE_URL');
    const serviceKey = body.supabase_key || secrets.get('SUPABASE_PROJECT_A_KEY') || secrets.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'SUPABASE_PROJECT_A_URL and SUPABASE_PROJECT_A_KEY must be configured (set in dashboard secrets)' }, { status: 500 });
    }

    const action = body.action || 'upload';

    // ── UPLOAD: Upload a base64-encoded file to Supabase Storage ──
    if (action === 'upload') {
      const { file_data, file_name, bucket, folder, content_type, public: isPublic } = body;
      if (!file_data || !file_name) {
        return Response.json({ error: 'file_data (base64) and file_name are required' }, { status: 400 });
      }

      const bucketName = bucket || 'uploads';
      const filePath = folder ? `${folder}/${Date.now()}-${file_name}` : `${Date.now()}-${file_name}`;

      // Convert base64 to bytes
      const base64Data = file_data.includes(',') ? file_data.split(',')[1] : file_data;
      const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': content_type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: bytes,
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Supabase upload error ${res.status}: ${err.substring(0, 500)}` }, { status: 502 });
      }

      // Construct the public URL (if bucket is public) or return the path for signed URL generation
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
      const privatePath = `${bucketName}/${filePath}`;

      return Response.json({
        status: 'uploaded',
        provider: 'supabase',
        path: privatePath,
        public_url: publicUrl,
        bucket: bucketName,
        file_name: file_name,
      });
    }

    // ── SIGNED URL: Generate a signed URL for a private file ──
    if (action === 'signed_url') {
      const { path, expires_in } = body;
      if (!path) return Response.json({ error: 'path is required' }, { status: 400 });

      const expiresIn = expires_in || 3600;
      const signedUrl = `${supabaseUrl}/storage/v1/object/sign/${path}?token=`;
      
      // Use Supabase API to create a signed URL
      const res = await fetch(`${supabaseUrl}/storage/v1/object/sign/${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Supabase signed URL error ${res.status}: ${err.substring(0, 500)}` }, { status: 502 });
      }

      const data = await res.json();
      const fullUrl = `${supabaseUrl}/storage/v1${data.signedURL}`;
      return Response.json({ signed_url: fullUrl, provider: 'supabase' });
    }

    // ── CREATE BUCKET: Create a new storage bucket ──
    if (action === 'create_bucket') {
      const { bucket_name, public: isPublic } = body;
      if (!bucket_name) return Response.json({ error: 'bucket_name is required' }, { status: 400 });

      const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: bucket_name, public: isPublic || false }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Supabase bucket error ${res.status}: ${err.substring(0, 500)}` }, { status: 502 });
      }

      const data = await res.json();
      return Response.json({ status: 'bucket_created', name: bucket_name, provider: 'supabase' });
    }

    // ── DELETE: Delete a file from Supabase Storage ──
    if (action === 'delete') {
      const { path } = body;
      if (!path) return Response.json({ error: 'path is required' }, { status: 400 });

      const res = await fetch(`${supabaseUrl}/storage/v1/object/${path}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${serviceKey}` },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Supabase delete error ${res.status}: ${err.substring(0, 500)}` }, { status: 502 });
      }

      return Response.json({ status: 'deleted', path, provider: 'supabase' });
    }

    return Response.json({ error: 'Unknown action. Use: upload, signed_url, create_bucket, delete' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
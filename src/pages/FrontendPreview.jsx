import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ExternalLink } from 'lucide-react';

export default function FrontendPreview() {
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Pack.filter(
          { source: 'frontend_template', status: 'approved' },
          { sort: '-created_date', limit: 1 }
        );
        if (items.length > 0 && items[0].preview_html) {
          setHtml(items[0].preview_html);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-700">No frontend template set</p>
          <p className="text-sm text-gray-500">
            Go to GPT Sync → Website Library → Archetypes and click "Use as Frontend".
          </p>
          <a href="/sync" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ExternalLink className="h-4 w-4" /> Go to Library
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      title="ApexForge Frontend"
      className="w-full min-h-screen border-0"
      style={{ height: '100vh' }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
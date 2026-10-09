import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, Webhook } from 'lucide-react';

const ENDPOINT_URL = 'https://build-scale-dominate.base44.app/functions/ingestPack';

const CURL_EXAMPLE = `curl -X POST ${ENDPOINT_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "sync_token": "<your PACK_SYNC_TOKEN>",
    "name": "Hero Mockup v2",
    "kind": "web_pack",
    "preview_html": "<!doctype html>...</html>",
    "brand_tokens": "{\\"colors\\":{...}}",
    "source": "gpt_sync",
    "submitted_by_label": "GPT"
  }'`;

export default function GptSyncInfo() {
  const [copied, setCopied] = useState(false);

  const copyCurl = () => {
    navigator.clipboard.writeText(CURL_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 space-y-4 text-left">
      <div className="flex items-center gap-2">
        <Webhook className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">GPT Sync Endpoint</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Let GPT (or any external tool) POST approved mockups straight in. They land as
        pending review — nothing goes live until you approve.
      </p>

      <div className="rounded-md bg-muted px-3 py-2 flex items-center justify-between gap-2">
        <code className="text-xs font-mono break-all">{ENDPOINT_URL}</code>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => {
          navigator.clipboard.writeText(ENDPOINT_URL);
        }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">curl example</span>
          </div>
          <Button variant="outline" size="sm" onClick={copyCurl}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <pre className="text-xs font-mono bg-[#0a0a0a] text-gray-300 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
          {CURL_EXAMPLE}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground">
        Header auth: send <code className="bg-muted px-1 rounded">sync_token</code> in the
        JSON body matching your <code className="bg-muted px-1 rounded">PACK_SYNC_TOKEN</code> secret.
        Set it in dashboard → Secrets.
      </p>
    </Card>
  );
}
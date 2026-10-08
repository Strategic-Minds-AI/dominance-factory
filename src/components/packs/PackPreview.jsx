import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';

export default function PackPreview({ pack, open, onClose, onApprove, onReject }) {
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(null);

  if (!pack) return null;

  let tokens = {};
  try {
    tokens = JSON.parse(pack.brand_tokens || '{}');
  } catch {
    tokens = { raw: pack.brand_tokens };
  }

  let metadata = {};
  try {
    metadata = JSON.parse(pack.metadata || '{}');
  } catch {
    metadata = {};
  }

  const handleApprove = async () => {
    setActing('approve');
    try {
      await onApprove(pack);
    } finally {
      setActing(null);
      setNotes('');
    }
  };

  const handleReject = async () => {
    setActing('reject');
    try {
      await onReject(pack, notes);
    } finally {
      setActing(null);
      setNotes('');
    }
  };

  const isPending = pack.status === 'pending_review';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {pack.name}
            <Badge variant="outline" className="capitalize">
              {pack.status?.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 pr-1">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{pack.kind?.replace('_', ' ')}</Badge>
            <Badge variant="secondary">Source: {pack.source}</Badge>
            <Badge variant="secondary">By: {pack.submitted_by_label}</Badge>
          </div>

          {pack.preview_html && (
            <div>
              <p className="text-sm font-semibold mb-2">Live Preview</p>
              <iframe
                srcDoc={pack.preview_html}
                className="w-full h-[400px] border rounded-md bg-white"
                title="Pack Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}

          {Object.keys(tokens).length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Brand Tokens</p>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                {JSON.stringify(tokens, null, 2)}
              </pre>
            </div>
          )}

          {Object.keys(metadata).length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Metadata</p>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}

          {pack.review_notes && (
            <div>
              <p className="text-sm font-semibold mb-1">Review Notes</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {pack.review_notes}
              </p>
            </div>
          )}
        </div>

        {isPending && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder="Review notes (optional for approval, recommended for rejection)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!!acting}
              >
                {acting === 'reject' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={!!acting}>
                {acting === 'approve' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Package, Inbox } from 'lucide-react';
import { CATEGORIES } from '@/lib/websiteTemplates';

const STATUS_FILTERS = [
  { key: 'pending_review', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const statusColor = {
  pending_review: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  published: 'bg-blue-500/20 text-blue-400',
};

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : 'Uncategorized';
}

function PackThumb({ pack, isSelected, onSelect, onApprove, onReject, approving, rejecting }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'border-white ring-1 ring-white/30' : 'border-neutral-800 hover:border-neutral-600'
      }`}
    >
      <div className="relative h-32 bg-neutral-800 overflow-hidden">
        {pack.preview_html ? (
          <iframe
            srcDoc={pack.preview_html}
            title={pack.name}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: '1280px',
              height: '800px',
              transform: 'scale(0.234)',
              transformOrigin: 'top left',
            }}
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-xs">
            No preview
          </div>
        )}
        <div className="absolute top-1.5 right-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColor[pack.status] || ''}`}>
            {pack.status?.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="p-2.5 space-y-2 bg-neutral-900">
        <div>
          <p className="text-xs font-medium text-white truncate">{pack.name}</p>
          <p className="text-[11px] text-neutral-500 truncate">{categoryLabel(pack.category)}</p>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1 border-neutral-700 bg-transparent text-green-400 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50"
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            disabled={approving || pack.status === 'approved'}
          >
            {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-1 border-neutral-700 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            disabled={rejecting || pack.status === 'rejected'}
          >
            {rejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
            Disapprove
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PackGallery({ selectedPack, onSelectPack, onApprove, onReject, approving, rejecting }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadPacks = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (statusFilter !== 'all') query.status = statusFilter;
      if (categoryFilter !== 'all') query.category = categoryFilter;
      const { items } = await base44.entities.Pack.filter(query, {
        sort: '-created_date',
        limit: 50,
      });
      setPacks(items);
    } catch {
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  return (
    <div className="w-80 flex flex-col h-full bg-neutral-950 border-r border-neutral-800 shrink-0">
      <div className="p-3 border-b border-neutral-800 space-y-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-white">GPT Pack Gallery</h3>
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-neutral-900 text-white text-xs rounded px-2 py-1.5 border border-neutral-700 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm space-y-2">
            <Inbox className="h-8 w-8 mx-auto opacity-50" />
            <p>No packs found.</p>
          </div>
        ) : (
          packs.map((pack) => (
            <PackThumb
              key={pack.id}
              pack={pack}
              isSelected={selectedPack?.id === pack.id}
              onSelect={() => onSelectPack(pack)}
              onApprove={() => onApprove(pack)}
              onReject={() => onReject(pack)}
              approving={approving === pack.id}
              rejecting={rejecting === pack.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
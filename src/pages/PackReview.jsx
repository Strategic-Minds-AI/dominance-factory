import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Clock, CheckCircle, XCircle, Package, Inbox } from 'lucide-react';
import PackCard from '@/components/packs/PackCard';
import PackPreview from '@/components/packs/PackPreview';
import GptSyncInfo from '@/components/packs/GptSyncInfo';

const FILTERS = [
  { key: 'pending_review', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'all', label: 'All', icon: Package },
];

export default function PackReview() {
  const [packs, setPacks] = useState([]);
  const [counts, setCounts] = useState({ pending_review: 0, approved: 0, rejected: 0 });
  const [activeFilter, setActiveFilter] = useState('pending_review');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        base44.entities.Pack.count({ status: 'pending_review' }),
        base44.entities.Pack.count({ status: 'approved' }),
        base44.entities.Pack.count({ status: 'rejected' }),
      ]);
      setCounts({ pending_review: pending, approved, rejected });
    } catch {
      // counts may fail if entity not yet propagated
    }
  }, []);

  const loadPacks = useCallback(async () => {
    setLoading(true);
    try {
      const query = activeFilter === 'all' ? {} : { status: activeFilter };
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
  }, [activeFilter]);

  useEffect(() => {
    loadPacks();
    loadCounts();
  }, [loadPacks, loadCounts]);

  const refreshAll = () => {
    loadPacks();
    loadCounts();
  };

  const handleApprove = async (pack) => {
    await base44.entities.Pack.update(pack.id, {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    });
    setPreviewOpen(false);
    setSelected(null);
    refreshAll();
  };

  const handleReject = async (pack, notes) => {
    await base44.entities.Pack.update(pack.id, {
      status: 'rejected',
      review_notes: notes || 'Rejected',
      reviewed_at: new Date().toISOString(),
    });
    setPreviewOpen(false);
    setSelected(null);
    refreshAll();
  };

  const openPack = (pack) => {
    setSelected(pack);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Digital Dominance</h1>
            <p className="text-sm opacity-80">Pack Approval Portal</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-bold mt-1">{counts.pending_review}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{counts.approved}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{counts.rejected}</p>
          </Card>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const count = f.key === 'all' ? null : counts[f.key];
            return (
              <Button
                key={f.key}
                variant={activeFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(f.key)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {f.label}
                {count !== null && <span className="ml-1 opacity-70">({count})</span>}
              </Button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading packs...</div>
        ) : packs.length === 0 ? (
          <div className="space-y-6">
            <Card className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No packs in this view yet.</p>
            </Card>
            <div className="max-w-2xl mx-auto">
              <GptSyncInfo />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} onClick={openPack} />
            ))}
          </div>
        )}
      </main>

      <PackPreview
        pack={selected}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
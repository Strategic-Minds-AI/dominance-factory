import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const statusVariant = {
  pending_review: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  published: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function PackCard({ pack, onClick }) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(pack)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{pack.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {pack.kind?.replace('_', ' ')} · from {pack.submitted_by_label || 'GPT'}
          </p>
        </div>
        <Badge variant="outline" className={statusVariant[pack.status] || ''}>
          {pack.status?.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {format(new Date(pack.created_date), 'MMM d, yyyy · h:mm a')}
      </p>
    </Card>
  );
}
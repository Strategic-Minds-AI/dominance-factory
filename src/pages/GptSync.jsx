import React, { useState } from 'react';
import GptSyncInfo from '@/components/packs/GptSyncInfo';
import WebsiteLibrary from '@/components/packs/WebsiteLibrary';
import { Webhook, BookOpen } from 'lucide-react';

export default function GptSync() {
  const [tab, setTab] = useState('endpoint');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          <div>
            <h1 className="text-xl font-bold">GPT System Gateway</h1>
            <p className="text-sm opacity-80">Full end-to-end system access for GPT — query entities, invoke functions, trigger research, submit packs</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('endpoint')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'endpoint' ? 'bg-[#0a0a0a] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Webhook className="h-4 w-4" />
            Endpoint
          </button>
          <button
            onClick={() => setTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'library' ? 'bg-[#0a0a0a] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Website Library
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === 'endpoint' ? (
          <div className="max-w-2xl">
            <GptSyncInfo />
          </div>
        ) : (
          <WebsiteLibrary />
        )}
      </main>
    </div>
  );
}
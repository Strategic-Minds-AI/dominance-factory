import React from 'react';
import GptSyncInfo from '@/components/packs/GptSyncInfo';
import { Webhook } from 'lucide-react';

export default function GptSync() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          <div>
            <h1 className="text-xl font-bold">GPT Sync Endpoint</h1>
            <p className="text-sm opacity-80">Submit website mockups from GPT or any external tool</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <GptSyncInfo />
      </main>
    </div>
  );
}
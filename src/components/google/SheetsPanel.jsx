import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Table, Link } from "lucide-react";

export default function SheetsPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState('');

  const createSheet = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'sheets', action: 'create', title });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="max-w-lg space-y-3">
        <h3 className="text-sm font-semibold">Create New Spreadsheet</h3>
        <p className="text-xs text-gray-500">Creates a new Google Sheet in your Drive. Use the Backup tab to export entity data into it.</p>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Spreadsheet title" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm" />
        <button onClick={createSheet} disabled={loading || !title} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />} Create Sheet
        </button>
        {result && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-green-400 text-sm">Created! {result.spreadsheet_id}</p>
            <a href={result.spreadsheet_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 text-xs hover:underline mt-1">
              <Link className="w-3 h-3" /> Open in Google Sheets
            </a>
          </div>
        )}
      </div>
      <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
        <p className="text-sm text-gray-400">
          To back up entity data (Websites, Packs, SocialPosts, etc.) to a Google Sheet, use the <strong className="text-white">Backup</strong> tab —
          it creates the spreadsheet and fills it with all records in one step.
        </p>
      </div>
    </div>
  );
}
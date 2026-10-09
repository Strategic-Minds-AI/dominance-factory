import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Database, FileText, Link } from "lucide-react";

const ENTITIES = [
  'Website', 'Pack', 'SocialPost', 'LaunchCampaign', 'GeneratedPage',
  'Agent', 'AgentTask', 'MediaAsset', 'OutreachCampaign', 'ProvisioningJob',
  'ResearchStrategy', 'BenchmarkSystem', 'SystemInventory', 'SystemIssue',
  'IngestedAsset', 'ABTest', 'NearMeCandidate', 'OnboardingSession',
  'BuildPlan', 'SystemTemplate', 'HubProduct', 'InfoCategory',
  'SwarmGenerator', 'DiscoveryMethod', 'ProgrammaticRule', 'MediaOutlet',
  'SocialAccount', 'PostSchedule', 'ProblemPattern', 'WorkflowPack',
  'PromptEntry', 'DemandTheme', 'ContractorPersona', 'BuyerPersona',
  'ContractorStep', 'ConnectorEntry', 'ContractorTechOption', 'Opportunity',
];

export default function BackupPanel() {
  const [entity, setEntity] = useState('Website');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const backupToSheets = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'backup', action: 'entity_to_sheets', entity_name: entity });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const backupToDoc = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'backup', action: 'entity_to_doc', entity_name: entity });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="max-w-lg space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Back Up Entity Data to Google</h3>
          <p className="text-xs text-gray-500 mb-3">Exports all records from the selected entity into a new Google Sheet (structured data) or Google Doc (formatted report) in your Drive.</p>
          <select value={entity} onChange={e => setEntity(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm">
            {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={backupToSheets} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />} Backup to Sheets
          </button>
          <button onClick={backupToDoc} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Backup to Doc
          </button>
        </div>
        {result && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-green-400 text-sm font-medium">Backed up {result.record_count} records from {result.entity}</p>
            {result.spreadsheet_url && <a href={result.spreadsheet_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 text-xs hover:underline mt-2"><Link className="w-3 h-3" /> Open Google Sheet</a>}
            {result.document_url && <a href={result.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 text-xs hover:underline mt-2"><Link className="w-3 h-3" /> Open Google Doc</a>}
          </div>
        )}
      </div>
      <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Sheets backup</strong> creates a structured spreadsheet with column headers and one row per record.
          <strong className="text-white"> Doc backup</strong> creates a formatted report document with all record details.
          Both are saved to your Google Drive automatically.
        </p>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Upload, Loader2, File } from "lucide-react";

export default function DrivePanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [uploadForm, setUploadForm] = useState({ name: '', content: '', content_type: 'text/plain' });
  const [result, setResult] = useState(null);

  const listFiles = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'drive', action: 'list', max: 20 });
      setFiles(res.data.files || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const createFolder = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'drive', action: 'create_folder', name: folderName });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  const uploadFile = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('googleWorkspace', { service: 'drive', action: 'upload', ...uploadForm });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="mb-6">
        <button onClick={listFiles} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1e40af] text-sm disabled:opacity-50 mb-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />} List App Files
        </button>
        <p className="text-xs text-gray-500 mb-2">Shows files created by this app (drive.file scope)</p>
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-md p-3">
              <File className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-gray-500">{f.mimeType}</p>
              </div>
              {f.webViewLink && <a href={f.webViewLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Open</a>}
            </div>
          ))}
          {files.length === 0 && !loading && <p className="text-gray-500 text-sm">No files loaded.</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-2">Create Folder</h3>
          <input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder name" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm mb-2" />
          <button onClick={createFolder} disabled={loading || !folderName} className="px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-sm disabled:opacity-50">Create</button>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Upload Text File</h3>
          <input value={uploadForm.name} onChange={e => setUploadForm({...uploadForm, name: e.target.value})} placeholder="File name" className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm mb-2" />
          <textarea value={uploadForm.content} onChange={e => setUploadForm({...uploadForm, content: e.target.value})} placeholder="File content" rows={3} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-sm mb-2" />
          <button onClick={uploadFile} disabled={loading || !uploadForm.name} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-sm disabled:opacity-50">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>
      {result && <p className="text-green-400 text-sm mt-3">Success: {JSON.stringify(result)}</p>}
    </div>
  );
}
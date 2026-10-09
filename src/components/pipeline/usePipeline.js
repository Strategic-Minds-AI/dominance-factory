import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
const call = async payload => { const { data } = await base44.functions.invoke('programmaticPipeline', payload); if (data.error) throw new Error(data.error); return data; };
export default function usePipeline() {
  const qc = useQueryClient(); const [runId, setRunId] = useState(null); const [newRun, setNewRun] = useState(false); const [error, setError] = useState('');
  const detail = useQuery({ queryKey: ['pipeline', runId, newRun], queryFn: () => call({ action: 'get', run_id: runId }), enabled: !newRun, retry: false, refetchInterval: query => ['queued','running'].includes(query.state.data?.run?.status) ? 4000 : false });
  const history = useQuery({ queryKey: ['pipeline-history'], queryFn: () => call({ action: 'list' }), retry: false });
  const audit = useQuery({ queryKey: ['pipeline-audit'], queryFn: () => call({ action: 'audit' }), retry: false, staleTime: 60000 });
  const mutation = useMutation({ mutationFn: call, onSuccess: data => { setError(''); if (data.run) { setRunId(data.run.id); setNewRun(false); } qc.invalidateQueries({ queryKey: ['pipeline'] }); qc.invalidateQueries({ queryKey: ['pipeline-history'] }); }, onError: e => setError(e.response?.data?.error || e.message) });
  const run = newRun ? null : detail.data?.run; const artifacts = newRun ? [] : detail.data?.artifacts || [];
  return { run, artifacts, outputs: Object.fromEntries(artifacts.map(a => [a.step, JSON.parse(a.output)])), previews: newRun ? [] : detail.data?.previews || [], history: history.data?.items || [], audit: audit.data, loading: !newRun && detail.isPending, busy: mutation.isPending, error: error || detail.error?.response?.data?.error || detail.error?.message, act: (action, payload = {}) => mutation.mutateAsync({ action, run_id: run?.id, ...payload }).catch(() => null), startNew: () => { setNewRun(true); setError(''); }, openRun: id => { setRunId(id); setNewRun(false); setError(''); }, loadMore: async () => { const more = await call({ action: 'list', cursor: history.data?.next_cursor }); qc.setQueryData(['pipeline-history'], old => ({ ...more, items: [...(old?.items || []), ...more.items] })); }, hasMore: history.data?.has_more, retry: () => detail.refetch() };
}
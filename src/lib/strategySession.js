// Strategy Session — shared localStorage-based context that flows through
// Industry Intel → God Mode → Digital Dominance → Name & URL Generator

const KEY = 'strategy_session_v2';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function updateSession(data) {
  const current = getSession();
  const updated = { ...current, ...data, updated_at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(updated));
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('strategy-session-updated', { detail: updated }));
  return updated;
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('strategy-session-updated', { detail: {} }));
}

export function getSessionSummary() {
  const s = getSession();
  const steps = [];
  if (s.industry) steps.push({ step: 1, label: 'Industry Selected', value: s.industry, done: true });
  if (s.godModeStrategy) steps.push({ step: 2, label: 'God Mode Cracked', value: 'Algorithm strategy generated', done: true });
  if (s.digitalDominanceTargets) steps.push({ step: 3, label: 'Digital Dominance Mapped', value: `${s.digitalDominanceTargets?.length || 0} targets`, done: true });
  if (s.topUrls) steps.push({ step: 4, label: 'Names & URLs Generated', value: `${s.topUrls?.length || 0} candidates`, done: true });
  return steps;
}
export default async function handler(req, res) {
  const task = req.query.task || 'health';
  const cronUrl = 'https://build-scale-dominate.base44.app/functions/cronRunner';
  const packToken = process.env.PACK_SYNC_TOKEN;

  if (!packToken) {
    return res.status(500).json({ error: 'PACK_SYNC_TOKEN environment variable not set in Vercel project settings.' });
  }

  try {
    const response = await fetch(cronUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, token: packToken }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await response.json();
    res.status(200).json({ task, result: data, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ task, error: error.message });
  }
}
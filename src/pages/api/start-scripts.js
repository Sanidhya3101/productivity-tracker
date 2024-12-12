// pages/api/start-scripts.js or app/api/start-scripts/route.js (Next.js 13+)

import ScriptManager from '@/lib/ScriptManager.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await ScriptManager.startScripts();
      res.status(200).json({ message: 'Scripts started successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start scripts.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

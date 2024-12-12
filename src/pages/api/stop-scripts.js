import ScriptManager from '@/lib/ScriptManager.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await ScriptManager.stopScripts();
      res.status(200).json({ message: 'Scripts stopped successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop scripts.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

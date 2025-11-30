// pages/api/reports.js
import { add, all } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(all('reports'));
  }

  if (req.method === 'POST') {
    const { userAgent } = req.body || {};
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    if (!userAgent || typeof userAgent !== 'string') {
      return res.status(400).json({ error: 'User-Agent is required' });
    }

    const newReport = add('reports', { user_agent: userAgent, ip_address: ipAddress });
    return res.status(201).json(newReport);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

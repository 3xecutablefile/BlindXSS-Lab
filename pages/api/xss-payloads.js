// pages/api/xss-payloads.js
import { all } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(all('xss_payloads'));
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

// pages/api/collect-xss.js
import { add } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET' || req.method === 'POST') {
    const payloadData =
      Object.keys(req.query || {}).length > 0
        ? JSON.stringify(req.query)
        : Object.keys(req.body || {}).length > 0
        ? JSON.stringify(req.body)
        : 'No payload data';
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || req.headers['referrer'] || '';
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';

    add('xss_payloads', {
      payload: payloadData,
      referer,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    const gifBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.setHeader('Content-Type', 'image/gif');
    return res.send(gifBuffer);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

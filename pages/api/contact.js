// pages/api/contact.js
import { add, all } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(all('contact_messages'));
  }

  if (req.method === 'POST') {
    const { name, email, message } = req.body || {};
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    add('contact_messages', { name, email, message, user_agent: userAgent, ip_address: ipAddress });
    return res.status(201).json({ message: 'Contact message received' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

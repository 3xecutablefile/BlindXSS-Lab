// pages/api/comments.js
import { add, all } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(all('comments'));
  }

  if (req.method === 'POST') {
    const { name, comment } = req.body || {};

    if (!name || !comment) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    const newComment = add('comments', { name, comment });
    return res.status(201).json(newComment);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

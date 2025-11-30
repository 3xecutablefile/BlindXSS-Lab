// pages/api/bot.js
import { recentSince, all } from '../../lib/memory-store.js';

export default async function handler(req, res) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const rows = recentSince('reports', fiveMinutesAgo);

  let flagged = [];
  for (const row of rows) {
    const ua = row.user_agent || '';
    if (
      ua.toLowerCase().includes('<script') ||
      /\bonerror\b/i.test(ua) ||
      /\bjavascript:/i.test(ua) ||
      /alert\s*\(/i.test(ua)
    ) {
      flagged.push({
        id: row.id,
        ip: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at,
      });
    }
  }

  if (flagged.length) {
    console.log(`🚨 XSS payloads detected: ${flagged.length}`);
    flagged.forEach((r) => {
      console.log(`- Report ${r.id} from ${r.ip}`);
      console.log(`  Payload: ${r.user_agent}`);
    });
  } else {
    console.log('No XSS payloads detected in last 5 minutes.');
  }

  res.status(200).json({ checked: rows.length, totalReports: all('reports').length, flagged: flagged.length, flaggedReports: flagged });
}

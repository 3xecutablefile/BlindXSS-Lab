// pages/api/bot.js
import { recentSince, all } from '../../lib/memory-store.js';

const detectionRules = [
  {
    id: 'script-tag',
    severity: 'high',
    reason: 'Inline <script> tag detected',
    test: (ua) => /<script[^>]*>/i.test(ua),
  },
  {
    id: 'event-handler',
    severity: 'high',
    reason: 'Inline event handler attribute detected',
    test: (ua) => /on\w+\s*=\s*[^\s]/i.test(ua),
  },
  {
    id: 'javascript-protocol',
    severity: 'medium',
    reason: 'javascript: URL detected',
    test: (ua) => /\bjavascript:/i.test(ua),
  },
  {
    id: 'alert-call',
    severity: 'medium',
    reason: 'alert() invocation detected',
    test: (ua) => /alert\s*\(/i.test(ua),
  },
  {
    id: 'svg-payload',
    severity: 'high',
    reason: 'SVG payload detected',
    test: (ua) => /<svg[^>]*>/i.test(ua),
  },
  {
    id: 'img-onerror',
    severity: 'medium',
    reason: 'Image onerror handler detected',
    test: (ua) => /<img[^>]+onerror/i.test(ua),
  },
  {
    id: 'encoded-script',
    severity: 'medium',
    reason: 'Encoded script tag detected',
    test: (ua) => /(%3c|&#x3c;|&lt;)(script)/i.test(ua),
  },
];

function detectPayloads(userAgent) {
  const ua = userAgent || '';
  const lower = ua.toLowerCase();
  const detections = detectionRules.filter((rule) => rule.test(lower)).map((rule) => ({
    ruleId: rule.id,
    severity: rule.severity,
    reason: rule.reason,
  }));

  if (!detections.length && /<script/i.test(ua)) {
    detections.push({ ruleId: 'script-tag-generic', severity: 'medium', reason: 'Generic <script detected' });
  }

  const severityOrder = ['low', 'medium', 'high'];
  const severity = detections.reduce((current, next) => {
    if (!current) return next.severity;
    return severityOrder.indexOf(next.severity) > severityOrder.indexOf(current) ? next.severity : current;
  }, null);

  return { detections, severity };
}

export default async function handler(req, res) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const rows = recentSince('reports', fiveMinutesAgo);

  const flagged = [];
  for (const row of rows) {
    const { detections, severity } = detectPayloads(row.user_agent);
    if (detections.length) {
      flagged.push({
        id: row.id,
        ip: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at,
        detections,
        severity,
      });
    }
  }

  if (flagged.length) {
    console.log(`🚨 XSS payloads detected: ${flagged.length}`);
    flagged.forEach((r) => {
      console.log(`- Report ${r.id} from ${r.ip} [${r.severity || 'unknown'}]`);
      console.log(`  Payload: ${r.user_agent}`);
      r.detections.forEach((d) => console.log(`    • ${d.reason}`));
    });
  } else {
    console.log('No XSS payloads detected in last 5 minutes.');
  }

  res.status(200).json({ checked: rows.length, totalReports: all('reports').length, flagged: flagged.length, flaggedReports: flagged });
}

// scripts/bot.js
// Simple polling bot that pings the serverless /api/bot endpoint.
// Usage:
//   npm run bot                  # polls http://localhost:3000/api/bot every 3s
//   BOT_URL=https://yourapp.vercel.app/api/bot npm run bot
//   BOT_INTERVAL_MS=10000 npm run bot

const url = process.env.BOT_URL || 'http://localhost:3000/api/bot';
const interval = Number(process.env.BOT_INTERVAL_MS || 3000);

async function tick() {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BlindXSS-Lab-Bot/1.0' } });
    const status = res.status;
    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      body = await res.text();
    }
    const dt = Date.now() - t0;
    console.log(`[bot] ${new Date().toISOString()} status=${status} in ${dt}ms`);
    if (typeof body === 'object') {
      const { checked, totalReports, flagged } = body;
      console.log(`[bot] checked=${checked ?? 'n/a'} total=${totalReports ?? 'n/a'} flagged=${flagged ?? 'n/a'}`);
      if (body.flaggedReports?.length) {
        for (const r of body.flaggedReports) {
          console.log(`  - id=${r.id} ip=${r.ip} payload=${r.user_agent}`);
        }
      }
    } else {
      console.log(`[bot] body: ${String(body).slice(0, 200)}${String(body).length > 200 ? '…' : ''}`);
    }
  } catch (err) {
    console.error(`[bot] request failed:`, err?.message || err);
  }
}

console.log(`[bot] polling ${url} every ${interval}ms`);
tick();
setInterval(tick, interval);


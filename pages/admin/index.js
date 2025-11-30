import { useEffect, useState } from 'react';

const severityColor = {
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function AdminDashboard() {
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [checked, setChecked] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchFlagged() {
    try {
      setError('');
      const res = await fetch('/api/bot');
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setFlaggedReports(data.flaggedReports || []);
      setChecked(data.checked || 0);
      setTotalReports(data.totalReports || 0);
    } catch (err) {
      setError('Unable to load flagged reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFlagged();
    const interval = setInterval(fetchFlagged, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Admin Bot Dashboard</h1>
      <p style={{ color: '#4b5563' }}>
        Recent reports scanned in the last 5 minutes. Refreshes every 5 seconds to mimic the polling bot.
      </p>

      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <StatCard label="Reports checked" value={checked} />
        <StatCard label="Total reports (in memory)" value={totalReports} />
        <StatCard label="Flagged" value={flaggedReports.length} highlight />
      </div>

      {loading && <p>Loading flagged reports…</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !flaggedReports.length && <p>No suspicious payloads detected in the last window.</p>}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {flaggedReports.map((report) => (
          <div key={report.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Report #{report.id}</strong>
                <div style={{ color: '#6b7280' }}>
                  IP: {report.ip || 'unknown'} · {new Date(report.created_at).toLocaleString()}
                </div>
              </div>
              <SeverityPill severity={report.severity} />
            </div>

            <pre
              style={{
                background: '#0f172a',
                color: '#e5e7eb',
                padding: '0.75rem',
                borderRadius: 8,
                overflowX: 'auto',
                marginTop: '0.75rem',
              }}
            >
              {report.user_agent}
            </pre>

            {report.detections?.length ? (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontWeight: 600 }}>Detections</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#111827' }}>
                  {report.detections.map((detection, idx) => (
                    <li key={`${report.id}-${idx}`}>
                      <strong>{detection.ruleId}</strong>: {detection.reason} ({detection.severity})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '1rem',
        flex: 1,
        background: highlight ? '#fef3c7' : '#fff',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SeverityPill({ severity }) {
  if (!severity) return null;
  return (
    <span
      style={{
        background: severityColor[severity] || '#d1d5db',
        color: '#111827',
        padding: '0.35rem 0.75rem',
        borderRadius: 999,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {severity}
    </span>
  );
}

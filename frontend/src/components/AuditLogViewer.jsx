import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../services/api';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = () => {
    setLoading(true);
    fetchAuditLogs()
      .then(data => setLogs(data.logs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            Audit Trail & Evaluation Ledger
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time verification log from Java backend persistent storage (<code>data/audit_logs.txt</code>)
          </p>
        </div>
        <button className="btn-secondary" onClick={loadLogs} disabled={loading}>
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      <pre className="log-stream">
        {logs.length > 0 ? logs.join('\n') : 'No audit entries recorded yet.'}
      </pre>
    </div>
  );
}

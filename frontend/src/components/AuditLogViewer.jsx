import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../services/api';
import { FileText, RotateCw } from 'lucide-react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = () => {
    setLoading(true);
    fetchAuditLogs()
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flat-card">
      <div className="card-title-bar">
        <div>
          <h3>
            <FileText size={20} color="#3b82f6" />
            Audit Trail & Evaluation Ledger
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>
            Real-time verification log from Java backend persistent storage (<code>data/audit_logs.txt</code>)
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadLogs} disabled={loading}>
          <RotateCw size={16} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      <pre
        style={{
          backgroundColor: '#111827',
          color: '#34d399',
          fontFamily: 'Consolas, monospace',
          fontSize: '0.82rem',
          padding: '16px',
          borderRadius: '6px',
          border: '2px solid #1f2937',
          maxHeight: '450px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5'
        }}
      >
        {logs.length > 0 ? logs.join('\n') : 'No audit entries recorded yet.'}
      </pre>
    </div>
  );
}

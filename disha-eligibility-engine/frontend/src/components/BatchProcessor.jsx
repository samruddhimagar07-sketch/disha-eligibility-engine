import React, { useState } from 'react';
import { runBatchEvaluation } from '../services/api';

export default function BatchProcessor() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runBatchEvaluation();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            Multithreaded Batch Evaluation Engine
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Evaluates student datasets concurrently using Java ExecutorService worker thread pool.
          </p>
        </div>
        <button className="btn-secondary" onClick={handleRunBatch} disabled={loading}>
          <svg className="icon" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {loading ? 'Evaluating...' : 'Trigger Parallel Run'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {report && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="metric-pill" style={{ background: '#f1f5f9', border: '1px solid var(--border-glass)' }}>
            <span>Students: <strong>{report.totalStudents}</strong></span>
          </div>
          <div className="metric-pill" style={{ background: '#f1f5f9', border: '1px solid var(--border-glass)' }}>
            <span>Evaluations: <strong>{report.totalEvaluated}</strong></span>
          </div>
          <div className="metric-pill" style={{ background: '#f1f5f9', border: '1px solid var(--border-glass)' }}>
            <span>Duration: <strong>{report.durationMillis} ms</strong></span>
          </div>
          <div className="metric-pill" style={{ background: '#f1f5f9', border: '1px solid var(--border-glass)' }}>
            <span>Workers: <strong>{report.threadsUsed} Threads</strong></span>
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Active Backlogs</th>
              <th>Eligible Count</th>
              <th>Shortfall Count</th>
            </tr>
          </thead>
          <tbody>
            {!report ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-subtle)' }}>
                  Click 'Trigger Parallel Run' to execute multithreaded evaluation against <code>data/students_sample.csv</code>.
                </td>
              </tr>
            ) : (
              report.students.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.branch}</td>
                  <td>Year {s.year}</td>
                  <td><strong>{s.cgpa.toFixed(2)}</strong></td>
                  <td>{s.activeBacklogs}</td>
                  <td><span className="badge-tag badge-eligible">{s.eligibleCount} Eligible</span></td>
                  <td><span className="badge-tag badge-shortfall">{s.shortfallCount} Shortfall</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

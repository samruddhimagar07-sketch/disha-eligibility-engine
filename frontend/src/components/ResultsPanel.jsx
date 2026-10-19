import React from 'react';

export default function ResultsPanel({ data }) {
  if (!data) return null;
  const { student, results, summary } = data;

  const eligibleList = results.filter(r => r.isEligible);
  const shortfallList = results.filter(r => !r.isEligible);

  return (
    <main className="results-container">
      {/* Student Profile Summary Strip */}
      <div className="glass-panel student-summary-strip">
        <div className="student-title-block">
          <h2>{student.name}</h2>
          <div className="student-subtitle">
            {student.branchDisplay} &bull; Year {student.currentYear} &bull; CGPA {student.cgpa.toFixed(2)} ({student.approxPercentage}%) &bull; {student.activeBacklogs} Active Backlog(s)
          </div>
        </div>
        <div className="stats-badges">
          <div className="metric-pill eligible">
            <span>{summary.eligibleCount}</span> Pathways Eligible
          </div>
          <div className="metric-pill shortfall">
            <span>{summary.shortfallCount}</span> Shortfalls Identified
          </div>
        </div>
      </div>

      {/* Eligible Pathways */}
      <section className="glass-panel pathway-section">
        <div className="section-title">
          <span style={{ color: '#166534' }}>Eligible Career Pathways</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-subtle)' }}>
            {eligibleList.length} of {results.length} qualified
          </span>
        </div>
        <div className="pathway-cards-grid">
          {eligibleList.length === 0 ? (
            <div style={{
              gridColumn: '1/-1',
              padding: '18px',
              textAlign: 'center',
              color: 'var(--text-subtle)',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px dashed var(--border-glass)'
            }}>
              No direct pathways currently available for current academic status. Review shortfall actions below.
            </div>
          ) : (
            eligibleList.map(item => (
              <div key={item.examCode} className="pathway-card is-eligible">
                <div>
                  <div className="card-header">
                    <span className="exam-code">{item.examCode}</span>
                    <span className="badge-tag badge-eligible">Eligible</span>
                  </div>
                  <h3 className="exam-title">{item.examName}</h3>
                  <div className="exam-meta">
                    Cutoff: <strong>{item.minCgpaCutoff.toFixed(2)}</strong> &bull; Student: <strong>{item.studentCgpa.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="advice-box">
                  <svg className="icon" style={{ color: '#10b981', marginRight: '4px' }} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item.primaryAdvice}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Shortfalls Identified */}
      <section className="glass-panel pathway-section">
        <div className="section-title">
          <span style={{ color: '#92400e' }}>Restricted Pathways & Actionable Shortfalls</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-subtle)' }}>
            {shortfallList.length} requiring remediation
          </span>
        </div>
        <div className="pathway-cards-grid">
          {shortfallList.length === 0 ? (
            <div style={{
              gridColumn: '1/-1',
              padding: '18px',
              textAlign: 'center',
              color: 'var(--text-subtle)',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px dashed var(--border-glass)'
            }}>
              Candidate satisfies all registered pathways without shortfalls.
            </div>
          ) : (
            shortfallList.map(item => (
              <div key={item.examCode} className="pathway-card is-shortfall">
                <div>
                  <div className="card-header">
                    <span className="exam-code">{item.examCode}</span>
                    <span className="badge-tag badge-shortfall">
                      {item.shortfalls.length} Shortfall{item.shortfalls.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="exam-title">{item.examName}</h3>
                  <div className="exam-meta">
                    Cutoff: <strong>{item.minCgpaCutoff.toFixed(2)}</strong> &bull; Student: <strong>{item.studentCgpa.toFixed(2)}</strong>
                  </div>

                  <ul className="shortfall-list">
                    {item.shortfalls.map((sf, idx) => (
                      <li key={idx} className="shortfall-item">
                        <div className="shortfall-param">
                          <span>{sf.parameter}</span>
                          <span style={{ fontWeight: 'normal', color: 'var(--text-subtle)' }}>
                            Actual: {sf.actualValue}
                          </span>
                        </div>
                        <div className="shortfall-val">Requires: {sf.requiredCriteria}</div>
                        <div className="shortfall-action">&rarr; {sf.actionableAdvice}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="advice-box" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
                  {item.primaryAdvice}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { fetchExams } from '../services/api';

export default function ExamCatalog() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExams()
      .then(data => setExams(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = exams.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase()) ||
    e.categoryTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            Registered Competitive Pathways Catalog
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Dynamic rule registry with cutoffs, backlog allowances, and age boundaries.
          </p>
        </div>
        <input
          type="text"
          placeholder="Filter exams..."
          className="form-input"
          style={{ width: '240px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Exam Name</th>
              <th>Category</th>
              <th>Conducting Body</th>
              <th>Min Year</th>
              <th>Min CGPA</th>
              <th>Max Age</th>
              <th>Max Backlogs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading registered pathways...</td></tr>
            ) : filteredExams.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No pathways match your search.</td></tr>
            ) : (
              filteredExams.map(e => (
                <tr key={e.code}>
                  <td><span className="exam-code">{e.code}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{e.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{e.description}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {e.categoryTitle}
                    </span>
                  </td>
                  <td>{e.conductingBody}</td>
                  <td>Year {e.minEligibleYear}+</td>
                  <td>{e.baseMinCgpa.toFixed(2)}</td>
                  <td>{e.baseMaxAge} yrs</td>
                  <td>{e.maxAllowedBacklogs}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

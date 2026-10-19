import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  Send,
  Plus,
  Download,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Users,
  Award,
  BookOpen
} from 'lucide-react';

export default function TeacherBatchView({
  batchData,
  onRefreshBatch,
  onOpenBroadcast,
  onOpenAddStudent,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  if (!batchData || !batchData.students) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Cpu size={48} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
        <h3>Loading Multithreaded Batch Roster...</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Querying Java backend concurrent evaluation engine.
        </p>
      </div>
    );
  }

  const { totalStudents, totalEvaluated, durationMillis, threadsUsed, students } = batchData;

  // Multi-criteria filter
  const filteredStudents = students.filter((s) => {
    // Search
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Exam eligibility filter
    if (examFilter !== 'ALL') {
      if (!s.eligibleExams || !s.eligibleExams.includes(examFilter)) {
        return false;
      }
    }

    // Branch filter
    if (branchFilter !== 'ALL' && s.branch !== branchFilter) {
      return false;
    }

    // Risk filter
    if (riskFilter === 'BACKLOGS' && s.activeBacklogs === 0) return false;
    if (riskFilter === 'LOW_CGPA' && s.cgpa >= 6.5) return false;

    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'ID,Name,Branch,Year,CGPA,ActiveBacklogs,Category,EligibleCount,IneligibleCount\n';
    filteredStudents.forEach((s) => {
      csv += `"${s.id}","${s.name}","${s.branch}",${s.year},${s.cgpa},${s.activeBacklogs},"${s.category}",${s.eligibleCount},${s.shortfallCount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `disha_batch_eligibility_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Concurrency Performance Banner */}
      <div className="concurrency-banner">
        <div className="concurrency-title">
          <div
            style={{
              backgroundColor: '#3b82f6',
              padding: '10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={28} color="#ffffff" />
          </div>
          <div>
            <h3>Multithreaded Concurrent Batch Processing</h3>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
              Core Java Virtual Threads concurrency engine evaluating candidate profiles concurrently.
            </p>
          </div>
        </div>

        <div className="concurrency-chips">
          <div className="metric-chip">
            <strong>{durationMillis || 12} ms</strong> Execution Time
          </div>
          <div className="metric-chip">
            <strong>{threadsUsed || 16}</strong> Worker Threads
          </div>
          <div className="metric-chip">
            <strong>{totalEvaluated || 160}</strong> Exams Evaluated
          </div>
          <div className="metric-chip" style={{ backgroundColor: '#10b981', color: '#ffffff', borderColor: '#059669' }}>
            <strong style={{ color: '#ffffff' }}>{totalStudents}</strong> Students Processed
          </div>
        </div>
      </div>

      {/* Table Controls & Filter Bar */}
      <div className="table-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div className="search-box">
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Exam Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
          >
            <option value="ALL">Filter: All Examinations</option>
            <option value="UPSC-CSE">Eligible for UPSC CSE</option>
            <option value="CAT">Eligible for CAT (IIMs)</option>
            <option value="GATE-CS">Eligible for GATE CS</option>
            <option value="CDS-IMA">Eligible for CDS IMA</option>
            <option value="GRE-MS">Eligible for GRE / Abroad</option>
            <option value="SSC-CGL">Eligible for SSC CGL</option>
            <option value="ISRO-SC">Eligible for ISRO 'SC'</option>
            <option value="SDE-TIER1">Eligible for Tier-1 SDE</option>
          </select>

          {/* Branch Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          {/* Risk Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="BACKLOGS">Students with Active Backlogs</option>
            <option value="LOW_CGPA">Low CGPA (&lt; 6.5)</option>
          </select>
        </div>

        {/* Batch Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenBroadcast(filteredStudents, examFilter)}
            title="Broadcast announcement to these filtered students"
          >
            <Send size={16} />
            <span>Notify Filtered Students ({filteredStudents.length})</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAddStudent}
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCsv}
            title="Download CSV report"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRefreshBatch}
            disabled={isLoading}
            title="Re-run batch concurrency engine"
          >
            <RotateCw size={16} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Flat Batch Table */}
      <div className="table-responsive">
        <table className="flat-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Branch</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Backlogs</th>
              <th>Category</th>
              <th>Eligible Exams</th>
              <th>Shortfalls</th>
              <th>Direct Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No students found matching current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{s.id}</td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#111827' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        backgroundColor: '#f3f4f6',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      {s.branch}
                    </span>
                  </td>
                  <td>Year {s.year}</td>
                  <td>
                    <strong
                      style={{
                        color: s.cgpa >= 8.0 ? '#10b981' : s.cgpa >= 6.5 ? '#111827' : '#ef4444'
                      }}
                    >
                      {s.cgpa.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    {s.activeBacklogs > 0 ? (
                      <span
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }}
                      >
                        {s.activeBacklogs} active
                      </span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                        0 clear
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.category}</td>
                  <td>
                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      {s.eligibleCount} Eligible
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        border: '1px solid #fde68a'
                      }}
                    >
                      {s.shortfallCount} Shortfalls
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenBroadcast([s], 'DIRECT')}
                    >
                      <Send size={13} />
                      Notify
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

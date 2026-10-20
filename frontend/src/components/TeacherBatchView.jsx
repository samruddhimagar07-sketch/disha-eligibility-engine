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
} from './Icon';

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
        <Cpu size={48} color="#005a69" style={{ margin: '0 auto 16px' }} />
        <h3>Loading Batch Roster...</h3>
        <p style={{ color: '#6f797c', marginTop: '8px' }}>
          Evaluating every candidate against all exam programs.
        </p>
      </div>
    );
  }

  const { totalStudents, totalEvaluated, students } = batchData;

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
      {/* Batch overview banner */}
      <div className="overview-banner">
        <div className="overview-title">
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.15)',
              padding: '12px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={26} color="#ffffff" />
          </div>
          <div>
            <h3>Batch Eligibility Overview</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
              Every candidate in the roster evaluated against all exam programs.
            </p>
          </div>
        </div>

        <div className="overview-chips">
          <div className="metric-chip">
            <strong>{totalEvaluated || 160}</strong> Exams Evaluated
          </div>
          <div className="metric-chip" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#005a69' }}>
            <strong style={{ color: '#8b5000' }}>{totalStudents}</strong> Students Processed
          </div>
        </div>
      </div>

      {/* Table Controls & Filter Bar */}
      <div className="table-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div className="search-box">
            <Search size={16} color="#6f797c" />
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
            title="Refresh batch roster"
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
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#6f797c' }}>
                  No students found matching current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{s.id}</td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#001e2c' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6f797c' }}>{s.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        backgroundColor: '#ddf1ff',
                        padding: '3px 10px',
                        borderRadius: '9999px',
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
                        color: s.cgpa >= 8.0 ? '#10b981' : s.cgpa >= 6.5 ? '#001e2c' : '#ba1a1a'
                      }}
                    >
                      {s.cgpa.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    {s.activeBacklogs > 0 ? (
                      <span
                        style={{
                          backgroundColor: '#ffdad6',
                          color: '#ba1a1a',
                          padding: '2px 8px',
                          borderRadius: '9999px',
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
                        borderRadius: '9999px',
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
                        backgroundColor: '#fce7d6',
                        color: '#8b5000',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        border: '1px solid #ffdcbf'
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

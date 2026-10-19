import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  Shield,
  Briefcase,
  Compass,
  Building2,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

export default function StudentResultsPanel({ evaluationData, onSelectPathway }) {
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!evaluationData || !evaluationData.results) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Compass size={48} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
        <h3>Submit Your Profile to Generate Eligibility</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          The Core Java engine will evaluate your CGPA, year, backlogs, and category against national benchmarks.
        </p>
      </div>
    );
  }

  const { student, results, summary } = evaluationData;

  // Filter logic
  const filteredResults = results.filter((r) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'ELIGIBLE') return r.isEligible;
    if (filterCategory === 'SHORTFALL') return !r.isEligible;
    return r.examCategory === filterCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'CIVIL_SERVICES':
        return <Award size={22} color="#ffffff" />;
      case 'MANAGEMENT':
        return <Briefcase size={22} color="#ffffff" />;
      case 'DEFENCE':
        return <Shield size={22} color="#ffffff" />;
      case 'TECHNICAL':
        return <BookOpen size={22} color="#ffffff" />;
      case 'HIGHER_STUDIES_ABROAD':
        return <Globe size={22} color="#ffffff" />;
      case 'GOVERNMENT_BANKING':
        return <Building2 size={22} color="#ffffff" />;
      default:
        return <Compass size={22} color="#ffffff" />;
    }
  };

  const getCategoryBgColor = (category) => {
    switch (category) {
      case 'CIVIL_SERVICES':
        return '#f59e0b'; // Amber
      case 'MANAGEMENT':
        return '#3b82f6'; // Blue
      case 'DEFENCE':
        return '#10b981'; // Emerald
      case 'TECHNICAL':
        return '#8b5cf6'; // Purple
      case 'HIGHER_STUDIES_ABROAD':
        return '#0284c7'; // Sky
      case 'GOVERNMENT_BANKING':
        return '#ea580c'; // Orange
      default:
        return '#111827';
    }
  };

  return (
    <div>
      {/* Summary Color Block Banner */}
      <div className="summary-banner">
        <div className="stat-block" style={{ backgroundColor: '#ffffff' }}>
          <div className="stat-label">Total Benchmarked</div>
          <div className="stat-number" style={{ color: '#111827' }}>
            {summary.totalExams}
          </div>
          <div className="stat-sub" style={{ color: '#6b7280' }}>
            National Exams & Drives
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#ecfdf5', borderColor: '#10b981' }}>
          <div className="stat-label" style={{ color: '#047857' }}>
            Eligible Today
          </div>
          <div className="stat-number" style={{ color: '#10b981' }}>
            {summary.eligibleCount}
          </div>
          <div className="stat-sub" style={{ color: '#047857' }}>
            Ready for Immediate Prep
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b' }}>
          <div className="stat-label" style={{ color: '#b45309' }}>
            Action Required
          </div>
          <div className="stat-number" style={{ color: '#f59e0b' }}>
            {summary.shortfallCount}
          </div>
          <div className="stat-sub" style={{ color: '#b45309' }}>
            Remediable via Guidance
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
          <div className="stat-label" style={{ color: '#1d4ed8' }}>
            Academic Profile
          </div>
          <div className="stat-number" style={{ fontSize: '1.4rem', color: '#1e40af' }}>
            CGPA {student.cgpa}
          </div>
          <div className="stat-sub" style={{ color: '#1d4ed8' }}>
            {student.categoryLabel} • {student.activeBacklogs} Backlogs
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="filter-tabs-bar">
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterCategory('ALL')}
        >
          All Exams ({results.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'ELIGIBLE' ? 'active' : ''}`}
          onClick={() => setFilterCategory('ELIGIBLE')}
          style={{ borderColor: '#10b981' }}
        >
          Eligible ({summary.eligibleCount})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'SHORTFALL' ? 'active' : ''}`}
          onClick={() => setFilterCategory('SHORTFALL')}
          style={{ borderColor: '#f59e0b' }}
        >
          Action Required ({summary.shortfallCount})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'CIVIL_SERVICES' ? 'active' : ''}`}
          onClick={() => setFilterCategory('CIVIL_SERVICES')}
        >
          Civil Services (UPSC)
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'MANAGEMENT' ? 'active' : ''}`}
          onClick={() => setFilterCategory('MANAGEMENT')}
        >
          Management (CAT/XAT)
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'DEFENCE' ? 'active' : ''}`}
          onClick={() => setFilterCategory('DEFENCE')}
        >
          Defence (CDS/AFCAT)
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'TECHNICAL' ? 'active' : ''}`}
          onClick={() => setFilterCategory('TECHNICAL')}
        >
          Technical & PSU
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'HIGHER_STUDIES_ABROAD' ? 'active' : ''}`}
          onClick={() => setFilterCategory('HIGHER_STUDIES_ABROAD')}
        >
          Higher Studies Abroad
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'GOVERNMENT_BANKING' ? 'active' : ''}`}
          onClick={() => setFilterCategory('GOVERNMENT_BANKING')}
        >
          Govt & Banking (SSC/IBPS)
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="exam-cards-grid">
        {filteredResults.map((exam) => (
          <div
            key={exam.examCode}
            className={`exam-card ${exam.isEligible ? 'flat-card-tint-green' : ''}`}
          >
            <div>
              {/* Card Header */}
              <div className="exam-card-header">
                <div
                  className="exam-icon-circle"
                  style={{ backgroundColor: getCategoryBgColor(exam.examCategory) }}
                >
                  {getCategoryIcon(exam.examCategory)}
                </div>
                <div className="exam-title-area">
                  <div className="exam-badge-category">{exam.examCategory.replace(/_/g, ' ')}</div>
                  <h4 className="exam-name">{exam.examName}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                    Code: {exam.examCode}
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ marginBottom: '12px' }}>
                {exam.isEligible ? (
                  <span className="status-pill eligible">
                    <CheckCircle2 size={14} />
                    Eligible
                  </span>
                ) : (
                  <span className="status-pill shortfall">
                    <AlertTriangle size={14} />
                    Criteria Action Required
                  </span>
                )}
              </div>

              {/* Criteria Snapshot */}
              <div className="card-criteria-box">
                <div className="criteria-item">
                  <strong>Min Cutoff</strong>
                  <span>{exam.minCgpaCutoff} CGPA</span>
                </div>
                <div className="criteria-item">
                  <strong>Your CGPA</strong>
                  <span
                    style={{
                      fontWeight: 800,
                      color: student.cgpa >= exam.minCgpaCutoff ? '#10b981' : '#ef4444'
                    }}
                  >
                    {student.cgpa}
                  </span>
                </div>
              </div>

              {/* Shortfalls Display */}
              {!exam.isEligible && exam.shortfalls && exam.shortfalls.length > 0 && (
                <div className="shortfalls-box">
                  <div className="shortfalls-title">
                    <AlertTriangle size={14} />
                    Unmet Criteria ({exam.shortfalls.length})
                  </div>
                  {exam.shortfalls.map((s, idx) => (
                    <div key={idx} className="shortfall-item">
                      <div style={{ fontWeight: 800, color: '#991b1b' }}>{s.parameter}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                        Required: <strong>{s.requiredCriteria}</strong> | Current:{' '}
                        <strong>{s.actualValue}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '2px' }}>
                        💡 {s.actionableAdvice}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Primary Positive Advice */}
              {exam.isEligible && exam.primaryAdvice && (
                <p className="advice-text" style={{ color: '#065f46' }}>
                  ✓ {exam.primaryAdvice}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.88rem' }}
                onClick={() => onSelectPathway(exam.examCode)}
              >
                <BookOpen size={16} />
                <span>Suggested Preparation Pathway</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

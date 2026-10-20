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
} from './Icon';

export default function StudentResultsPanel({ evaluationData, onSelectPathway }) {
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!evaluationData || !evaluationData.results) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Compass size={48} color="#005a69" style={{ margin: '0 auto 16px' }} />
        <h3>Submit Your Profile to Generate Eligibility</h3>
        <p style={{ color: '#6f797c', marginTop: '8px' }}>
          Your CGPA, year, backlogs, stream and category will be checked against national eligibility benchmarks.
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
        return '#8b5000'; // Secondary
      case 'MANAGEMENT':
        return '#005a69'; // Primary
      case 'DEFENCE':
        return '#1e7385'; // Primary container
      case 'TECHNICAL':
        return '#5d4f42'; // Tertiary
      case 'HIGHER_STUDIES_ABROAD':
        return '#2a7b8e'; // Teal
      case 'GOVERNMENT_BANKING':
        return '#b36a00'; // Amber
      default:
        return '#173342';
    }
  };

  return (
    <div>
      {/* Section heading (summary figures live in the dashboard overview above) */}
      <div className="mb-space-md flex flex-wrap items-end justify-between gap-space-sm">
        <div>
          <span className="text-label-md uppercase tracking-widest text-outline">Eligibility Matrix</span>
          <h3 className="text-headline-md font-semibold text-on-surface">
            {summary.eligibleCount} of {summary.totalExams} programs open for {student.name || 'you'}
          </h3>
        </div>
        <span className="rounded-full bg-surface-container-low px-space-md py-space-xs text-label-md text-on-surface-variant">
          CGPA {student.cgpa} • {student.categoryLabel} • {student.activeBacklogs} Backlogs
        </span>
      </div>
      {evaluationData.hiddenCount > 0 && (
        <p className="mb-space-md text-body-sm text-outline">
          Showing programs open to your stream ({student.branchDisplay || student.branch}). {evaluationData.hiddenCount}{' '}
          {evaluationData.hiddenCount === 1 ? 'exam' : 'exams'} meant for other streams {evaluationData.hiddenCount === 1 ? 'is' : 'are'} hidden.
        </p>
      )}

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
          
        >
          Eligible ({summary.eligibleCount})
        </button>
        <button
          type="button"
          className={`filter-chip ${filterCategory === 'SHORTFALL' ? 'active' : ''}`}
          onClick={() => setFilterCategory('SHORTFALL')}
          
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
                  <div style={{ fontSize: '0.75rem', color: '#6f797c', fontWeight: 600 }}>
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
                      color: student.cgpa >= exam.minCgpaCutoff ? '#10b981' : '#ba1a1a'
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
                      <div style={{ fontWeight: 800, color: '#93000a' }}>{s.parameter}</div>
                      <div style={{ fontSize: '0.78rem', color: '#3f484b' }}>
                        Required: <strong>{s.requiredCriteria}</strong> | Current:{' '}
                        <strong>{s.actualValue}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#173342', marginTop: '2px' }}>
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
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #bec8cb' }}>
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

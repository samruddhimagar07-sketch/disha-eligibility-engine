import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Award, Users, BookOpen } from 'lucide-react';

export default function TeacherAnalyticsView({ batchData }) {
  if (!batchData || !batchData.students) {
    return null;
  }

  const { students } = batchData;
  const total = students.length;

  const avgCgpa = (students.reduce((sum, s) => sum + s.cgpa, 0) / total).toFixed(2);
  const studentsWithBacklogs = students.filter((s) => s.activeBacklogs > 0);
  const highPerformers = students.filter((s) => s.cgpa >= 8.5);

  // Calculate exam readiness
  const examStats = [
    {
      code: 'CAT',
      name: 'Common Admission Test (IIMs)',
      category: 'Management',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('CAT')).length
    },
    {
      code: 'UPSC-CSE',
      name: 'UPSC Civil Services Examination',
      category: 'Civil Services',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('UPSC-CSE')).length
    },
    {
      code: 'GATE-CS',
      name: 'GATE Computer Science & IT',
      category: 'Technical',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('GATE-CS')).length
    },
    {
      code: 'CDS-IMA',
      name: 'Combined Defence Services (IMA)',
      category: 'Defence',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('CDS-IMA')).length
    },
    {
      code: 'GRE-MS',
      name: 'GRE & Global MS Abroad',
      category: 'Higher Studies',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('GRE-MS')).length
    },
    {
      code: 'SSC-CGL',
      name: 'SSC Combined Graduate Level',
      category: 'Government',
      eligibleCount: students.filter((s) => s.eligibleExams && s.eligibleExams.includes('SSC-CGL')).length
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Stat Cards */}
      <div className="summary-banner" style={{ marginBottom: '24px' }}>
        <div className="stat-block" style={{ backgroundColor: '#ffffff' }}>
          <div className="stat-label">Batch Size</div>
          <div className="stat-number">{total}</div>
          <div className="stat-sub" style={{ color: '#6b7280' }}>
            Enrolled Candidates
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
          <div className="stat-label" style={{ color: '#1d4ed8' }}>
            Batch Average CGPA
          </div>
          <div className="stat-number" style={{ color: '#2563eb' }}>
            {avgCgpa}
          </div>
          <div className="stat-sub" style={{ color: '#1d4ed8' }}>
            Across all engineering streams
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#ecfdf5', borderColor: '#10b981' }}>
          <div className="stat-label" style={{ color: '#047857' }}>
            Distinction Cohort (≥ 8.5)
          </div>
          <div className="stat-number" style={{ color: '#10b981' }}>
            {highPerformers.length}
          </div>
          <div className="stat-sub" style={{ color: '#047857' }}>
            {Math.round((highPerformers.length / total) * 100)}% of total batch
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b' }}>
          <div className="stat-label" style={{ color: '#b45309' }}>
            Active Arrears Risk
          </div>
          <div className="stat-number" style={{ color: '#f59e0b' }}>
            {studentsWithBacklogs.length}
          </div>
          <div className="stat-sub" style={{ color: '#b45309' }}>
            Candidates need remedial help
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Exam Readiness Breakdown */}
        <div className="flat-card">
          <div className="card-title-bar">
            <h3>
              <TrendingUp size={20} color="#3b82f6" />
              Batch Competitive Exam Readiness
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b7280' }}>
              % OF BATCH ELIGIBLE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {examStats.map((e) => {
              const pct = Math.round((e.eligibleCount / total) * 100);
              return (
                <div key={e.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      {e.name} ({e.code})
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      {e.eligibleCount} / {total} ({pct}%)
                    </span>
                  </div>
                  {/* Flat progress bar */}
                  <div
                    style={{
                      height: '14px',
                      backgroundColor: '#f3f4f6',
                      border: '2px solid #111827',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 60 ? '#10b981' : pct >= 40 ? '#3b82f6' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remedial Attention Watchlist */}
        <div className="flat-card">
          <div className="card-title-bar">
            <h3 style={{ color: '#b45309' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              Arrears & Remedial Watchlist
            </h3>
            <span
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.75rem'
              }}
            >
              {studentsWithBacklogs.length} Students
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '14px' }}>
            These students are barred from strict recruitment drives (PSUs, CDS, Global Admissions) until active arrears are cleared.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studentsWithBacklogs.map((s) => (
              <div
                key={s.id}
                style={{
                  backgroundColor: '#fffbeb',
                  border: '2px solid #fde68a',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {s.branch} • Year {s.year} • CGPA {s.cgpa}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {s.activeBacklogs} Backlogs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

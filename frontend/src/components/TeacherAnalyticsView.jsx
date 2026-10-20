import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Award, Users, BookOpen } from './Icon';

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
    <div className="w-full">
      {/* Top Stat Cards */}
      <div className="summary-banner mb-space-lg">
        <div className="stat-block ring-1 ring-outline-variant/40" style={{ backgroundColor: '#ffffff' }}>
          <div className="stat-label">Batch Size</div>
          <div className="stat-number">{total}</div>
          <div className="stat-sub" style={{ color: '#6f797c' }}>
            Enrolled Candidates
          </div>
        </div>

        <div className="stat-block" style={{ backgroundColor: '#e9f5ff', borderColor: '#005a69' }}>
          <div className="stat-label" style={{ color: '#005a69' }}>
            Batch Average CGPA
          </div>
          <div className="stat-number" style={{ color: '#005a69' }}>
            {avgCgpa}
          </div>
          <div className="stat-sub" style={{ color: '#005a69' }}>
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

        <div className="stat-block" style={{ backgroundColor: '#fce7d6', borderColor: '#fea443' }}>
          <div className="stat-label" style={{ color: '#8b5000' }}>
            Active Arrears Risk
          </div>
          <div className="stat-number" style={{ color: '#8b5000' }}>
            {studentsWithBacklogs.length}
          </div>
          <div className="stat-sub" style={{ color: '#8b5000' }}>
            Candidates need remedial help
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-[1.2fr_1fr]">
        {/* Exam Readiness Breakdown */}
        <div className="flat-card">
          <div className="card-title-bar">
            <h3>
              <TrendingUp size={20} color="#005a69" />
              Batch Competitive Exam Readiness
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6f797c' }}>
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
                      height: '12px',
                      backgroundColor: '#d0ecff',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 60 ? '#1e7385' : pct >= 40 ? '#005a69' : '#fea443'
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
            <h3 style={{ color: '#8b5000' }}>
              <AlertTriangle size={20} color="#fea443" />
              Arrears & Remedial Watchlist
            </h3>
            <span
              style={{
                backgroundColor: '#ffdad6',
                color: '#ba1a1a',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '0.75rem'
              }}
            >
              {studentsWithBacklogs.length} Students
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6f797c', marginBottom: '14px' }}>
            These students are barred from strict recruitment drives (PSUs, CDS, Global Admissions) until active arrears are cleared.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studentsWithBacklogs.map((s) => (
              <div
                key={s.id}
                style={{
                  backgroundColor: '#fce7d6',
                  border: '1px solid #ffdcbf',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6f797c' }}>
                    {s.branch} • Year {s.year} • CGPA {s.cgpa}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      backgroundColor: '#ba1a1a',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px'
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

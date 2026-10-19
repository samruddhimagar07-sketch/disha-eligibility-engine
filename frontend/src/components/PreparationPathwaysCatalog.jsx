import React, { useState } from 'react';
import { BookOpen, Award, Compass, Briefcase, Shield, Globe, Building2, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PreparationPathwaysCatalog({ pathwaysData, onOpenPathwayModal }) {
  const [selectedExam, setSelectedExam] = useState('UPSC-CSE');

  if (!pathwaysData) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <BookOpen size={48} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
        <h3>Loading Preparation Pathways...</h3>
      </div>
    );
  }

  const examKeys = Object.keys(pathwaysData);
  const currentPathway = pathwaysData[selectedExam] || pathwaysData[examKeys[0]];

  return (
    <div>
      {/* Intro Color Block */}
      <div
        className="flat-card"
        style={{
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: '#3b82f6', padding: '8px', borderRadius: '6px' }}>
            <Compass size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e40af' }}>
              Suggested Pathways & Roadmaps for Higher Studies & Exams
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#1e3a8a' }}>
              Phase-by-phase preparation strategies, standard reference books, milestone checklists, and study schedules curated for university students.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Exam Pathway Nav */}
        <div className="flat-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', marginBottom: '12px' }}>
            Select Examination Roadmap
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {examKeys.map((key) => {
              const p = pathwaysData[key];
              const isSelected = selectedExam === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`preset-chip ${isSelected ? 'active' : ''}`}
                  style={{ textAlign: 'left', padding: '12px 14px' }}
                  onClick={() => setSelectedExam(key)}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{p.examName}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    Code: <strong>{p.examCode}</strong> • {p.timeline}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Roadmap Preview */}
        {currentPathway && (
          <div className="flat-card">
            <div className="card-title-bar">
              <div>
                <span className="brand-tag" style={{ backgroundColor: '#10b981', marginBottom: '4px', display: 'inline-block' }}>
                  Curated Roadmap
                </span>
                <h3>{currentPathway.examName}</h3>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenPathwayModal(currentPathway.examCode)}
              >
                <span>Full Screen View</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Overview */}
            <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
              {currentPathway.overview}
            </p>

            {/* Timeline Tag */}
            <div
              style={{
                backgroundColor: '#f3f4f6',
                border: '2px solid #111827',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '24px',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              ⏱️ Recommended Preparation Span: <strong>{currentPathway.timeline}</strong>
            </div>

            {/* Phases */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
                Preparation Phases & Semester Milestones
              </h4>
              {currentPathway.phases.map((ph) => (
                <div key={ph.phase} className="phase-card">
                  <div className="phase-header">
                    <div className="phase-number-badge">{ph.phase}</div>
                    <div className="phase-title">{ph.title}</div>
                    <div className="phase-duration">{ph.duration}</div>
                  </div>
                  <ul className="milestones-list">
                    {ph.milestones.map((m, mIdx) => (
                      <li key={mIdx}>
                        <CheckCircle2 size={16} className="milestone-icon" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Recommended Books & Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px', color: '#111827' }}>
                  📚 Standard Textbooks
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.82rem', color: '#4b5563' }}>
                  {currentPathway.recommendedBooks.map((b, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      • {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px', color: '#065f46' }}>
                  📅 Study Routine
                </div>
                <p style={{ fontSize: '0.82rem', color: '#1f2937', lineHeight: '1.5' }}>
                  {currentPathway.studySchedule}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

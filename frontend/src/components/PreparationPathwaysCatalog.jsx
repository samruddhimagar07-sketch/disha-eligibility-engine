import React, { useState } from 'react';
import { BookOpen, Award, Compass, Briefcase, Shield, Globe, Building2, ChevronRight, CheckCircle2, ArrowRight } from './Icon';

export default function PreparationPathwaysCatalog({ pathwaysData, onOpenPathwayModal }) {
  const [selectedExam, setSelectedExam] = useState('UPSC-CSE');

  if (!pathwaysData) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <BookOpen size={48} color="#005a69" style={{ margin: '0 auto 16px' }} />
        <h3>Loading Preparation Pathways...</h3>
      </div>
    );
  }

  const examKeys = Object.keys(pathwaysData);
  if (examKeys.length === 0) {
    return (
      <div className="flat-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <BookOpen size={48} color="#005a69" style={{ margin: '0 auto 16px' }} />
        <h3>No pathways for your stream yet</h3>
        <p style={{ color: '#6f797c', marginTop: '8px' }}>
          Evaluate your profile first, or pick another academic stream to see its preparation roadmaps.
        </p>
      </div>
    );
  }
  const currentPathway = pathwaysData[selectedExam] || pathwaysData[examKeys[0]];

  return (
    <div>
      {/* Intro hero */}
      <div className="relative mb-space-lg overflow-hidden rounded-lg bg-gradient-to-r from-[#175c6c] via-[#2a7b8e] to-[#edd3be] p-space-xl text-white shadow-sm">
        <div className="relative z-10 flex flex-col gap-space-sm">
          <span className="text-label-md uppercase tracking-widest text-white/80">Preparation Pathways</span>
          <h2 className="text-headline-lg font-bold !text-white">Roadmaps for Higher Studies &amp; Exams</h2>
          <p className="max-w-2xl text-body-lg text-white/90">
            Phase-by-phase strategies, standard reference books, milestone checklists and study schedules curated for
            university students.
          </p>
          <div className="mt-space-xs inline-flex w-fit items-center gap-space-sm rounded-full bg-black/15 px-space-md py-space-xs text-label-md backdrop-blur-md">
            <Compass size={18} color="#ffdcbf" />
            {examKeys.length} curated roadmaps
          </div>
        </div>
        <Compass size={200} color="#ffffff" className="pointer-events-none absolute -right-4 -top-4 opacity-[0.12]" />
      </div>

      <div className="grid grid-cols-1 items-start gap-space-lg xl:grid-cols-[320px_1fr]">
        {/* Left Column: Exam Pathway Nav */}
        <div className="flat-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#6f797c', marginBottom: '12px' }}>
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
                <span className="brand-tag" style={{ backgroundColor: '#8b5000', marginBottom: '4px', display: 'inline-block' }}>
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
            <p style={{ fontSize: '0.95rem', color: '#3f484b', lineHeight: '1.6', marginBottom: '20px' }}>
              {currentPathway.overview}
            </p>

            {/* Timeline Tag */}
            <div
              style={{
                backgroundColor: '#e9f5ff',
                border: '1px solid #bec8cb',
                borderRadius: '16px',
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
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
              <div style={{ backgroundColor: '#f5faff', border: '1px solid #bec8cb', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px', color: '#001e2c' }}>
                  📚 Standard Textbooks
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.82rem', color: '#3f484b' }}>
                  {currentPathway.recommendedBooks.map((b, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      • {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px', color: '#065f46' }}>
                  📅 Study Routine
                </div>
                <p style={{ fontSize: '0.82rem', color: '#173342', lineHeight: '1.5' }}>
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

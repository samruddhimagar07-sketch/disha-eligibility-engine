import React from 'react';
import { X, Calendar, BookOpen, Clock, CheckCircle2, Award, ExternalLink, Bookmark } from './Icon';

export default function PathwayModal({ pathwayData, examCode, onClose }) {
  if (!pathwayData) return null;

  const data = pathwayData[examCode] || {
    examCode: examCode,
    examName: examCode,
    overview: 'Comprehensive preparation roadmap designed for undergraduate engineering students.',
    timeline: '6 to 12 months preparation cycle.',
    phases: [
      {
        phase: 1,
        title: 'Foundation & Conceptual Clarity',
        duration: 'Months 1 - 3',
        milestones: [
          'Review complete syllabus and high-weightage topics',
          'Read standard undergraduate reference materials',
          'Practice previous 5 years examination papers'
        ]
      },
      {
        phase: 2,
        title: 'Subject Mastery & Sectional Drills',
        duration: 'Months 4 - 6',
        milestones: [
          'Solve topic-wise problem sets and question banks',
          'Maintain an error logbook for recurring mistakes',
          'Participate in weekly timed quizzes'
        ]
      },
      {
        phase: 3,
        title: 'Full-Length Mocks & Performance Analysis',
        duration: 'Months 7 - 9',
        milestones: [
          'Attempt 20+ full-length mock examinations',
          'Analyze time spent per question and eliminate negative marks',
          'Revise core formula notebooks and summaries'
        ]
      }
    ],
    recommendedBooks: [
      'Standard Higher Education Reference Textbooks',
      'Previous 10 Years Solved Papers',
      'National Aptitude & General Awareness Compendium'
    ],
    studySchedule: 'Allocate 2.5 to 3.5 hours on weekdays and 6 hours on weekends.'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="brand-tag" style={{ backgroundColor: '#005a69', marginBottom: '6px', display: 'inline-block' }}>
              Structured Pathway Roadmap
            </span>
            <h2>{data.examName}</h2>
            <div style={{ fontSize: '0.85rem', color: '#6f797c', fontWeight: 600 }}>
              Exam Code: <strong>{data.examCode}</strong>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Overview Box */}
        <div
          style={{
            backgroundColor: '#e9f5ff',
            border: '1px solid #005a69',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontWeight: 800, color: '#004e5c', marginBottom: '4px', fontSize: '0.9rem' }}>
            🧭 Examination Overview
          </div>
          <p style={{ fontSize: '0.92rem', color: '#173342', marginBottom: '8px' }}>
            {data.overview}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#005a69' }}>
            <Clock size={16} />
            Recommended Preparation Timeline: {data.timeline}
          </div>
        </div>

        {/* 4-Phase Roadmap */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.01em' }}>
            Phase-by-Phase Preparation Milestones
          </h3>

          {data.phases.map((p) => (
            <div key={p.phase} className="phase-card">
              <div className="phase-header">
                <div className="phase-number-badge">{p.phase}</div>
                <div className="phase-title">{p.title}</div>
                <div className="phase-duration">{p.duration}</div>
              </div>
              <ul className="milestones-list">
                {p.milestones.map((m, mIdx) => (
                  <li key={mIdx}>
                    <CheckCircle2 size={16} className="milestone-icon" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Books & Study Schedule Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Books */}
          <div
            style={{
              backgroundColor: '#e9f5ff',
              border: '1px solid #bec8cb',
              borderRadius: '20px',
              padding: '16px'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#005a69" />
              Standard Reference Books
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {data.recommendedBooks.map((b, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.82rem',
                    marginBottom: '6px',
                    paddingBottom: '4px',
                    borderBottom: '1px solid #bec8cb',
                    fontWeight: 600
                  }}
                >
                  📖 {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Timetable */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '20px',
              padding: '16px'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065f46', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#10b981" />
              College Study Timetable
            </div>
            <p style={{ fontSize: '0.88rem', color: '#173342', lineHeight: '1.6' }}>
              {data.studySchedule}
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>
              💡 Tip: Maintain consistent daily slots rather than weekend cramming.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #bec8cb' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Roadmap
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              alert(`Roadmap for ${data.examName} saved to your personalized preparation bookmark list!`);
            }}
          >
            <Bookmark size={16} />
            Bookmark Pathway Plan
          </button>
        </div>
      </div>
    </div>
  );
}

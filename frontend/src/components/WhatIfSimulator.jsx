import React, { useState } from 'react';
import { Sliders, Sparkles, CheckCircle2, TrendingUp, ArrowRight, Zap } from 'lucide-react';

export default function WhatIfSimulator({ currentStudent, onApplySimulation, onRunEvaluation }) {
  const [simCgpa, setSimCgpa] = useState(currentStudent.cgpa || 7.5);
  const [simBacklogs, setSimBacklogs] = useState(0);
  const [simYear, setSimYear] = useState(Math.max(currentStudent.currentYear, 3));

  // Quick delta calculations
  const cgpaDelta = (simCgpa - currentStudent.cgpa).toFixed(2);
  const backlogDelta = currentStudent.activeBacklogs - simBacklogs;

  const handleSimulateNow = () => {
    const simulatedProfile = {
      ...currentStudent,
      cgpa: parseFloat(simCgpa),
      activeBacklogs: parseInt(simBacklogs, 10),
      currentYear: parseInt(simYear, 10),
      degreeCompleted: simYear >= 4
    };
    onRunEvaluation(simulatedProfile);
  };

  const handleApplyPermanently = () => {
    const updated = {
      ...currentStudent,
      cgpa: parseFloat(simCgpa),
      activeBacklogs: parseInt(simBacklogs, 10),
      currentYear: parseInt(simYear, 10),
      degreeCompleted: simYear >= 4
    };
    onApplySimulation(updated);
  };

  return (
    <div className="flat-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card-title-bar">
        <h3>
          <Sliders size={22} color="#3b82f6" />
          Interactive Eligibility Simulator ("What-If" Analysis)
        </h3>
        <span className="brand-tag" style={{ backgroundColor: '#10b981' }}>
          Live Projections
        </span>
      </div>

      <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '0.95rem' }}>
        Test how improving your academic metrics (e.g. clearing active backlogs, scoring higher CGPA in upcoming semesters, or moving to Year 4) instantly unlocks competitive and higher study examinations.
      </p>

      {/* Simulator Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* CGPA Slider */}
        <div style={{ backgroundColor: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e40af' }}>
              Projected CGPA
            </label>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1d4ed8' }}>
              {simCgpa}
            </span>
          </div>
          <input
            type="range"
            min="5.0"
            max="10.0"
            step="0.05"
            value={simCgpa}
            onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
            <span>5.0</span>
            <span>Current: {currentStudent.cgpa}</span>
            <span>10.0</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: cgpaDelta >= 0 ? '#059669' : '#dc2626', marginTop: '8px' }}>
            {cgpaDelta >= 0 ? `+${cgpaDelta} CGPA improvement` : `${cgpaDelta} CGPA decrease`}
          </div>
        </div>

        {/* Backlogs Slider */}
        <div style={{ backgroundColor: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 800, fontSize: '0.9rem', color: '#b45309' }}>
              Target Active Backlogs
            </label>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b45309' }}>
              {simBacklogs}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={simBacklogs}
            onChange={(e) => setSimBacklogs(parseInt(e.target.value, 10))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
            <span>0 (All Cleared)</span>
            <span>Current: {currentStudent.activeBacklogs}</span>
            <span>5</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: backlogDelta > 0 ? '#059669' : '#6b7280', marginTop: '8px' }}>
            {backlogDelta > 0 ? `Clearing ${backlogDelta} active backlog(s)` : 'No backlog reduction'}
          </div>
        </div>
      </div>

      {/* Target Year */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>
          Simulated Academic Year of Study
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[1, 2, 3, 4].map((yr) => (
            <button
              key={yr}
              type="button"
              className={`preset-chip ${simYear === yr ? 'active' : ''}`}
              style={{ textAlign: 'center', padding: '12px' }}
              onClick={() => setSimYear(yr)}
            >
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Year {yr}</div>
              <div style={{ fontSize: '0.75rem' }}>
                {yr === 1 && 'Freshman'}
                {yr === 2 && 'Sophomore'}
                {yr === 3 && 'GATE / Abroad Eligible'}
                {yr === 4 && 'UPSC / CAT / CDS Eligible'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ flex: 1, padding: '14px' }}
          onClick={handleSimulateNow}
        >
          <Zap size={18} />
          <span>Simulate & Recalculate Results Now</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '14px 24px' }}
          onClick={handleApplyPermanently}
        >
          <ArrowRight size={18} />
          <span>Apply to My Active Profile</span>
        </button>
      </div>
    </div>
  );
}

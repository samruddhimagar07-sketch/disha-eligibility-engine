import React from 'react';
import { UserCheck, Sparkles, Send, RotateCcw } from 'lucide-react';

export const PRESETS = [
  {
    id: 'DEMO-01',
    name: 'Aarav Sharma',
    age: 20,
    gender: 'MALE',
    branch: 'IT',
    currentYear: 2,
    cgpa: 8.5,
    category: 'GENERAL',
    activeBacklogs: 0,
    tenthPercentage: 91.5,
    twelfthPercentage: 89.0,
    subtitle: 'High CGPA 2nd-Year IT Aspirant'
  },
  {
    id: 'DEMO-02',
    name: 'Diya Patel',
    age: 20,
    gender: 'FEMALE',
    branch: 'IT',
    currentYear: 2,
    cgpa: 6.8,
    category: 'OBC_NCL',
    activeBacklogs: 2,
    tenthPercentage: 84.0,
    twelfthPercentage: 82.5,
    subtitle: 'OBC Candidate with 2 Active Arrears'
  },
  {
    id: 'DEMO-03',
    name: 'Rohan Verma',
    age: 22,
    gender: 'MALE',
    branch: 'CSE',
    currentYear: 4,
    cgpa: 6.2,
    category: 'GENERAL',
    activeBacklogs: 2,
    tenthPercentage: 78.0,
    twelfthPercentage: 75.0,
    subtitle: 'Final Year with Backlogs (CAT vs PSU)'
  },
  {
    id: 'DEMO-04',
    name: 'Ananya Iyer',
    age: 21,
    gender: 'FEMALE',
    branch: 'ME',
    currentYear: 3,
    cgpa: 9.1,
    category: 'GENERAL',
    activeBacklogs: 0,
    tenthPercentage: 94.0,
    twelfthPercentage: 92.0,
    subtitle: 'Mechanical Topper targeting GATE/ISRO'
  },
  {
    id: 'DEMO-05',
    name: 'Vikram Singh',
    age: 23,
    gender: 'MALE',
    branch: 'ECE',
    currentYear: 4,
    cgpa: 7.85,
    category: 'SC',
    activeBacklogs: 0,
    tenthPercentage: 82.0,
    twelfthPercentage: 80.0,
    subtitle: 'SC Category with Age Relaxation'
  }
];

export default function StudentProfileForm({
  student,
  onChange,
  onPresetSelect,
  onSubmit,
  isLoading
}) {
  const handleChange = (field, value) => {
    onChange({
      ...student,
      [field]: value
    });
  };

  return (
    <div className="flat-card">
      <div className="card-title-bar">
        <h3>
          <UserCheck size={20} color="#3b82f6" />
          Student Profile Details
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>
          ID: {student.id || 'NEW'}
        </span>
      </div>

      {/* Preset Profiles Bar */}
      <div className="presets-container">
        <span className="presets-label">
          <Sparkles size={13} style={{ display: 'inline', marginRight: 4 }} />
          Quick Test Presets (Click to load)
        </span>
        <div className="preset-pill-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-chip ${student.id === p.id ? 'active' : ''}`}
              onClick={() => onPresetSelect(p)}
            >
              <span className="preset-name">{p.name}</span>
              <span className="preset-details">
                {p.branch} • Yr {p.currentYear} • CGPA {p.cgpa}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            value={student.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Current CGPA (out of 10)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-input"
              value={student.cgpa !== undefined ? student.cgpa : ''}
              onChange={(e) => handleChange('cgpa', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="form-group">
            <label>Social Category</label>
            <select
              className="form-select"
              value={student.category || 'GENERAL'}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="GENERAL">General (Unreserved)</option>
              <option value="OBC_NCL">OBC (Non-Creamy Layer)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Year of Study</label>
            <select
              className="form-select"
              value={student.currentYear || 2}
              onChange={(e) => handleChange('currentYear', parseInt(e.target.value, 10))}
            >
              <option value={1}>1st Year (Freshman)</option>
              <option value={2}>2nd Year (Sophomore)</option>
              <option value={3}>3rd Year (Junior / Pre-final)</option>
              <option value={4}>4th Year (Senior / Final)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Active Backlogs</label>
            <input
              type="number"
              min="0"
              max="20"
              className="form-input"
              value={student.activeBacklogs !== undefined ? student.activeBacklogs : 0}
              onChange={(e) => handleChange('activeBacklogs', parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Branch</label>
            <select
              className="form-select"
              value={student.branch || 'IT'}
              onChange={(e) => handleChange('branch', e.target.value)}
            >
              <option value="CSE">Computer Science & Engg (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EE">Electrical Engineering (EE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="CE">Civil Engineering (CE)</option>
              <option value="CHEM">Chemical Engineering (CHEM)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Age (Years)</label>
            <input
              type="number"
              min="15"
              max="65"
              className="form-input"
              value={student.age || 20}
              onChange={(e) => handleChange('age', parseInt(e.target.value, 10) || 20)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>10th Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="100"
              className="form-input"
              value={student.tenthPercentage || 85}
              onChange={(e) => handleChange('tenthPercentage', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="form-group">
            <label>12th Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="100"
              className="form-input"
              value={student.twelfthPercentage || 85}
              onChange={(e) => handleChange('twelfthPercentage', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Evaluating Profile in Core Java...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Evaluate My Eligibility</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

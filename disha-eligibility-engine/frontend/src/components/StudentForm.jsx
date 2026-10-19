import React from 'react';

export const PRESETS = [
  {
    id: "DEMO-01",
    name: "Aarav Sharma",
    age: 20,
    gender: "MALE",
    branch: "IT",
    currentYear: 2,
    cgpa: 8.50,
    category: "GENERAL",
    activeBacklogs: 0,
    tenthPercentage: 91.5,
    twelfthPercentage: 89.0,
    notes: "2nd-Year IT (High CGPA, 0 Backlogs)"
  },
  {
    id: "DEMO-02",
    name: "Diya Patel",
    age: 20,
    gender: "FEMALE",
    branch: "IT",
    currentYear: 2,
    cgpa: 6.80,
    category: "OBC_NCL",
    activeBacklogs: 2,
    tenthPercentage: 84.0,
    twelfthPercentage: 82.5,
    notes: "2nd-Year IT (Arrears, OBC-NCL)"
  },
  {
    id: "DEMO-03",
    name: "Rohan Verma",
    age: 22,
    gender: "MALE",
    branch: "CSE",
    currentYear: 4,
    cgpa: 6.20,
    category: "GENERAL",
    activeBacklogs: 2,
    tenthPercentage: 78.0,
    twelfthPercentage: 75.0,
    notes: "4th-Year CS (Borderline CGPA)"
  },
  {
    id: "DEMO-04",
    name: "Ananya Iyer",
    age: 21,
    gender: "FEMALE",
    branch: "ME",
    currentYear: 3,
    cgpa: 9.10,
    category: "GENERAL",
    activeBacklogs: 0,
    tenthPercentage: 94.0,
    twelfthPercentage: 92.0,
    notes: "3rd-Year ME (9.1 CGPA, Core Branch)"
  }
];

export default function StudentForm({ student, onChange, onPresetSelect, onSubmit, isLoading }) {
  return (
    <aside className="glass-panel sidebar-card">
      <div className="presets-container">
        <div className="section-title">
          <span>Predefined Personas</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
            OOP Rubric Scenarios
          </span>
        </div>
        <div className="presets-grid">
          {PRESETS.map((p, idx) => (
            <div
              key={p.id}
              className="preset-chip"
              onClick={() => onPresetSelect(p)}
            >
              <span className="preset-name">{p.name}</span>
              <span className="preset-meta">{p.notes}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="section-title">
          <span>Student Academic Profile</span>
        </div>

        <div className="form-group">
          <label className="form-label">Candidate Full Name</label>
          <input
            type="text"
            className="form-input"
            required
            value={student.name}
            onChange={e => onChange({ ...student, name: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              min="16"
              max="65"
              required
              value={student.age}
              onChange={e => onChange({ ...student, age: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={student.gender}
              onChange={e => onChange({ ...student, gender: e.target.value })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select
              className="form-select"
              value={student.branch}
              onChange={e => onChange({ ...student, branch: e.target.value })}
            >
              <option value="CSE">CSE (Computer Science)</option>
              <option value="IT">IT (Information Tech)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="EE">EE (Electrical)</option>
              <option value="ME">ME (Mechanical)</option>
              <option value="CE">CE (Civil)</option>
              <option value="CHEM">Chemical</option>
              <option value="OTHER_ENG">Other Engineering</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Current Year</label>
            <select
              className="form-select"
              value={student.currentYear}
              onChange={e => onChange({ ...student, currentYear: parseInt(e.target.value, 10) })}
            >
              <option value={1}>Year 1 (Freshman)</option>
              <option value={2}>Year 2 (Sophomore)</option>
              <option value={3}>Year 3 (Pre-final)</option>
              <option value={4}>Year 4 (Final Year)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CGPA (0.00 - 10.00)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-input"
              required
              value={student.cgpa}
              onChange={e => onChange({ ...student, cgpa: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Active Backlogs</label>
            <input
              type="number"
              min="0"
              max="20"
              className="form-input"
              required
              value={student.activeBacklogs}
              onChange={e => onChange({ ...student, activeBacklogs: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reservation Category</label>
          <select
            className="form-select"
            value={student.category}
            onChange={e => onChange({ ...student, category: e.target.value })}
          >
            <option value="GENERAL">General / Unreserved</option>
            <option value="EWS">Economically Weaker Section (EWS)</option>
            <option value="OBC_NCL">OBC (Non-Creamy Layer)</option>
            <option value="SC">Scheduled Caste (SC)</option>
            <option value="ST">Scheduled Tribe (ST)</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">10th Std (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={student.tenthPercentage}
              onChange={e => onChange({ ...student, tenthPercentage: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">12th Std (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={student.twelfthPercentage}
              onChange={e => onChange({ ...student, twelfthPercentage: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          <svg className="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          {isLoading ? 'Evaluating via Rules...' : 'Evaluate Eligibility'}
        </button>
      </form>
    </aside>
  );
}

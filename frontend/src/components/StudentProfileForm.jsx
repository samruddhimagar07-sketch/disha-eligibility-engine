import React from 'react';
import { UserCheck, Send } from './Icon';

const Req = () => <span className="text-error"> *</span>;

export default function StudentProfileForm({ student, onChange, onSubmit, onBranchSelect, isLoading, submitted }) {
  const handleChange = (field, value) => onChange({ ...student, [field]: value });
  const v = (field) => (student[field] === undefined || student[field] === null ? '' : student[field]);

  return (
    <div className="flat-card">
      <div className="card-title-bar">
        <h3>
          <UserCheck size={20} color="#005a69" />
          Student Profile Details
        </h3>
      </div>
      <p className="mb-space-md text-body-sm text-on-surface-variant">
        {submitted
          ? 'Update any detail and re-evaluate. Changing your branch refreshes your exams instantly.'
          : 'Enter your details to see the exams and preparation pathways open to your stream.'}
      </p>

      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name<Req /></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={v('name')}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Student ID / Roll No.<Req /></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. STU-101"
              value={v('id')}
              onChange={(e) => handleChange('id', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Branch<Req /></label>
            <select
              className="form-select"
              value={v('branch')}
              onChange={(e) => {
                handleChange('branch', e.target.value);
                if (onBranchSelect) onBranchSelect(e.target.value);
              }}
              required
            >
              <option value="" disabled>Select your branch</option>
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
            <label>Year of Study<Req /></label>
            <select
              className="form-select"
              value={v('currentYear')}
              onChange={(e) => handleChange('currentYear', e.target.value)}
              required
            >
              <option value="" disabled>Select year</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Pre-final)</option>
              <option value="4">4th Year (Final)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>CGPA (out of 10)<Req /></label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-input"
              placeholder="e.g. 8.25"
              value={v('cgpa')}
              onChange={(e) => handleChange('cgpa', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Active Backlogs<Req /></label>
            <input
              type="number"
              min="0"
              max="20"
              className="form-input"
              placeholder="0 if none"
              value={v('activeBacklogs')}
              onChange={(e) => handleChange('activeBacklogs', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Social Category<Req /></label>
            <select
              className="form-select"
              value={v('category')}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              <option value="" disabled>Select category</option>
              <option value="GENERAL">General (Unreserved)</option>
              <option value="OBC_NCL">OBC (Non-Creamy Layer)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender<Req /></label>
            <select
              className="form-select"
              value={v('gender')}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age (Years)<Req /></label>
            <input
              type="number"
              min="15"
              max="65"
              className="form-input"
              placeholder="e.g. 20"
              value={v('age')}
              onChange={(e) => handleChange('age', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>10th Percentage (%)<Req /></label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="100"
              className="form-input"
              placeholder="e.g. 88.5"
              value={v('tenthPercentage')}
              onChange={(e) => handleChange('tenthPercentage', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>12th Percentage (%)<Req /></label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="100"
              className="form-input"
              placeholder="e.g. 85.0"
              value={v('twelfthPercentage')}
              onChange={(e) => handleChange('twelfthPercentage', e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={isLoading}>
            {isLoading ? (
              <span>Evaluating your profile...</span>
            ) : (
              <>
                <Send size={18} />
                <span>{submitted ? 'Re-evaluate My Eligibility' : 'Evaluate My Eligibility'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

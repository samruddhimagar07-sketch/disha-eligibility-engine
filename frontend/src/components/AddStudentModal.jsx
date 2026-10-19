import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

export default function AddStudentModal({ onClose, onAddStudent }) {
  const [formData, setFormData] = useState({
    id: `STU-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    age: 21,
    branch: 'CSE',
    currentYear: 3,
    cgpa: 7.5,
    category: 'GENERAL',
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    tenthPercentage: 85.0,
    twelfthPercentage: 82.0,
    gender: 'MALE',
    degreeCompleted: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onAddStudent(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="brand-tag" style={{ backgroundColor: '#3b82f6', marginBottom: '6px', display: 'inline-block' }}>
              Batch Enrollment
            </span>
            <h2>Add Student to Batch Roster</h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontWeight: 700, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Priyanshu Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, email: e.target.value.toLowerCase().replace(/\s+/g, '.') + '@eng.edu' })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Branch / Stream</label>
              <select
                className="form-select"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label>Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="20"
                className="form-input"
                value={formData.activeBacklogs}
                onChange={(e) => setFormData({ ...formData, activeBacklogs: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Year</label>
              <select
                className="form-select"
                value={formData.currentYear}
                onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value, 10) })}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="GENERAL">General</option>
                <option value="OBC_NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <UserPlus size={18} />
              <span>{submitting ? 'Adding...' : 'Add to Batch CSV & Evaluate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

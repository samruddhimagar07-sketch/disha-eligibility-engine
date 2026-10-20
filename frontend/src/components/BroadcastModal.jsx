import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, Users, CheckCircle2 } from './Icon';

const BROADCAST_TEMPLATES = [
  {
    name: 'UPSC Mentorship Series',
    targetExam: 'UPSC-CSE',
    title: 'UPSC Civil Services Mentorship & Mock Prelims Cohort',
    priority: 'ACTION_REQUIRED',
    message:
      'Orientation session for 3rd and 4th year aspirants eligible for UPSC CSE. Prof. K. Sundaram will review general studies syllabus division and optional subject selection strategies in Seminar Hall 2 this Saturday at 10:00 AM.'
  },
  {
    name: 'CAT / MBA Quantitative Bootcamp',
    targetExam: 'CAT',
    title: 'CAT / MBA Summer Bootcamp & Quantitative Aptitude Series',
    priority: 'INFO',
    message:
      'Exclusive invitation for high CGPA students eligible for IIM CAT. Weekly speed arithmetic workshops and mock interviews will be conducted by alumni from IIM Ahmedabad. Registration link shared on portal.'
  },
  {
    name: 'Remedial Arrears Clearing Session',
    targetExam: 'REMEDIAL',
    title: 'Urgent: Remedial Fast-Track Classes for Active Backlog Clearance',
    priority: 'URGENT',
    message:
      'All students with active backlogs in semesters 1-4 must register for remedial tutoring. Clearing arrears before semester 7 is mandatory for PSU recruitment and Defence NDA/CDS eligibility.'
  },
  {
    name: 'Defence Services SSB Drill',
    targetExam: 'CDS-IMA',
    title: 'Indian Armed Forces (CDS & AFCAT) SSB Screening Preparation',
    priority: 'INFO',
    message:
      'Physical fitness and psychological screening practice session for CDS IMA/OTA and AFCAT eligible graduates. Colonel (Retd.) Verma will conduct SSB interview drills this Thursday at 4 PM in the College Gymnasium.'
  },
  {
    name: 'GRE & Global Higher Studies',
    targetExam: 'GRE-MS',
    title: 'GRE General & Top 50 Global University Admissions Workshop',
    priority: 'INFO',
    message:
      'Guidance seminar on university shortlisting, Statement of Purpose (SOP) drafting, and professor recommendation letters (LORs) for students targeting Fall 2027 MS in US/Europe.'
  }
];

export default function BroadcastModal({
  targetStudents,
  initialExamCode,
  onClose,
  onSendNotification
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('INFO');
  const [targetExamCode, setTargetExamCode] = useState(
    initialExamCode && initialExamCode !== 'ALL' && initialExamCode !== 'DIRECT'
      ? initialExamCode
      : 'UPSC-CSE'
  );
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Set default template on mount
  useEffect(() => {
    const match =
      BROADCAST_TEMPLATES.find((t) => t.targetExam === initialExamCode) ||
      BROADCAST_TEMPLATES[0];
    setTitle(match.title);
    setMessage(match.message);
    setPriority(match.priority);
    setTargetExamCode(match.targetExam);
  }, [initialExamCode]);

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setPriority(tpl.priority);
    setTargetExamCode(tpl.targetExam);
  };

  const recipientIds = targetStudents ? targetStudents.map((s) => s.id) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);

    const payload = {
      title,
      message,
      sender: 'Prof. K. Sundaram (Dean of Career Services)',
      targetExamCode,
      targetAudience: `Batch Cohort (${recipientIds.length} Eligible Students)`,
      recipientIds,
      priority
    };

    try {
      const res = await onSendNotification(payload);
      setFeedback({
        success: true,
        text: `Broadcast sent successfully to ${recipientIds.length} students!`
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setFeedback({
        success: false,
        text: err.message || 'Failed to dispatch notification'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="brand-tag" style={{ backgroundColor: '#10b981', marginBottom: '6px', display: 'inline-block' }}>
              Faculty Broadcast Dispatcher
            </span>
            <h2>Informing & Notifying Eligible Students</h2>
            <div style={{ fontSize: '0.85rem', color: '#6f797c', fontWeight: 600 }}>
              Broadcasting to <strong>{recipientIds.length} targeted students</strong>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Quick Templates Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#6f797c' }}>
            <Sparkles size={13} style={{ display: 'inline', marginRight: 4 }} />
            Quick Faculty Notice Templates (Click to fill)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {BROADCAST_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleApplyTemplate(tpl)}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Announcement Subject / Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Examination Tag</label>
              <input
                type="text"
                className="form-input"
                value={targetExamCode}
                onChange={(e) => setTargetExamCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Urgency Level</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="INFO">Information (Standard Notice)</option>
                <option value="ACTION_REQUIRED">Action Required (Upcoming Mentorship / Task)</option>
                <option value="URGENT">Urgent (Mandatory Backlog / Deadline Alert)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message Content</label>
            <textarea
              className="form-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Recipient Preview Box */}
          <div
            style={{
              backgroundColor: '#e9f5ff',
              border: '1px solid #005a69',
              borderRadius: '20px',
              padding: '12px 16px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#004e5c', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} />
              Recipient Manifest ({recipientIds.length} Students)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3f484b', wordBreak: 'break-word' }}>
              {targetStudents && targetStudents.length > 0 ? (
                targetStudents.map((s) => `${s.name} (${s.id})`).join(', ')
              ) : (
                <em>No recipients selected. Filter students in the roster first.</em>
              )}
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              style={{
                padding: '12px',
                borderRadius: '16px',
                marginBottom: '16px',
                backgroundColor: feedback.success ? '#ecfdf5' : '#ffdad6',
                border: `2px solid ${feedback.success ? '#10b981' : '#ba1a1a'}`,
                color: feedback.success ? '#065f46' : '#93000a',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              {feedback.success ? '✓ ' : '✕ '}
              {feedback.text}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || recipientIds.length === 0}
            >
              <Send size={18} />
              <span>{sending ? 'Dispatching via Backend...' : 'Dispatch Announcement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

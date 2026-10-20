import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2, User, Clock, Filter, Tag } from './Icon';

export default function StudentNotificationsView({ notifications, currentStudent }) {
  const [filterPriority, setFilterPriority] = useState('ALL');

  const filtered = (notifications || []).filter((n) => {
    if (filterPriority === 'ALL') return true;
    return n.priority === filterPriority;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="priority-tag urgent">Urgent Alert</span>;
      case 'ACTION_REQUIRED':
        return <span className="priority-tag action_required">Action Required</span>;
      default:
        return <span className="priority-tag info">Information</span>;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flat-card" style={{ marginBottom: '20px' }}>
        <div className="card-title-bar">
          <h3>
            <Bell size={22} color="#005a69" />
            Official Announcements & Recommendations Inbox
          </h3>
          <span className="brand-tag" style={{ backgroundColor: '#001e2c' }}>
            Delivered by Faculty
          </span>
        </div>
        <p style={{ color: '#3f484b', fontSize: '0.92rem' }}>
          Personalized notices, mentorship sessions, and preparation circulars delivered to your student profile (<strong>{currentStudent ? currentStudent.name : 'Student'}</strong>) by academic mentors.
        </p>

        {/* Priority Filter */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterPriority('ALL')}
          >
            All Announcements ({notifications ? notifications.length : 0})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'URGENT' ? 'active' : ''}`}
            onClick={() => setFilterPriority('URGENT')}
            style={{ borderColor: '#ba1a1a' }}
          >
            Urgent Alerts
          </button>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'ACTION_REQUIRED' ? 'active' : ''}`}
            onClick={() => setFilterPriority('ACTION_REQUIRED')}
            style={{ borderColor: '#fea443' }}
          >
            Action Required
          </button>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'INFO' ? 'active' : ''}`}
            onClick={() => setFilterPriority('INFO')}
            style={{ borderColor: '#005a69' }}
          >
            General Info
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="flat-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h4>No Announcements in this category</h4>
          <p style={{ color: '#6f797c', fontSize: '0.88rem', marginTop: '6px' }}>
            You are fully caught up with faculty advisories and exam notifications.
          </p>
        </div>
      ) : (
        filtered.map((n) => (
          <div key={n.id} className="notification-card">
            <div className="notif-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {getPriorityBadge(n.priority)}
                  <span
                    style={{
                      backgroundColor: '#e9f5ff',
                      color: '#005a69',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #87d1e6'
                    }}
                  >
                    Target: {n.targetExamCode}
                  </span>
                </div>
                <h4 className="notif-title">{n.title}</h4>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6f797c' }}>
                {n.timestamp}
              </span>
            </div>

            <p className="notif-message">{n.message}</p>

            <div className="notif-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#001e2c' }}>
                <User size={14} color="#005a69" />
                From: {n.sender}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#3f484b' }}>
                Audience: <strong>{n.targetAudience}</strong>
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

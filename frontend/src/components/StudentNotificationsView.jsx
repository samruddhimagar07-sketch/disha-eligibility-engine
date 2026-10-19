import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2, User, Clock, Filter, Tag } from 'lucide-react';

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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="flat-card" style={{ marginBottom: '20px' }}>
        <div className="card-title-bar">
          <h3>
            <Bell size={22} color="#3b82f6" />
            Official Announcements & Recommendations Inbox
          </h3>
          <span className="brand-tag" style={{ backgroundColor: '#111827' }}>
            Delivered by Faculty
          </span>
        </div>
        <p style={{ color: '#4b5563', fontSize: '0.92rem' }}>
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
            style={{ borderColor: '#ef4444' }}
          >
            Urgent Alerts
          </button>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'ACTION_REQUIRED' ? 'active' : ''}`}
            onClick={() => setFilterPriority('ACTION_REQUIRED')}
            style={{ borderColor: '#f59e0b' }}
          >
            Action Required
          </button>
          <button
            type="button"
            className={`filter-chip ${filterPriority === 'INFO' ? 'active' : ''}`}
            onClick={() => setFilterPriority('INFO')}
            style={{ borderColor: '#3b82f6' }}
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
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '6px' }}>
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
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    Target: {n.targetExamCode}
                  </span>
                </div>
                <h4 className="notif-title">{n.title}</h4>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>
                {n.timestamp}
              </span>
            </div>

            <p className="notif-message">{n.message}</p>

            <div className="notif-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#111827' }}>
                <User size={14} color="#3b82f6" />
                From: {n.sender}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Audience: <strong>{n.targetAudience}</strong>
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

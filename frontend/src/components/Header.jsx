import React from 'react';
import { GraduationCap, Users, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Header({
  activeRole,
  onRoleChange,
  currentStudent,
  unreadCount,
  onOpenNotifications,
  serverStatus
}) {
  return (
    <header className="flat-header">
      {/* Brand area */}
      <div className="brand-wrapper">
        <div className="brand-logo-badge">
          <GraduationCap size={28} />
        </div>
        <div className="brand-text">
          <h1>
            DISHA
            <span className="brand-tag">Core Java Engine v1.0</span>
          </h1>
          <p className="brand-subtitle">
            Higher Studies & Competitive Exam Eligibility Engine with Preparation Pathways
          </p>
        </div>
      </div>

      {/* Role Segmented Controller */}
      <div className="role-segmented-controller" role="tablist" aria-label="Portal Selection">
        <button
          type="button"
          className={`role-btn ${activeRole === 'student' ? 'active' : ''}`}
          onClick={() => onRoleChange('student')}
        >
          <GraduationCap size={18} />
          Student Dashboard
        </button>
        <button
          type="button"
          className={`role-btn ${activeRole === 'teacher' ? 'active' : ''}`}
          onClick={() => onRoleChange('teacher')}
        >
          <Users size={18} />
          Teacher / Faculty Dashboard
        </button>
      </div>

      {/* Header Actions & Profile */}
      <div className="header-actions">
        {activeRole === 'student' && currentStudent && (
          <div className="user-badge" title={`Current Profile: ${currentStudent.name}`}>
            <div className="user-avatar-circle">
              {currentStudent.name ? currentStudent.name.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{currentStudent.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                Yr {currentStudent.currentYear} • {currentStudent.branch} • CGPA {currentStudent.cgpa}
              </div>
            </div>
          </div>
        )}

        {activeRole === 'teacher' && (
          <div className="user-badge" style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
            <div className="user-avatar-circle" style={{ backgroundColor: '#111827' }}>
              P
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Prof. K. Sundaram</div>
              <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>
                Dean of Career & Higher Studies
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="badge-notif-btn"
          onClick={onOpenNotifications}
          title="Open Notifications"
        >
          <Bell size={18} />
          <span>Alerts</span>
          {unreadCount > 0 && <span className="unread-pill">{unreadCount}</span>}
        </button>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentProfileForm, { PRESETS } from './components/StudentProfileForm';
import StudentResultsPanel from './components/StudentResultsPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import StudentNotificationsView from './components/StudentNotificationsView';
import PreparationPathwaysCatalog from './components/PreparationPathwaysCatalog';
import TeacherBatchView from './components/TeacherBatchView';
import TeacherAnalyticsView from './components/TeacherAnalyticsView';
import AuditLogViewer from './components/AuditLogViewer';
import PathwayModal from './components/PathwayModal';
import BroadcastModal from './components/BroadcastModal';
import AddStudentModal from './components/AddStudentModal';

import {
  evaluateStudent,
  runBatchEvaluation,
  fetchNotifications,
  sendNotification,
  fetchPathways,
  addStudentToBatch
} from './services/api';

import {
  GraduationCap,
  Users,
  Compass,
  Sliders,
  Bell,
  Cpu,
  TrendingUp,
  FileText,
  AlertTriangle,
  Send
} from 'lucide-react';

import './App.css';

export default function App() {
  // Portal Role: 'student' | 'teacher'
  const [activeRole, setActiveRole] = useState('student');

  // Sub-tabs for Student Portal
  const [studentTab, setStudentTab] = useState('eligibility'); // 'eligibility' | 'pathways' | 'simulator' | 'notifications'

  // Sub-tabs for Teacher Portal
  const [teacherTab, setTeacherTab] = useState('batch'); // 'batch' | 'broadcast' | 'analytics' | 'audit'

  // Student Profile state
  const [currentStudent, setCurrentStudent] = useState({
    id: PRESETS[0].id,
    name: PRESETS[0].name,
    email: 'aarav.sharma@eng.edu',
    age: PRESETS[0].age,
    gender: PRESETS[0].gender,
    branch: PRESETS[0].branch,
    currentYear: PRESETS[0].currentYear,
    cgpa: PRESETS[0].cgpa,
    category: PRESETS[0].category,
    activeBacklogs: PRESETS[0].activeBacklogs,
    tenthPercentage: PRESETS[0].tenthPercentage,
    twelfthPercentage: PRESETS[0].twelfthPercentage,
    degreeCompleted: false
  });

  // Data states
  const [evaluationData, setEvaluationData] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pathwaysData, setPathwaysData] = useState(null);

  // UI state & loaders
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState(null);

  // Modal controls
  const [selectedPathwayCode, setSelectedPathwayCode] = useState(null);
  const [broadcastTarget, setBroadcastTarget] = useState(null); // { students: [], examCode: '' }
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // --- API Actions ---

  const runSingleEvaluation = async (profile) => {
    setLoadingEvaluation(true);
    setError(null);
    try {
      const data = await evaluateStudent(profile);
      setEvaluationData(data);
    } catch (err) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const loadBatchRoster = async () => {
    setLoadingBatch(true);
    try {
      const data = await runBatchEvaluation();
      setBatchData(data);
    } catch (err) {
      console.error('Batch load error:', err);
    } finally {
      setLoadingBatch(false);
    }
  };

  const loadNotifications = async (studentId = null) => {
    try {
      const list = await fetchNotifications(studentId);
      setNotifications(list);
    } catch (err) {
      console.error('Notifications load error:', err);
    }
  };

  const loadPathways = async () => {
    try {
      const data = await fetchPathways();
      setPathwaysData(data);
    } catch (err) {
      console.error('Pathways load error:', err);
    }
  };

  // Initial Data Loading
  useEffect(() => {
    runSingleEvaluation(currentStudent);
    loadBatchRoster();
    loadNotifications(currentStudent.id);
    loadPathways();
  }, []);

  // When student changes preset
  const handlePresetSelect = (preset) => {
    const updated = {
      ...currentStudent,
      id: preset.id,
      name: preset.name,
      email: preset.name.toLowerCase().replace(/\s+/g, '.') + '@univ.edu',
      age: preset.age,
      gender: preset.gender,
      branch: preset.branch,
      currentYear: preset.currentYear,
      cgpa: preset.cgpa,
      category: preset.category,
      activeBacklogs: preset.activeBacklogs,
      tenthPercentage: preset.tenthPercentage,
      twelfthPercentage: preset.twelfthPercentage,
      degreeCompleted: preset.currentYear >= 4
    };
    setCurrentStudent(updated);
    runSingleEvaluation(updated);
    loadNotifications(updated.id);
  };

  const handleStudentFormSubmit = (e) => {
    e.preventDefault();
    runSingleEvaluation(currentStudent);
  };

  const handleApplySimulatedProfile = (updatedProfile) => {
    setCurrentStudent(updatedProfile);
    runSingleEvaluation(updatedProfile);
    setStudentTab('eligibility');
  };

  const handleSendNotification = async (payload) => {
    const res = await sendNotification(payload);
    // Refresh notifications list and batch
    loadNotifications(activeRole === 'student' ? currentStudent.id : null);
    return res;
  };

  const handleAddStudent = async (studentPayload) => {
    await addStudentToBatch(studentPayload);
    // Reload batch data concurrently
    loadBatchRoster();
  };

  return (
    <div className="app-container">
      {/* Flat Design Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={(role) => setActiveRole(role)}
        currentStudent={currentStudent}
        unreadCount={notifications.length}
        onOpenNotifications={() => {
          if (activeRole === 'student') setStudentTab('notifications');
          else setTeacherTab('broadcast');
        }}
        serverStatus="ONLINE"
      />

      {/* Global Error Banner if any */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '20px',
            fontWeight: 700,
            fontSize: '0.88rem'
          }}
        >
          ✕ {error}
        </div>
      )}

      {/* -------------------------------------------------------------
          STUDENT DASHBOARD
          ------------------------------------------------------------- */}
      {activeRole === 'student' && (
        <div>
          {/* Sub Navigation Bar for Students */}
          <nav className="sub-nav-bar">
            <button
              type="button"
              className={`sub-tab-btn ${studentTab === 'eligibility' ? 'active' : ''}`}
              onClick={() => setStudentTab('eligibility')}
            >
              <Compass size={18} />
              Check Eligibility & Results
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${studentTab === 'pathways' ? 'active' : ''}`}
              onClick={() => setStudentTab('pathways')}
            >
              <GraduationCap size={18} />
              Preparation Pathways & Roadmaps
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${studentTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setStudentTab('simulator')}
            >
              <Sliders size={18} />
              "What-If" Eligibility Simulator
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${studentTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setStudentTab('notifications')}
            >
              <Bell size={18} />
              Faculty Announcements ({notifications.length})
            </button>
          </nav>

          {/* Tab 1: Profile + Eligibility Results Grid */}
          {studentTab === 'eligibility' && (
            <div className="dashboard-grid">
              <StudentProfileForm
                student={currentStudent}
                onChange={setCurrentStudent}
                onPresetSelect={handlePresetSelect}
                onSubmit={handleStudentFormSubmit}
                isLoading={loadingEvaluation}
              />
              <StudentResultsPanel
                evaluationData={evaluationData}
                onSelectPathway={(code) => setSelectedPathwayCode(code)}
              />
            </div>
          )}

          {/* Tab 2: Preparation Pathways Catalog */}
          {studentTab === 'pathways' && (
            <PreparationPathwaysCatalog
              pathwaysData={pathwaysData}
              onOpenPathwayModal={(code) => setSelectedPathwayCode(code)}
            />
          )}

          {/* Tab 3: What-If Simulator */}
          {studentTab === 'simulator' && (
            <WhatIfSimulator
              currentStudent={currentStudent}
              onRunEvaluation={(simProfile) => {
                runSingleEvaluation(simProfile);
                setStudentTab('eligibility');
              }}
              onApplySimulation={handleApplySimulatedProfile}
            />
          )}

          {/* Tab 4: Student Notifications Inbox */}
          {studentTab === 'notifications' && (
            <StudentNotificationsView
              notifications={notifications}
              currentStudent={currentStudent}
            />
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TEACHER / FACULTY DASHBOARD
          ------------------------------------------------------------- */}
      {activeRole === 'teacher' && (
        <div>
          {/* Sub Navigation Bar for Teachers */}
          <nav className="sub-nav-bar">
            <button
              type="button"
              className={`sub-tab-btn ${teacherTab === 'batch' ? 'active' : ''}`}
              onClick={() => setTeacherTab('batch')}
            >
              <Cpu size={18} />
              Batch Roster & Multithreaded Engine
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${teacherTab === 'broadcast' ? 'active' : ''}`}
              onClick={() => {
                setTeacherTab('broadcast');
                if (batchData && batchData.students) {
                  setBroadcastTarget({
                    students: batchData.students,
                    examCode: 'ALL'
                  });
                }
              }}
            >
              <Send size={18} />
              Informing & Notifying Students
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${teacherTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setTeacherTab('analytics')}
            >
              <TrendingUp size={18} />
              Batch Analytics & Readiness
            </button>

            <button
              type="button"
              className={`sub-tab-btn ${teacherTab === 'audit' ? 'active' : ''}`}
              onClick={() => setTeacherTab('audit')}
            >
              <FileText size={18} />
              System Audit Trails
            </button>
          </nav>

          {/* Tab 1: Batch Table & Concurrency Stats */}
          {teacherTab === 'batch' && (
            <TeacherBatchView
              batchData={batchData}
              onRefreshBatch={loadBatchRoster}
              onOpenBroadcast={(filteredList, examCode) => {
                setBroadcastTarget({
                  students: filteredList,
                  examCode: examCode
                });
              }}
              onOpenAddStudent={() => setShowAddStudentModal(true)}
              isLoading={loadingBatch}
            />
          )}

          {/* Tab 2: Broadcast Notice Dispatcher */}
          {teacherTab === 'broadcast' && (
            <div>
              <div className="flat-card" style={{ marginBottom: '20px' }}>
                <div className="card-title-bar">
                  <h3>
                    <Send size={20} color="#3b82f6" />
                    Faculty Notice & Recommendation Dispatcher
                  </h3>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setBroadcastTarget({
                        students: batchData ? batchData.students : [],
                        examCode: 'ALL'
                      });
                    }}
                  >
                    Compose New Broadcast Notice
                  </button>
                </div>
                <p style={{ color: '#4b5563', fontSize: '0.92rem' }}>
                  Send targeted announcements to students based on exam eligibility, academic achievements, or backlog remediation. All broadcasts are saved directly to Java file storage (<code>data/notifications.json</code>).
                </p>
              </div>

              {/* Show recent broadcast notices list */}
              <StudentNotificationsView
                notifications={notifications}
                currentStudent={{ name: 'Faculty Admin Broadcast Trail' }}
              />
            </div>
          )}

          {/* Tab 3: Batch Analytics & Insights */}
          {teacherTab === 'analytics' && (
            <TeacherAnalyticsView batchData={batchData} />
          )}

          {/* Tab 4: System Audit Trail */}
          {teacherTab === 'audit' && <AuditLogViewer />}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODALS
          ------------------------------------------------------------- */}
      {/* 1. Preparation Pathway Modal */}
      {selectedPathwayCode && (
        <PathwayModal
          examCode={selectedPathwayCode}
          pathwayData={pathwaysData}
          onClose={() => setSelectedPathwayCode(null)}
        />
      )}

      {/* 2. Broadcast / Notification Composer Modal */}
      {broadcastTarget && (
        <BroadcastModal
          targetStudents={broadcastTarget.students}
          initialExamCode={broadcastTarget.examCode}
          onClose={() => setBroadcastTarget(null)}
          onSendNotification={handleSendNotification}
        />
      )}

      {/* 3. Add Student to Batch Modal */}
      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onAddStudent={handleAddStudent}
        />
      )}
    </div>
  );
}

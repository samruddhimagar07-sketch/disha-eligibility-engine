import React, { useState, useEffect, useRef, useMemo } from 'react';
import { scopeEvaluationToStream, scopePathwaysToExams } from './utils/streamScope';
import AppShell from './components/AppShell';
import StudentOverview from './components/StudentOverview';
import StudentProfileForm from './components/StudentProfileForm';
import StudentWelcome, { ProfileRequired } from './components/StudentWelcome';
import { EMPTY_DRAFT, buildPayload, toDraft } from './utils/studentProfile';
import StudentResultsPanel from './components/StudentResultsPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import StudentNotificationsView from './components/StudentNotificationsView';
import PreparationPathwaysCatalog from './components/PreparationPathwaysCatalog';
import TeacherBatchView from './components/TeacherBatchView';
import TeacherAnalyticsView from './components/TeacherAnalyticsView';
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

import { Icon } from './components/Icon';

import './App.css';

export default function App() {
  // Portal Role: 'student' | 'teacher'
  const [activeRole, setActiveRole] = useState('student');

  // Sub-tabs for Student Portal
  const [studentTab, setStudentTab] = useState('eligibility'); // 'eligibility' | 'pathways' | 'simulator' | 'notifications'

  // Sub-tabs for Teacher Portal
  const [teacherTab, setTeacherTab] = useState('batch'); // 'batch' | 'broadcast' | 'analytics'

  // Student profile: the form draft, and the submitted profile (null until the student submits)
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Data states
  const [evaluationData, setEvaluationData] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [notifications, setNotifications] = useState([]); // this student's announcements
  const [allNotifications, setAllNotifications] = useState([]); // faculty broadcast trail
  const [pathwaysData, setPathwaysData] = useState(null);

  // UI state & loaders
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState(null);

  // Modal controls
  const [selectedPathwayCode, setSelectedPathwayCode] = useState(null);
  const [broadcastTarget, setBroadcastTarget] = useState(null); // { students: [], examCode: '' }
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Student only sees exams/pathways that apply to their own stream
  const scopedEvaluation = useMemo(() => scopeEvaluationToStream(evaluationData), [evaluationData]);
  const scopedPathways = useMemo(
    () => scopePathwaysToExams(pathwaysData, scopedEvaluation),
    [pathwaysData, scopedEvaluation]
  );

  const matrixRef = useRef(null);
  const scrollToMatrix = () =>
    matrixRef.current && matrixRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  const loadStudentNotifications = async (studentId) => {
    try {
      setNotifications(await fetchNotifications(studentId));
    } catch (err) {
      console.error('Notifications load error:', err);
    }
  };

  const loadAllNotifications = async () => {
    try {
      setAllNotifications(await fetchNotifications(null));
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

  // Initial data loading (no student is evaluated until they submit their details)
  useEffect(() => {
    loadBatchRoster();
    loadAllNotifications();
    loadPathways();
  }, []);

  // Validate the draft, commit it as the student's profile and evaluate
  const submitProfile = (values) => {
    const payload = buildPayload(values);
    if (!payload) return false;
    setCurrentStudent(payload);
    runSingleEvaluation(payload);
    loadStudentNotifications(payload.id);
    return true;
  };

  const handleStudentFormSubmit = (e) => {
    e.preventDefault();
    submitProfile(draft);
  };

  const handleApplySimulatedProfile = (updatedProfile) => {
    setCurrentStudent(updatedProfile);
    setDraft(toDraft(updatedProfile));
    runSingleEvaluation(updatedProfile);
    setStudentTab('eligibility');
  };

  const handleSendNotification = async (payload) => {
    const res = await sendNotification(payload);
    loadAllNotifications();
    if (currentStudent) loadStudentNotifications(currentStudent.id);
    return res;
  };

  const handleAddStudent = async (studentPayload) => {
    await addStudentToBatch(studentPayload);
    // Reload batch data concurrently
    loadBatchRoster();
  };

  // ---- Navigation model (drives sidebar + pill nav) ----
  const STUDENT_TABS = [
    { key: 'eligibility', label: 'Dashboard' },
    { key: 'pathways', label: 'Prep Pathways' },
    { key: 'simulator', label: 'What-If Simulator' },
    { key: 'notifications', label: currentStudent ? `Announcements (${notifications.length})` : 'Announcements' }
  ];
  const TEACHER_TABS = [
    { key: 'batch', label: 'Batch Roster' },
    { key: 'broadcast', label: 'Notices' },
    { key: 'analytics', label: 'Batch Analytics' }
  ];

  const isStudent = activeRole === 'student';
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeRole, studentTab, teacherTab]);
  const tabs = isStudent ? STUDENT_TABS : TEACHER_TABS;
  const activeTab = isStudent ? studentTab : teacherTab;

  const handleTabChange = (key) => {
    if (isStudent) {
      setStudentTab(key);
      return;
    }
    setTeacherTab(key);
    if (key === 'broadcast' && batchData && batchData.students) {
      setBroadcastTarget({ students: batchData.students, examCode: 'ALL' });
    }
  };

  const sidebarItems = [
    { key: 's-dash', role: 'student', tab: 'eligibility', icon: 'stars', title: 'Student Dashboard' },
    { key: 't-dash', role: 'teacher', tab: 'batch', icon: 'bar_chart', title: 'Faculty Dashboard' },
    { key: 's-path', role: 'student', tab: 'pathways', icon: 'alt_route', title: 'Prep Pathways' },
    { key: 't-notices', role: 'teacher', tab: 'broadcast', icon: 'campaign', title: 'Notices' }
  ].map((i) => ({ ...i, active: activeRole === i.role && activeTab === i.tab }));

  const handleSidebarSelect = (item) => {
    setActiveRole(item.role);
    if (item.role === 'student') setStudentTab(item.tab);
    else setTeacherTab(item.tab);
  };

  return (
    <AppShell
      activeRole={activeRole}
      activeTab={activeTab}
      tabs={tabs}
      sidebarItems={sidebarItems}
      onSidebarSelect={handleSidebarSelect}
      onTabChange={handleTabChange}
      currentStudent={currentStudent}
      batchCount={batchData ? batchData.totalStudents : null}
      notificationCount={isStudent ? (currentStudent ? notifications.length : 0) : allNotifications.length}
      onOpenNotifications={() => {
        if (isStudent) setStudentTab('notifications');
        else setTeacherTab('broadcast');
      }}
    >
      {error && (
        <div className="flex items-center gap-space-sm rounded bg-error-container px-space-md py-space-sm text-label-lg font-bold normal-case tracking-normal text-on-error-container">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      {/* ======================= STUDENT ======================= */}
      {isStudent && studentTab === 'eligibility' && !currentStudent && (
        <div className="grid grid-cols-1 items-stretch gap-space-lg xl:grid-cols-[1fr_460px]">
          <StudentWelcome />
          <StudentProfileForm
            student={draft}
            onChange={setDraft}
            onSubmit={handleStudentFormSubmit}
            isLoading={loadingEvaluation}
            submitted={false}
          />
        </div>
      )}

      {isStudent && studentTab === 'eligibility' && currentStudent && (
        <>
          <StudentOverview
            evaluationData={scopedEvaluation}
            student={currentStudent}
            onViewMatrix={scrollToMatrix}
            onOpenPathways={() => setStudentTab('pathways')}
          />
          <div ref={matrixRef} className="dashboard-grid scroll-mt-24">
            <StudentProfileForm
              student={draft}
              onChange={setDraft}
              onSubmit={handleStudentFormSubmit}
              onBranchSelect={(branch) => submitProfile({ ...draft, branch })}
              isLoading={loadingEvaluation}
              submitted
            />
            <StudentResultsPanel
              evaluationData={scopedEvaluation}
              onSelectPathway={(code) => setSelectedPathwayCode(code)}
            />
          </div>
        </>
      )}

      {isStudent && studentTab !== 'eligibility' && !currentStudent && (
        <ProfileRequired onGo={() => setStudentTab('eligibility')} />
      )}

      {isStudent && currentStudent && studentTab === 'pathways' && (
        <PreparationPathwaysCatalog
          pathwaysData={scopedPathways}
          onOpenPathwayModal={(code) => setSelectedPathwayCode(code)}
        />
      )}

      {isStudent && currentStudent && studentTab === 'simulator' && (
        <WhatIfSimulator
          currentStudent={currentStudent}
          onRunEvaluation={(simProfile) => {
            runSingleEvaluation(simProfile);
            setStudentTab('eligibility');
          }}
          onApplySimulation={handleApplySimulatedProfile}
        />
      )}

      {isStudent && currentStudent && studentTab === 'notifications' && (
        <StudentNotificationsView notifications={notifications} currentStudent={currentStudent} />
      )}

      {/* ======================= FACULTY ======================= */}
      {!isStudent && teacherTab === 'batch' && (
        <TeacherBatchView
          batchData={batchData}
          onRefreshBatch={loadBatchRoster}
          onOpenBroadcast={(filteredList, examCode) =>
            setBroadcastTarget({ students: filteredList, examCode })
          }
          onOpenAddStudent={() => setShowAddStudentModal(true)}
          isLoading={loadingBatch}
        />
      )}

      {!isStudent && teacherTab === 'broadcast' && (
        <>
          <div className="flat-card">
            <div className="card-title-bar">
              <h3>
                <Icon name="send" size={20} color="#005a69" />
                Faculty Notice & Recommendation Dispatcher
              </h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  setBroadcastTarget({
                    students: batchData ? batchData.students : [],
                    examCode: 'ALL'
                  })
                }
              >
                Compose New Broadcast Notice
              </button>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Send targeted announcements to students based on exam eligibility, academic achievements, or backlog
              remediation. Every notice appears instantly in the selected students' announcement inbox.
            </p>
          </div>
          <StudentNotificationsView
            notifications={allNotifications}
            currentStudent={{ name: 'Faculty Admin Broadcast Trail' }}
          />
        </>
      )}

      {!isStudent && teacherTab === 'analytics' && <TeacherAnalyticsView batchData={batchData} />}

      {/* ======================= MODALS ======================= */}
      {selectedPathwayCode && (
        <PathwayModal
          examCode={selectedPathwayCode}
          pathwayData={scopedPathways}
          onClose={() => setSelectedPathwayCode(null)}
        />
      )}

      {broadcastTarget && (
        <BroadcastModal
          targetStudents={broadcastTarget.students}
          initialExamCode={broadcastTarget.examCode}
          onClose={() => setBroadcastTarget(null)}
          onSendNotification={handleSendNotification}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onAddStudent={handleAddStudent}
        />
      )}
    </AppShell>
  );
}

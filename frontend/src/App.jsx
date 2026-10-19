import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentForm, { PRESETS } from './components/StudentForm';
import ResultsPanel from './components/ResultsPanel';
import BatchProcessor from './components/BatchProcessor';
import ExamCatalog from './components/ExamCatalog';
import AuditLogViewer from './components/AuditLogViewer';
import { evaluateStudent } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator');
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

  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runEvaluation = async (profile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateStudent(profile);
      setEvaluationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial evaluation with Aarav Sharma profile
    runEvaluation(currentStudent);
  }, []);

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
    runEvaluation(updated);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runEvaluation(currentStudent);
  };

  return (
    <div className="app-container">
      <Header />

      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'evaluator' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluator')}
        >
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Student Evaluation
        </button>
        <button
          className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          <svg className="icon" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Multithreaded Batch (CSV)
        </button>
        <button
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10M6 10h10" />
          </svg>
          Exam Catalog & Cutoffs
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Audit Log Trail
        </button>
      </nav>

      {error && (
        <div style={{
          padding: '12px 18px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.86rem'
        }}>
          {error}
        </div>
      )}

      {activeTab === 'evaluator' && (
        <div className="evaluator-grid">
          <StudentForm
            student={currentStudent}
            onChange={setCurrentStudent}
            onPresetSelect={handlePresetSelect}
            onSubmit={handleFormSubmit}
            isLoading={loading}
          />
          <ResultsPanel data={evaluationData} />
        </div>
      )}

      {activeTab === 'batch' && <BatchProcessor />}

      {activeTab === 'catalog' && <ExamCatalog />}

      {activeTab === 'logs' && <AuditLogViewer />}
    </div>
  );
}

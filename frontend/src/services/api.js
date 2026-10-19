// Disha REST API Service Layer

const API_BASE = ''; // Same-origin or Vite dev proxy to :8080

export async function fetchExams() {
  const response = await fetch(`${API_BASE}/api/exams`);
  if (!response.ok) throw new Error('Failed to load examination catalog');
  return response.json();
}

export async function evaluateStudent(studentProfile) {
  const response = await fetch(`${API_BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentProfile)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Evaluation failed on server');
  }
  return response.json();
}

export async function runBatchEvaluation() {
  const response = await fetch(`${API_BASE}/api/batch-sample`);
  if (!response.ok) throw new Error('Multithreaded batch evaluation failed');
  return response.json();
}

export async function addStudentToBatch(studentData) {
  const response = await fetch(`${API_BASE}/api/batch-add-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add student to batch');
  }
  return response.json();
}

export async function fetchNotifications(studentId = null) {
  const url = studentId ? `${API_BASE}/api/notifications?studentId=${encodeURIComponent(studentId)}` : `${API_BASE}/api/notifications`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

export async function sendNotification(notificationPayload) {
  const response = await fetch(`${API_BASE}/api/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationPayload)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send notification');
  }
  return response.json();
}

export async function fetchPathways() {
  const response = await fetch(`${API_BASE}/api/pathways`);
  if (!response.ok) throw new Error('Failed to load preparation pathways');
  return response.json();
}

export async function fetchDemoProfiles() {
  const response = await fetch(`${API_BASE}/api/demo-profiles`);
  if (!response.ok) throw new Error('Failed to load demo student profiles');
  return response.json();
}

export async function fetchAuditLogs() {
  const response = await fetch(`${API_BASE}/api/logs`);
  if (!response.ok) throw new Error('Failed to fetch audit log trail');
  return response.json();
}

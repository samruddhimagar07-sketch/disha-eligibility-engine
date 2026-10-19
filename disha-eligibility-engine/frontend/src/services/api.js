// Disha REST API Service Layer

const API_BASE = ''; // Relies on Vite proxy or same-origin in production

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

export async function fetchAuditLogs() {
  const response = await fetch(`${API_BASE}/api/logs`);
  if (!response.ok) throw new Error('Failed to fetch audit log trail');
  return response.json();
}

// Disha Frontend Engine Controller

const API_BASE = window.location.origin;

const PRESETS = [
  {
    id: "DEMO-01",
    name: "Aarav Sharma",
    age: 20,
    gender: "MALE",
    branch: "IT",
    currentYear: 2,
    cgpa: 8.50,
    category: "GENERAL",
    activeBacklogs: 0,
    tenthPercentage: 91.5,
    twelfthPercentage: 89.0,
    notes: "2nd-Year IT (High CGPA, 0 Backlogs)"
  },
  {
    id: "DEMO-02",
    name: "Diya Patel",
    age: 20,
    gender: "FEMALE",
    branch: "IT",
    currentYear: 2,
    cgpa: 6.80,
    category: "OBC_NCL",
    activeBacklogs: 2,
    tenthPercentage: 84.0,
    twelfthPercentage: 82.5,
    notes: "2nd-Year IT (Arrears, OBC-NCL)"
  },
  {
    id: "DEMO-03",
    name: "Rohan Verma",
    age: 22,
    gender: "MALE",
    branch: "CSE",
    currentYear: 4,
    cgpa: 6.20,
    category: "GENERAL",
    activeBacklogs: 2,
    tenthPercentage: 78.0,
    twelfthPercentage: 75.0,
    notes: "4th-Year CS (Borderline CGPA)"
  },
  {
    id: "DEMO-04",
    name: "Ananya Iyer",
    age: 21,
    gender: "FEMALE",
    branch: "ME",
    currentYear: 3,
    cgpa: 9.10,
    category: "GENERAL",
    activeBacklogs: 0,
    tenthPercentage: 94.0,
    twelfthPercentage: 92.0,
    notes: "3rd-Year ME (9.1 CGPA, Core)"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderPresetChips();
  loadExamCatalog();
  // Trigger initial evaluation for default preset (Aarav Sharma)
  applyPreset(PRESETS[0]);
});

function switchTab(tabId) {
  const views = ["evaluator", "batch", "catalog", "logs"];
  views.forEach(v => {
    const el = document.getElementById(v + "View");
    const btn = document.getElementById("tab" + capitalize(v) + "Btn");
    if (el) el.style.display = (v === tabId) ? (v === "evaluator" ? "grid" : "block") : "none";
    if (btn) {
      if (v === tabId) btn.classList.add("active");
      else btn.classList.remove("active");
    }
  });

  if (tabId === "batch") loadBatchSample();
  if (tabId === "catalog") loadExamCatalog();
  if (tabId === "logs") loadAuditLogs();
}

function renderPresetChips() {
  const container = document.getElementById("presetsGrid");
  if (!container) return;

  container.innerHTML = PRESETS.map((p, idx) => `
    <div class="preset-chip" onclick="applyPreset(PRESETS[${idx}])">
      <span class="preset-name">${escapeHtml(p.name)}</span>
      <span class="preset-meta">${escapeHtml(p.notes)}</span>
    </div>
  `).join("");
}

function applyPreset(preset) {
  document.getElementById("inpName").value = preset.name;
  document.getElementById("inpAge").value = preset.age;
  document.getElementById("inpGender").value = preset.gender;
  document.getElementById("inpBranch").value = preset.branch;
  document.getElementById("inpYear").value = preset.currentYear;
  document.getElementById("inpCgpa").value = preset.cgpa.toFixed(2);
  document.getElementById("inpCategory").value = preset.category;
  document.getElementById("inpBacklogs").value = preset.activeBacklogs;
  document.getElementById("inpTenth").value = preset.tenthPercentage;
  document.getElementById("inpTwelfth").value = preset.twelfthPercentage;

  triggerEvaluation(buildStudentPayloadFromForm(preset.id));
}

function buildStudentPayloadFromForm(presetId) {
  return {
    id: presetId || "WEB-" + Math.floor(Math.random() * 9000 + 1000),
    name: document.getElementById("inpName").value.trim(),
    email: document.getElementById("inpName").value.toLowerCase().replace(/\s+/g, ".") + "@univ.edu",
    age: parseInt(document.getElementById("inpAge").value, 10),
    gender: document.getElementById("inpGender").value,
    branch: document.getElementById("inpBranch").value,
    currentYear: parseInt(document.getElementById("inpYear").value, 10),
    cgpa: parseFloat(document.getElementById("inpCgpa").value),
    category: document.getElementById("inpCategory").value,
    activeBacklogs: parseInt(document.getElementById("inpBacklogs").value, 10),
    tenthPercentage: parseFloat(document.getElementById("inpTenth").value || "80"),
    twelfthPercentage: parseFloat(document.getElementById("inpTwelfth").value || "80"),
    degreeCompleted: parseInt(document.getElementById("inpYear").value, 10) >= 4
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  triggerEvaluation(buildStudentPayloadFromForm());
}

async function triggerEvaluation(payload) {
  const btn = document.getElementById("btnEvaluate");
  btn.disabled = true;
  btn.style.opacity = "0.7";

  try {
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Evaluation failed");
      return;
    }

    const data = await res.json();
    renderEvaluationResults(data);
  } catch (err) {
    console.error("API error:", err);
    alert("Could not connect to Disha Java Backend. Please verify the server is running on http://localhost:8080");
  } finally {
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

function renderEvaluationResults(data) {
  const { student, results, summary } = data;

  // 1. Update summary strip
  document.getElementById("summaryStudentName").innerText = student.name;
  document.getElementById("summaryStudentMeta").innerText =
    `${student.branchDisplay} \u2022 Year ${student.currentYear} \u2022 CGPA ${student.cgpa.toFixed(2)} (${student.approxPercentage}%) \u2022 ${student.activeBacklogs} Active Backlog(s)`;

  document.getElementById("badgeEligibleCount").innerText = summary.eligibleCount;
  document.getElementById("badgeShortfallCount").innerText = summary.shortfallCount;

  // 2. Separate eligible vs shortfall
  const eligibleList = results.filter(r => r.isEligible);
  const shortfallList = results.filter(r => !r.isEligible);

  document.getElementById("eligibleSectionMeta").innerText = `${eligibleList.length} of ${results.length} qualified`;
  document.getElementById("shortfallSectionMeta").innerText = `${shortfallList.length} requiring remediation`;

  // 3. Render Eligible Cards
  const eligibleContainer = document.getElementById("eligibleCardsGrid");
  if (eligibleList.length === 0) {
    eligibleContainer.innerHTML = `
      <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: var(--text-subtle); background: #ffffff; border-radius: 8px; border: 1px dashed var(--border-glass);">
        No direct pathways currently available based on candidate's current semester/metrics. Review shortfalls below.
      </div>`;
  } else {
    eligibleContainer.innerHTML = eligibleList.map(item => `
      <div class="pathway-card is-eligible">
        <div>
          <div class="card-header">
            <span class="exam-code">${escapeHtml(item.examCode)}</span>
            <span class="badge-tag badge-eligible">Eligible</span>
          </div>
          <h3 class="exam-title">${escapeHtml(item.examName)}</h3>
          <div class="exam-meta">
            Cutoff: <strong>${item.minCgpaCutoff.toFixed(2)}</strong> \u2022 Student: <strong>${item.studentCgpa.toFixed(2)}</strong>
          </div>
        </div>
        <div class="advice-box">
          <svg class="icon" style="color: #10b981; margin-right: 4px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          ${escapeHtml(item.primaryAdvice)}
        </div>
      </div>
    `).join("");
  }

  // 4. Render Shortfall Cards
  const shortfallContainer = document.getElementById("shortfallCardsGrid");
  if (shortfallList.length === 0) {
    shortfallContainer.innerHTML = `
      <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: var(--text-subtle); background: #ffffff; border-radius: 8px; border: 1px dashed var(--border-glass);">
        Candidate satisfies all registered pathways without shortfalls.
      </div>`;
  } else {
    shortfallContainer.innerHTML = shortfallList.map(item => `
      <div class="pathway-card is-shortfall">
        <div>
          <div class="card-header">
            <span class="exam-code">${escapeHtml(item.examCode)}</span>
            <span class="badge-tag badge-shortfall">${item.shortfalls.length} Shortfall${item.shortfalls.length > 1 ? 's' : ''}</span>
          </div>
          <h3 class="exam-title">${escapeHtml(item.examName)}</h3>
          <div class="exam-meta">
            Cutoff: <strong>${item.minCgpaCutoff.toFixed(2)}</strong> \u2022 Student: <strong>${item.studentCgpa.toFixed(2)}</strong>
          </div>

          <ul class="shortfall-list">
            ${item.shortfalls.map(sf => `
              <li class="shortfall-item">
                <div class="shortfall-param">
                  <span>${escapeHtml(sf.parameter)}</span>
                  <span style="font-weight: normal; color: var(--text-subtle);">Actual: ${escapeHtml(sf.actualValue)}</span>
                </div>
                <div class="shortfall-val">Requires: ${escapeHtml(sf.requiredCriteria)}</div>
                <div class="shortfall-action">\u2192 ${escapeHtml(sf.actionableAdvice)}</div>
              </li>
            `).join("")}
          </ul>
        </div>

        <div class="advice-box" style="background: #fffbeb; border-color: #fde68a; color: #92400e;">
          ${escapeHtml(item.primaryAdvice)}
        </div>
      </div>
    `).join("");
  }
}

async function loadBatchSample() {
  const tbody = document.getElementById("batchTableBody");
  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Running multithreaded evaluation across worker pool...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/api/batch-sample`);
    const data = await res.json();

    document.getElementById("batchMetricStudents").innerText = data.totalStudents;
    document.getElementById("batchMetricEvaluated").innerText = data.totalEvaluated;
    document.getElementById("batchMetricDuration").innerText = `${data.durationMillis} ms`;
    document.getElementById("batchMetricThreads").innerText = `${data.threadsUsed} Threads`;

    tbody.innerHTML = data.students.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.id)}</strong></td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.branch)}</td>
        <td>Year ${s.year}</td>
        <td><strong>${s.cgpa.toFixed(2)}</strong></td>
        <td>${s.activeBacklogs}</td>
        <td><span class="badge-tag badge-eligible">${s.eligibleCount} Eligible</span></td>
        <td><span class="badge-tag badge-shortfall">${s.shortfallCount} Shortfall</span></td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Batch error:", err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Failed to execute batch: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function loadExamCatalog() {
  const tbody = document.getElementById("catalogTableBody");
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/api/exams`);
    const exams = await res.json();

    tbody.innerHTML = exams.map(e => `
      <tr>
        <td><span class="exam-code">${escapeHtml(e.code)}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--brand-navy);">${escapeHtml(e.name)}</div>
          <div style="font-size: 0.74rem; color: var(--text-subtle);">${escapeHtml(e.description)}</div>
        </td>
        <td><span style="font-size: 0.74rem; font-weight: 600; color: var(--text-muted);">${escapeHtml(e.categoryTitle)}</span></td>
        <td>${escapeHtml(e.conductingBody)}</td>
        <td>Year ${e.minEligibleYear}+</td>
        <td>${e.baseMinCgpa.toFixed(2)}</td>
        <td>${e.baseMaxAge} yrs</td>
        <td>${e.maxAllowedBacklogs}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Catalog load error:", err);
  }
}

async function loadAuditLogs() {
  const pre = document.getElementById("logContent");
  pre.innerText = "Fetching latest server audit log transactions...";

  try {
    const res = await fetch(`${API_BASE}/api/logs`);
    const data = await res.json();
    if (data.logs && data.logs.length > 0) {
      pre.innerText = data.logs.join("\n");
      pre.scrollTop = pre.scrollHeight;
    } else {
      pre.innerText = "No audit log entries recorded yet.";
    }
  } catch (err) {
    pre.innerText = "Could not fetch audit logs: " + err.message;
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

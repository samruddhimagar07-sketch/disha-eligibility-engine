/**
 * Stream (branch) scoping for the student view.
 *
 * The engine already reports a stream restriction as a shortfall
 * ("Academic Branch" for branch-restricted exams, "Degree Type" for
 * engineering-only exams). An exam that fails on either of those is not
 * meant for the student's stream at all, so it is hidden from the student
 * instead of being shown as an "unmet criteria" card.
 */
const STREAM_RULES = new Set(['Academic Branch', 'Degree Type']);

export const isOutsideStream = (result) =>
  Array.isArray(result.shortfalls) && result.shortfalls.some((s) => STREAM_RULES.has(s.parameter));

export function scopeEvaluationToStream(data) {
  if (!data || !Array.isArray(data.results)) return data;
  const results = data.results.filter((r) => !isOutsideStream(r));
  const eligibleCount = results.filter((r) => r.isEligible).length;
  return {
    ...data,
    results,
    hiddenCount: data.results.length - results.length,
    summary: {
      ...data.summary,
      totalExams: results.length,
      eligibleCount,
      shortfallCount: results.length - eligibleCount
    }
  };
}

export function scopePathwaysToExams(pathwaysData, scopedEvaluation) {
  if (!pathwaysData || !scopedEvaluation || !Array.isArray(scopedEvaluation.results)) return pathwaysData;
  const allowed = new Set(scopedEvaluation.results.map((r) => r.examCode));
  return Object.fromEntries(Object.entries(pathwaysData).filter(([code]) => allowed.has(code)));
}

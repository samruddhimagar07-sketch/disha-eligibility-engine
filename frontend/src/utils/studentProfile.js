/** Blank draft shown to a new student — nothing is pre-filled. */
export const EMPTY_DRAFT = {
  id: '',
  name: '',
  age: '',
  gender: '',
  branch: '',
  currentYear: '',
  cgpa: '',
  category: '',
  activeBacklogs: '',
  tenthPercentage: '',
  twelfthPercentage: ''
};

const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

/** Turn the form draft into the numeric payload the API expects (or null if incomplete). */
export function buildPayload(d) {
  const p = {
    id: String(d.id || '').trim(),
    name: String(d.name || '').trim(),
    age: parseInt(d.age, 10),
    gender: d.gender,
    branch: d.branch,
    currentYear: parseInt(d.currentYear, 10),
    cgpa: num(d.cgpa),
    category: d.category,
    activeBacklogs: parseInt(d.activeBacklogs, 10),
    tenthPercentage: num(d.tenthPercentage),
    twelfthPercentage: num(d.twelfthPercentage)
  };
  const complete =
    p.id && p.name && p.gender && p.branch && p.category &&
    [p.age, p.currentYear, p.cgpa, p.activeBacklogs, p.tenthPercentage, p.twelfthPercentage].every(Number.isFinite);
  if (!complete) return null;
  return {
    ...p,
    email: p.name.toLowerCase().replace(/\s+/g, '.') + '@univ.edu',
    degreeCompleted: p.currentYear >= 4
  };
}

/** Back to string form values (used when a simulated profile is applied). */
export function toDraft(profile) {
  const d = { ...EMPTY_DRAFT };
  Object.keys(d).forEach((k) => {
    if (profile[k] !== undefined && profile[k] !== null) d[k] = String(profile[k]);
  });
  return d;
}

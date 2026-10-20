import React from 'react';
import { Icon } from './Icon';

const CATEGORY_LABELS = {
  CIVIL_SERVICES: 'Civil Services',
  MANAGEMENT: 'Management',
  DEFENCE: 'Defence',
  TECHNICAL: 'Technical & PSU',
  HIGHER_STUDIES_ABROAD: 'Studies Abroad',
  GOVERNMENT_BANKING: 'Govt & Banking'
};

const initials = (code = '') => code.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || '··';
const TONES = [
  'bg-primary-fixed text-primary',
  'bg-secondary-fixed text-secondary',
  'bg-surface-variant text-primary',
  'bg-tertiary-fixed text-tertiary'
];

/**
 * Dashboard overview in the EligiPath layout:
 * gradient hero + apricot gauge card, then three balanced insight cards.
 * Every figure is derived from the live evaluation result.
 */
export default function StudentOverview({ evaluationData, student, onViewMatrix, onOpenPathways }) {
  if (!evaluationData || !evaluationData.results) {
    return (
      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <div className="flex min-h-[260px] items-center justify-center rounded-lg bg-gradient-to-r from-[#175c6c] via-[#2a7b8e] to-[#edd3be] p-space-xl text-white lg:col-span-7">
          <span className="text-label-lg uppercase tracking-widest text-white/80">Evaluating profile…</span>
        </div>
        <div className="min-h-[260px] rounded-lg bg-[#fce7d6] lg:col-span-5" />
      </div>
    );
  }

  const { results, summary } = evaluationData;
  const cgpa = Number(student.cgpa) || 0;
  const total = summary.totalExams || results.length || 1;
  const eligible = summary.eligibleCount ?? results.filter((r) => r.isEligible).length;
  const pct = Math.round((eligible / total) * 100);
  const backlogs = Number(student.activeBacklogs) || 0;

  // Gauge geometry (semi-circle, radius 40, centre 50,50)
  const phi = (Math.PI * pct) / 100;
  const needle = { x: 50 - 40 * Math.cos(phi), y: 50 - 40 * Math.sin(phi) };

  const eligibleList = results.filter((r) => r.isEligible);
  const named = eligibleList.slice(0, 2).map((r) => r.examCode);

  // Cutoff benchmark — one exam per category first, then fill up to six
  const picked = [];
  const seen = new Set();
  results.forEach((r) => {
    if (!seen.has(r.examCategory) && picked.length < 6) {
      seen.add(r.examCategory);
      picked.push(r);
    }
  });
  results.forEach((r) => {
    if (picked.length < 6 && !picked.includes(r)) picked.push(r);
  });

  // Top matched exams — eligible first, then by CGPA margin
  const ranked = [...results]
    .map((r) => ({ ...r, margin: cgpa - (Number(r.minCgpaCutoff) || 0) }))
    .sort((a, b) => Number(b.isEligible) - Number(a.isEligible) || b.margin - a.margin)
    .slice(0, 5);

  // Category readiness
  const byCategory = {};
  results.forEach((r) => {
    const c = (byCategory[r.examCategory] ||= { total: 0, ok: 0 });
    c.total += 1;
    if (r.isEligible) c.ok += 1;
  });

  return (
    <>
      {/* ---------------- Hero row ---------------- */}
      <div className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-12">
        {/* Gradient hero */}
        <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-r from-[#175c6c] via-[#2a7b8e] to-[#edd3be] p-space-xl shadow-sm lg:col-span-7">
          <Icon
            name="school"
            size={220}
            color="#ffffff"
            className="pointer-events-none absolute -bottom-10 right-4 hidden opacity-[0.12] sm:block"
          />
          <div className="relative z-10 flex flex-col gap-space-xs">
            <span className="text-label-md uppercase tracking-widest text-white/80">Eligible Exam Programs</span>
            <div className="flex items-baseline gap-space-xs">
              <span className="text-headline-xl font-bold tracking-tight text-white drop-shadow-sm">
                {eligible}/{total}
              </span>
              <span className="ml-1 text-label-lg font-medium text-white/90">Qualified</span>
            </div>
          </div>

          <div className="relative z-10 mt-space-md flex items-end justify-between">
            <div className="flex flex-col gap-space-sm">
              <div className="inline-flex items-center gap-space-sm rounded-full bg-black/15 px-space-md py-space-xs text-white backdrop-blur-md">
                <Icon name="school" size={18} color="#ffdcbf" />
                <span className="text-label-md">
                  Academic Index: <span className="font-bold">{cgpa.toFixed(2)} CGPA</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-space-sm rounded-full bg-black/15 px-space-md py-space-xs text-white backdrop-blur-md">
                <Icon name="verified" size={18} color="#abedff" />
                <span className="text-label-md">
                  Backlog Standing:{' '}
                  <span className={`font-bold ${backlogs === 0 ? 'text-emerald-300' : 'text-[#ffdcbf]'}`}>
                    {backlogs === 0 ? '0 Clean' : `${backlogs} Active`}
                  </span>
                </span>
              </div>
              <div className="inline-flex items-center gap-space-sm rounded-full bg-black/15 px-space-md py-space-xs text-white backdrop-blur-md">
                <Icon name="badge" size={18} color="#ffdcbf" />
                <span className="text-label-md">
                  {student.name} • Yr {student.currentYear} • {student.branch}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-20 -mb-space-xl -mr-space-xl flex justify-end pt-space-md">
            <button
              type="button"
              onClick={onViewMatrix}
              className="inline-flex items-center gap-space-sm rounded-tl-lg bg-primary px-space-xl py-space-md text-label-lg uppercase tracking-wider text-on-primary shadow-[0_8px_20px_-4px_rgba(0,90,105,0.4)] transition-all hover:bg-primary-container"
            >
              <span>View Full Matrix</span>
              <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        </div>

        {/* Apricot gauge card */}
        <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-lg bg-[#fce7d6] p-space-xl shadow-sm lg:col-span-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-label-md font-semibold text-on-surface-variant">Admission Readiness Rate</span>
              <div className="mt-space-xs flex items-baseline">
                <span className="text-headline-xl font-bold tracking-tight text-on-surface">
                  {pct}
                  <span className="text-headline-md text-secondary">%</span>
                </span>
                <span className="ml-space-xs inline-flex items-center rounded-full bg-white/70 px-1.5 py-0.5 text-label-sm font-bold text-emerald-700">
                  {eligible} of {total}
                </span>
              </div>
            </div>
            <div className="relative flex h-20 w-28 items-center justify-center">
              <svg className="h-20 w-28 overflow-visible" viewBox="0 0 100 60" aria-label={`${pct}% ready`}>
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eed1bc" strokeLinecap="round" strokeWidth="8" />
                {pct > 0 && (
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#fea443"
                    strokeLinecap="round"
                    strokeWidth="8"
                    pathLength="100"
                    strokeDasharray={`${pct} 100`}
                  />
                )}
                <circle cx={needle.x} cy={needle.y} r="5" fill="#8b5000" />
                <circle cx={needle.x} cy={needle.y} r="2.5" fill="#ffffff" />
              </svg>
            </div>
          </div>

          <p className="my-space-md text-body-md leading-relaxed text-on-surface-variant">
            {eligible === 0 ? (
              <>
                No exam is unlocked yet. Review the <span className="font-bold text-on-surface">unmet criteria</span> below
                — clearing backlogs and lifting CGPA opens the first programs.
              </>
            ) : (
              <>
                Your eligibility is open for{' '}
                {named.map((c, i) => (
                  <React.Fragment key={c}>
                    <span className="font-bold text-on-surface">{c}</span>
                    {i < named.length - 1 ? ' & ' : ''}
                  </React.Fragment>
                ))}
                {eligible > named.length ? ` and ${eligible - named.length} more` : ''}.{' '}
                {backlogs > 0
                  ? 'Clear your active backlogs to widen the bracket.'
                  : 'Keep your semester scores steady to hold this bracket.'}
              </>
            )}
          </p>

          <div className="flex items-center justify-between rounded-full bg-surface-container-lowest/90 p-1.5 pl-space-md shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <div className="flex min-w-0 items-center gap-space-sm">
              <Icon name="campaign" size={18} color="#8b5000" />
              <span className="truncate text-label-md text-on-surface">Open preparation pathways</span>
            </div>
            <button
              type="button"
              onClick={onOpenPathways}
              aria-label="Open preparation pathways"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-container transition-transform hover:scale-105 active:scale-95"
            >
              <Icon name="play_arrow" size={18} color="#ffffff" filled />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Insight row ---------------- */}
      <div className="grid grid-cols-1 items-stretch gap-space-lg md:grid-cols-2 lg:grid-cols-3">
        {/* Cutoff benchmark */}
        <div className="flex flex-col justify-between rounded-lg bg-surface-container-low p-space-lg shadow-sm">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="text-headline-sm font-semibold text-on-surface">Cutoff Benchmark</span>
            <span className="text-label-sm text-outline">Min CGPA</span>
          </div>
          <div className="my-space-xs flex items-center gap-space-md rounded bg-surface-container-lowest p-space-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <Icon name="equalizer" size={20} color="#005a69" />
            </div>
            <div>
              <span className="block text-headline-sm font-bold leading-tight text-on-surface">
                {cgpa.toFixed(2)} <span className="text-body-sm font-normal text-outline">/ 10</span>
              </span>
              <span className="text-label-sm text-outline">Current Aggregate CGPA</span>
            </div>
          </div>
          <div className="pt-space-md">
            <div className="relative h-32">
              {/* student's CGPA line */}
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 border-t border-dashed border-primary/60"
                style={{ bottom: `calc(1.125rem + (100% - 1.125rem) * ${Math.min(cgpa, 10) / 10})` }}
              />
              <div className="flex h-full items-end justify-between gap-space-xs px-space-xs">
                {picked.map((r) => {
                  const cut = Number(r.minCgpaCutoff) || 0;
                  return (
                    <div key={r.examCode} className="group flex h-full flex-1 cursor-default flex-col items-center justify-end gap-space-xs" title={`${r.examName}: ${cut} CGPA`}>
                      <div className="relative flex w-2.5 flex-1 items-end justify-center rounded-full bg-primary-fixed-dim/40">
                        <div
                          className={`w-full rounded-full transition-all ${r.isEligible ? 'bg-primary group-hover:bg-primary-container' : 'bg-secondary-container'}`}
                          style={{ height: `${Math.min(cut, 10) * 10}%` }}
                        />
                      </div>
                      <span className="max-w-full truncate text-label-sm text-on-surface-variant">
                        {r.examCode.split('-')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-space-sm flex items-center justify-between text-label-sm text-outline">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Eligible</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary-container" /> Below cutoff</span>
              <span className="flex items-center gap-1"><span className="h-0 w-3 border-t border-dashed border-primary" /> You</span>
            </div>
          </div>
        </div>

        {/* Top matched exams */}
        <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-space-lg shadow-sm ring-1 ring-outline-variant/30">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="text-headline-sm font-semibold text-on-surface">Top Matched Exams</span>
            <span className="text-label-sm text-outline">CGPA Margin</span>
          </div>
          <div className="flex flex-col gap-space-sm">
            {ranked.map((r, i) => {
              const firstGap = r.shortfalls && r.shortfalls[0] ? r.shortfalls[0].parameter : null;
              return (
                <div key={r.examCode} className="flex items-center justify-between rounded p-space-xs transition-colors hover:bg-surface-container-low">
                  <div className="flex min-w-0 items-center gap-space-sm">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-label-sm font-bold ${TONES[i % TONES.length]}`}>
                      {initials(r.examCode)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-label-md font-bold leading-tight text-on-surface">{r.examName}</span>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${r.isEligible ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="truncate text-label-sm text-outline">
                          {r.isEligible ? 'Eligible' : firstGap ? `Req: ${firstGap}` : 'Action required'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`ml-2 rounded-full bg-surface-container px-space-sm py-0.5 text-label-md font-bold ${r.margin >= 0 ? 'text-primary' : 'text-secondary'}`}>
                    {r.margin >= 0 ? '+' : ''}
                    {r.margin.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category readiness */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-lg bg-surface-container-low p-space-lg shadow-sm md:col-span-2 lg:col-span-1">
          <div className="mb-space-sm flex items-center justify-between">
            <span className="text-headline-sm font-semibold text-on-surface">Category Readiness</span>
            <span className="rounded-full bg-surface-container-lowest px-space-xs py-0.5 text-label-sm font-bold text-primary shadow-sm">
              {Object.keys(byCategory).length} tracks
            </span>
          </div>
          <div className="relative h-44 overflow-hidden rounded bg-surface-container-lowest p-space-md">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="dot-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="#005a69" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-pattern)" />
            </svg>
            <div className="relative flex h-full flex-col justify-between gap-1 overflow-y-auto">
              {Object.entries(byCategory).map(([cat, v]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-label-sm text-on-surface">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className={`h-1.5 w-1.5 rounded-full ${v.ok > 0 ? 'bg-primary' : 'bg-secondary-container'}`} />
                      {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}
                    </span>
                    <span className="text-outline">{v.ok}/{v.total}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-primary-fixed-dim/40">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(v.ok / v.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-space-sm text-label-sm text-outline">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> {eligible} qualified programs
            </span>
            <button type="button" onClick={onViewMatrix} className="font-bold text-primary hover:underline">
              Open matrix
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

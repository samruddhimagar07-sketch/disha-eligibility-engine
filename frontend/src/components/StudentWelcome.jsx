import React from 'react';
import { Icon } from './Icon';

const STEPS = [
  { icon: 'edit_note', title: 'Enter your details', text: 'Branch, year, CGPA, backlogs and category.' },
  { icon: 'fact_check', title: 'See your matched exams', text: 'Only programs open to your stream are shown.' },
  { icon: 'alt_route', title: 'Follow a pathway', text: 'Open a roadmap for any exam you qualify for.' }
];

/** Shown on the student dashboard until the student submits their details. */
export default function StudentWelcome() {
  return (
    <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-r from-[#175c6c] via-[#2a7b8e] to-[#edd3be] p-space-xl text-white shadow-sm">
      <Icon
        name="school"
        size={240}
        color="#ffffff"
        className="pointer-events-none absolute -bottom-12 right-2 hidden opacity-[0.12] sm:block"
      />
      <div className="relative z-10 flex flex-col gap-space-sm">
        <span className="text-label-md uppercase tracking-widest text-white/80">Welcome to Disha</span>
        <h2 className="text-headline-lg font-bold !text-white">Let&apos;s find your next big step</h2>
        <p className="max-w-lg text-body-lg text-white/90">
          Tell us about your academics and we&apos;ll show the competitive exams and higher-study routes you qualify for,
          and what to fix for the rest.
        </p>
      </div>
      <div className="relative z-10 mt-space-lg flex flex-col gap-space-sm">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center gap-space-md rounded-full bg-black/15 py-space-xs pl-space-xs pr-space-lg backdrop-blur-md">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/90 text-primary">
              <Icon name={s.icon} size={20} color="#005a69" />
            </span>
            <span className="text-label-md">
              <span className="font-bold">{i + 1}. {s.title}</span>
              <span className="block font-normal normal-case tracking-normal text-white/80">{s.text}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shown on tabs that need a profile (pathways, simulator, announcements). */
export function ProfileRequired({ onGo }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-space-md rounded-lg bg-surface-container-low p-space-xl text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed">
        <Icon name="person_add" size={28} color="#005a69" />
      </span>
      <h3 className="text-headline-md font-semibold text-on-surface">Enter your details first</h3>
      <p className="text-body-md text-on-surface-variant">
        This section is personalised to your branch and academic profile. Fill in your details on the dashboard to
        unlock it.
      </p>
      <button type="button" className="btn btn-primary" onClick={onGo}>
        Go to dashboard
      </button>
    </div>
  );
}

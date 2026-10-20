import React from 'react';
import { Icon } from './Icon';

/**
 * AppShell — layout lifted from the EligiPath design:
 *  - fixed icon sidebar on the dark inverse-surface canvas
 *  - one big rounded white card holding the page
 *  - floating translucent header with pill navigation
 */
export default function AppShell({
  activeRole,
  activeTab,
  tabs,
  sidebarItems,
  onSidebarSelect,
  onTabChange,
  currentStudent,
  batchCount,
  notificationCount,
  onOpenNotifications,
  children
}) {
  const isStudent = activeRole === 'student';

  return (
    <div className="min-h-screen">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="fixed bottom-0 left-0 top-0 z-50 hidden w-24 flex-col items-center justify-between py-space-xl md:flex">
        <div className="flex flex-col items-center gap-space-lg">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-primary-container/30 shadow-sm ring-1 ring-white/10">
            <img src="/disha-logo.jpg" alt="Disha" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="h-1.5 w-1.5 rounded-full bg-surface-container-lowest" />
            <span className="h-1.5 w-1.5 rounded-full bg-surface-container-lowest/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-surface-container-lowest/20" />
          </div>
        </div>

        <nav className="flex flex-col items-center gap-space-sm rounded-xl bg-black/10 p-space-xs backdrop-blur-md">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.title}
              aria-current={item.active ? 'page' : undefined}
              onClick={() => onSidebarSelect(item)}
              className={`shell-nav-link ${item.active ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={22} />
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-space-md">
          <button
            type="button"
            title="Notifications"
            onClick={onOpenNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-inverse-on-surface/60 transition-colors hover:bg-white/10 hover:text-surface-container-lowest"
          >
            <Icon name="notifications" size={20} />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-container px-1 text-[10px] font-bold text-on-secondary-container">
                {notificationCount}
              </span>
            )}
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary ring-2 ring-white/20">
            <Icon name="person" size={20} className="text-on-primary" color="#ffffff" />
          </div>
        </div>
      </aside>

      {/* ---------------- Page card ---------------- */}
      <div className="min-h-screen px-space-sm py-space-sm md:pl-24 md:pr-space-margin md:py-space-margin">
        <div className="relative flex min-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(18,38,50,0.28)] md:min-h-[calc(100vh-3rem)]">
          {/* Floating header */}
          <header className="fixed left-space-sm right-space-sm top-space-sm z-40 rounded-t-xl bg-surface-container-lowest/95 backdrop-blur-xl md:left-[7.5rem] md:right-space-margin md:top-space-margin">
            <div className="flex h-16 items-center justify-between gap-space-md px-space-md md:px-space-xl">
              <div className="flex min-w-0 items-center gap-space-md">
                {/* Role switch (mobile gets this in place of the sidebar) */}
                <div className="flex items-center rounded-full bg-surface-container p-0.5">
                  <button
                    type="button"
                    onClick={() => onSidebarSelect({ role: 'student', tab: 'eligibility' })}
                    className={`flex items-center gap-1 rounded-full px-space-md py-space-xs text-label-md transition-colors ${
                      isStudent ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon name="school" size={16} />
                    <span className="hidden sm:inline">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSidebarSelect({ role: 'teacher', tab: 'batch' })}
                    className={`flex items-center gap-1 rounded-full px-space-md py-space-xs text-label-md transition-colors ${
                      !isStudent ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon name="groups" size={16} />
                    <span className="hidden sm:inline">Faculty</span>
                  </button>
                </div>
                <div className="hidden h-4 w-px bg-outline-variant/30 sm:block" />
                <span className="hidden text-headline-sm font-semibold tracking-tight text-primary lg:inline">DISHA</span>
              </div>

              <nav className="hidden items-center rounded-full bg-surface-container-low p-1 lg:flex">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onTabChange(t.key)}
                    className={`top-nav-pill ${activeTab === t.key ? 'active' : ''}`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-space-md">
                <div className="hidden items-center md:flex">
                  <div className="-space-x-2 flex items-center overflow-hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high ring-2 ring-surface-container-lowest">
                      <Icon name="school" size={16} className="text-primary" color="#005a69" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant ring-2 ring-surface-container-lowest">
                      <Icon name="psychology" size={16} className="text-primary" color="#005a69" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed ring-2 ring-surface-container-lowest">
                      <Icon name="menu_book" size={16} color="#8b5000" />
                    </div>
                  </div>
                </div>
                <div className="hidden flex-col items-start leading-tight sm:flex">
                  {isStudent ? (
                    currentStudent ? (
                      <>
                        <span className="text-label-md text-on-surface">{currentStudent.name}</span>
                        <span className="text-label-sm text-outline">
                          Yr {currentStudent.currentYear} • {currentStudent.branch} • CGPA {currentStudent.cgpa}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-label-md text-on-surface">Welcome, student</span>
                        <span className="text-label-sm text-outline">Enter your details to begin</span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="text-label-md text-on-surface">{batchCount ?? '—'} Candidates</span>
                      <span className="text-label-sm text-outline">Prof. K. Sundaram</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  title="Notifications"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm md:hidden"
                >
                  <Icon name="notifications" size={18} color="#ffffff" />
                </button>
                <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm md:flex">
                  <Icon name={isStudent ? 'person' : 'badge'} size={18} color="#ffffff" />
                </div>
              </div>
            </div>
            {/* Tabs row for narrow screens */}
            <nav className="flex items-center gap-1 overflow-x-auto px-space-md pb-space-sm lg:hidden">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onTabChange(t.key)}
                  className={`top-nav-pill ${activeTab === t.key ? 'active' : 'bg-surface-container-low'}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          <main className="w-full flex-1 px-space-md pb-space-md pt-28 md:px-space-xl md:pb-space-xl lg:pt-16">
            <div className="flex w-full flex-col gap-space-lg pb-space-xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

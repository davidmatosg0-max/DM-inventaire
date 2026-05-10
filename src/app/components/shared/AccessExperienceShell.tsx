import React from 'react';

interface AccessShellBranding {
  primaryColor: string;
  secondaryColor: string;
}

interface AccessExperienceShellProps {
  branding: AccessShellBranding;
  topRight?: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function AccessExperienceShell({
  branding,
  topRight,
  leftPanel,
  rightPanel,
}: AccessExperienceShellProps) {
  return (
    <div
      className="app-main-stage relative min-h-screen overflow-hidden px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-24 top-0 h-[22rem] w-[22rem] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div
          className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_42%)]" />
      </div>

      {topRight ? <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">{topRight}</div> : null}

      <div className="app-shell-content relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center" data-app-shell>
        <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-5">
          <section
            className="card-glass overflow-hidden rounded-[30px] border border-white/75 p-5 shadow-[0_30px_90px_-46px_rgba(15,45,71,0.4)] sm:p-6 lg:p-7"
            style={{
              background: `linear-gradient(160deg, ${branding.primaryColor}14 0%, rgba(255,255,255,0.98) 42%, ${branding.secondaryColor}12 100%)`,
            }}
          >
            {leftPanel}
          </section>

          <section className="card-glass rounded-[30px] border border-white/78 bg-white/92 p-5 shadow-[0_30px_90px_-46px_rgba(15,45,71,0.32)] sm:p-6 lg:p-7">
            {rightPanel}
          </section>
        </div>
      </div>
    </div>
  );
}
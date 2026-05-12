import React from 'react';
import { cn } from '../ui/utils';

interface ModuleControlSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

interface ModuleControlSurfaceSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModuleControlSurface({ children, className }: ModuleControlSurfaceProps) {
  return (
    <section className={cn('card-glass relative overflow-hidden rounded-[30px] border border-white/72 bg-white/90 shadow-[0_28px_72px_-44px_rgba(15,45,71,0.34)] ring-1 ring-slate-900/5 backdrop-blur-xl', className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.92)_38%,rgba(247,250,252,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function ModuleControlSurfaceHeader({ children, className }: ModuleControlSurfaceSectionProps) {
  return (
    <div className={cn('border-b border-white/60 px-4 pb-4 pt-4 sm:px-5 sm:pt-5', className)}>
      {children}
    </div>
  );
}

export function ModuleControlSurfaceTabs({ children, className }: ModuleControlSurfaceSectionProps) {
  return <div className={cn('px-4 py-4 sm:px-5 sm:py-5', className)}>{children}</div>;
}

export function ModuleControlSurfaceBody({ children, className }: ModuleControlSurfaceSectionProps) {
  return <div className={cn('px-4 pb-4 pt-0 sm:px-5 sm:pb-5', className)}>{children}</div>;
}
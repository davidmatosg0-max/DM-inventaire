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
    <section className={cn('backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60', className)}>
      {children}
    </section>
  );
}

export function ModuleControlSurfaceHeader({ children, className }: ModuleControlSurfaceSectionProps) {
  return (
    <div className={cn('border-b border-white/60 px-3 pb-3 pt-3 sm:px-4 sm:pt-4', className)}>
      {children}
    </div>
  );
}

export function ModuleControlSurfaceTabs({ children, className }: ModuleControlSurfaceSectionProps) {
  return <div className={cn('p-3 sm:p-4', className)}>{children}</div>;
}

export function ModuleControlSurfaceBody({ children, className }: ModuleControlSurfaceSectionProps) {
  return <div className={cn('p-3 sm:p-4 pt-0', className)}>{children}</div>;
}
import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../ui/utils';

interface ModulePageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  secondaryColor: string;
  actions?: React.ReactNode;
  className?: string;
}

interface ModuleStatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accentColor: string;
  valueColor?: string;
  helper?: React.ReactNode;
  className?: string;
}

interface ModuleStatsGridProps {
  children: React.ReactNode;
  defaultLayout: string;
  compactLayout?: string;
  compact?: boolean;
  className?: string;
}

export function ModulePageHeader({
  title,
  subtitle,
  icon,
  accentColor,
  secondaryColor,
  actions,
  className,
}: ModulePageHeaderProps) {
  return (
    <section className={cn('card-glass rounded-2xl border border-white/70 px-4 py-4 shadow-xl sm:px-6 sm:py-6', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-14 sm:w-14"
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1
                className="truncate text-xl sm:text-2xl lg:text-3xl"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: accentColor }}
              >
                {title}
              </h1>
              <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" style={{ color: secondaryColor }} />
            </div>
            <p className="mt-1 text-xs text-[#5d7185] sm:text-sm">{subtitle}</p>
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ModuleStatCard({
  label,
  value,
  icon,
  accentColor,
  valueColor,
  helper,
  className,
}: ModuleStatCardProps) {
  return (
    <article
      className={cn(
        'card-glass rounded-2xl border-l-4 p-3 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:p-4',
        className,
      )}
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] text-[#5d7185] sm:text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            {label}
          </p>
          <div
            className="truncate text-lg font-bold sm:text-2xl"
            style={{ fontFamily: 'Montserrat, sans-serif', color: valueColor || accentColor }}
          >
            {value}
          </div>
        </div>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-lg sm:h-11 sm:w-11"
          style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` }}
        >
          {icon}
        </div>
      </div>
      {helper ? <div className="mt-2">{helper}</div> : null}
    </article>
  );
}

export function ModuleStatsGrid({
  children,
  defaultLayout,
  compactLayout,
  compact = false,
  className,
}: ModuleStatsGridProps) {
  return <div className={cn(compact && compactLayout ? compactLayout : defaultLayout, className)}>{children}</div>;
}
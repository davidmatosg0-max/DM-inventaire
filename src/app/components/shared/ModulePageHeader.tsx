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
  secondaryColor?: string;
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
    <section className={cn('card-glass relative overflow-hidden rounded-[28px] border border-white/72 px-4 py-4 shadow-[0_28px_70px_-42px_rgba(15,45,71,0.32)] sm:px-6 sm:py-6 lg:px-7', className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(255,255,255,0.9) 45%, ${secondaryColor}10 100%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_68%)]" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
            Expérience unifiée
          </div>

          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[20px] shadow-[0_20px_36px_-24px_rgba(15,45,71,0.45)] sm:h-14 sm:w-14"
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)` }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <h1
                className="truncate text-xl sm:text-[1.9rem] lg:text-[2.2rem] leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: accentColor }}
              >
                {title}
              </h1>
              <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" style={{ color: secondaryColor }} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5d7185] sm:text-[0.98rem]">{subtitle}</p>
          </div>
        </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-full border border-white/85 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
              Responsive
            </div>
            <div className="rounded-full border border-white/85 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
              Interface pro
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-2 rounded-[24px] border border-white/80 bg-white/76 p-2 shadow-[0_18px_36px_-34px_rgba(15,45,71,0.28)] sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end">
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
  secondaryColor,
  valueColor,
  helper,
  className,
}: ModuleStatCardProps) {
  return (
    <article
      className={cn(
        'card-glass rounded-[24px] border border-white/78 p-3 shadow-[0_18px_38px_-34px_rgba(15,45,71,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-34px_rgba(15,45,71,0.34)] sm:p-4',
        className,
      )}
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.98) 0%, ${accentColor}08 100%)`,
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-[#5d7185] sm:text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            {label}
          </p>
          <div
            className="truncate text-lg font-bold sm:text-[1.7rem]"
            style={{ fontFamily: 'Montserrat, sans-serif', color: valueColor || accentColor }}
          >
            {value}
          </div>
        </div>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[16px] shadow-[0_18px_32px_-24px_rgba(15,45,71,0.38)] sm:h-11 sm:w-11"
          style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor || accentColor} 100%)` }}
        >
          {icon}
        </div>
      </div>
      {helper ? <div className="mt-3 text-sm text-slate-500">{helper}</div> : null}
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
  return <div className={cn(compact && compactLayout ? compactLayout : defaultLayout, 'gap-3 sm:gap-4', className)}>{children}</div>;
}
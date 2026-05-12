import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <section className={cn('card-glass relative overflow-hidden rounded-[32px] border border-white/75 px-4 py-4 shadow-[0_34px_86px_-48px_rgba(15,45,71,0.36)] ring-1 ring-slate-900/5 sm:px-6 sm:py-6 lg:px-7', className)}>
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background: `linear-gradient(135deg, ${accentColor}14 0%, rgba(255,255,255,0.94) 30%, rgba(248,250,252,0.98) 58%, ${secondaryColor}12 100%)`,
        }}
      />
      <div className="pointer-events-none absolute -left-14 top-[-5.5rem] h-44 w-44 rounded-full blur-3xl" style={{ background: `${accentColor}20` }} />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-2rem] h-52 w-52 rounded-full blur-3xl" style={{ background: `${secondaryColor}18` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.92),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-3 py-1 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.48)]" style={{ backgroundColor: secondaryColor }} />
              {t('experience.unifiedExperience')}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-3 py-1 text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              {t('experience.executiveCadence')}
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div
              className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[22px] shadow-[0_24px_42px_-26px_rgba(15,45,71,0.48)] sm:h-16 sm:w-16"
              style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)` }}
            >
              <div className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-white/25" />
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-start gap-2 min-w-0">
                <h1
                  className="truncate text-[1.45rem] sm:text-[2rem] lg:text-[2.35rem] leading-tight"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: accentColor }}
                >
                  {title}
                </h1>
                <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" style={{ color: secondaryColor }} />
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5d7185] sm:text-[1rem]">{subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/85 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                  {t('experience.responsive')}
                </div>
                <div className="rounded-full border border-white/85 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                  {t('experience.professionalInterface')}
                </div>
                <div className="rounded-full border border-white/75 bg-white/62 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 shadow-sm">
                  {t('experience.prioritySignal')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {actions ? (
          <div className="flex w-full flex-col gap-2 rounded-[26px] border border-white/80 bg-white/72 p-2.5 shadow-[0_24px_54px_-38px_rgba(15,45,71,0.34)] backdrop-blur-xl sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end">
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
  const { t } = useTranslation();

  return (
    <article
      className={cn(
        'card-glass relative overflow-hidden rounded-[26px] border border-white/80 p-3.5 shadow-[0_22px_46px_-34px_rgba(15,45,71,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-36px_rgba(15,45,71,0.36)] sm:p-4',
        className,
      )}
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.98) 0%, ${accentColor}0d 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[26px]" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, ${secondaryColor || accentColor} 100%)` }} />
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
      <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        {t('experience.priorityView')}
      </div>
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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../ui/utils';

type ModuleExecutiveMetric = {
  id: string;
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
  accentColor?: string;
};

interface ModuleExecutiveStripProps {
  eyebrow?: string;
  title: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  metrics: ModuleExecutiveMetric[];
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function ModuleExecutiveStrip({
  eyebrow: eyebrowProp,
  title,
  description,
  accentColor,
  secondaryColor,
  metrics,
  actions,
  className,
  compact = false,
}: ModuleExecutiveStripProps) {
  const { t } = useTranslation();
  const eyebrow = eyebrowProp ?? t('experience.quickPilotage');

  return (
    <section
      className={cn(
        'card-glass relative overflow-hidden rounded-[32px] border border-white/80 shadow-[0_34px_84px_-48px_rgba(15,45,71,0.34)] ring-1 ring-slate-900/5',
        compact ? 'px-4 py-3.5 sm:px-4.5 sm:py-4' : 'px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background: `linear-gradient(135deg, ${accentColor}16 0%, rgba(255,255,255,0.95) 32%, rgba(247,250,252,0.98) 58%, ${secondaryColor}14 100%)`,
        }}
      />
      <div className="pointer-events-none absolute -left-16 top-[-6.5rem] h-48 w-48 rounded-full blur-3xl" style={{ background: `${accentColor}1f` }} />
      <div className="pointer-events-none absolute bottom-[-7rem] right-[-3rem] h-56 w-56 rounded-full blur-3xl" style={{ background: `${secondaryColor}18` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.94),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

      <div className={cn('relative flex flex-col xl:flex-row xl:items-start xl:justify-between', compact ? 'gap-3' : 'gap-4')}>
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/82 px-3 py-1 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.5)]" style={{ backgroundColor: secondaryColor }} />
              {eyebrow}
            </div>
            {!compact ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                {t('experience.executiveLevel')}
              </div>
            ) : null}
          </div>

          <div className={cn('flex flex-col lg:flex-row lg:items-end lg:justify-between', compact ? 'mt-2 gap-2.5' : 'mt-4 gap-4')}>
            <div className="min-w-0">
              <h2
                className={cn('leading-tight', compact ? 'text-lg sm:text-[1.45rem]' : 'text-xl sm:text-[1.75rem]')}
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: accentColor }}
              >
                {title}
              </h2>
              <p className={cn('max-w-2xl text-[#5d7185]', compact ? 'mt-1.5 text-[0.9rem] leading-5' : 'mt-2 text-sm leading-6 sm:text-[0.98rem]')}>
                {description}
              </p>
            </div>

            {!compact ? (
              <div className="inline-flex items-center gap-3 rounded-[20px] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_18px_42px_-32px_rgba(15,45,71,0.4)] backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_36px_-24px_rgba(15,45,71,0.36)]" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)` }}>
                  <span className="text-base font-bold">+</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('experience.activeCockpit')}</p>
                  <p className="text-sm font-semibold text-slate-700">{t('experience.quickReadActions')}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className={cn(
            'flex w-full flex-wrap gap-2 rounded-[24px] border border-white/75 bg-white/62 shadow-[0_22px_52px_-40px_rgba(15,45,71,0.38)] backdrop-blur-xl xl:w-auto xl:max-w-[36rem] xl:justify-end',
            compact ? 'p-2' : 'p-2.5',
          )}>
            {actions}
          </div>
        ) : null}
      </div>

      <div className={cn('relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4', compact ? 'mt-3.5' : 'mt-5')}>
        {metrics.map((metric, index) => {
          const metricColor = metric.accentColor || accentColor;
          const isLeadMetric = index === 0 && metrics.length > 2;

          return (
            <article
              key={metric.id}
              className={cn(
                'group relative rounded-[24px] border border-white/88 bg-white/82 shadow-[0_22px_48px_-34px_rgba(15,45,71,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-36px_rgba(15,45,71,0.34)]',
                compact ? 'p-3' : 'p-3.5',
                isLeadMetric ? 'xl:col-span-2' : '',
              )}
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[24px] opacity-90" style={{ background: `linear-gradient(90deg, ${metricColor} 0%, ${secondaryColor} 100%)` }} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-[0.16em] text-[#6b7d90]"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
                  >
                    {metric.label}
                  </p>
                  <div
                    className={cn(
                      'mt-2 font-bold leading-tight',
                      isLeadMetric ? 'text-[1.55rem] sm:text-[1.85rem]' : 'text-base sm:text-[1.35rem]',
                    )}
                    style={{ fontFamily: 'Montserrat, sans-serif', color: metricColor }}
                  >
                    {metric.value}
                  </div>
                  {metric.helper ? <div className="mt-2 text-xs leading-5 text-[#5d7185] sm:text-[0.8rem]">{metric.helper}</div> : null}
                </div>

                {metric.icon ? (
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] text-white shadow-[0_18px_36px_-24px_rgba(15,45,71,0.36)] transition-transform duration-300 group-hover:scale-[1.04]"
                    style={{ background: `linear-gradient(135deg, ${metricColor} 0%, ${secondaryColor} 100%)` }}
                  >
                    {metric.icon}
                  </div>
                ) : null}
              </div>

              {!compact ? (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: metricColor }} />
                  {t('experience.prioritySignal')}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
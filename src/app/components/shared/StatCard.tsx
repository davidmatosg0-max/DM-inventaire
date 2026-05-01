import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
  borderColor?: string;
  valueColor?: string;
  trendIcon?: LucideIcon;
  trendColor?: string;
  badge?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;
  className?: string;
}

const badgeVariants = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground border border-border',
  success: 'bg-accent/10 text-accent border border-accent/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-destructive/10 text-destructive border border-destructive/20',
};

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor = '#1a4d7a',
  borderColor = '#1a4d7a',
  valueColor = '#1a4d7a',
  trendIcon: TrendIcon,
  trendColor = '#10b981',
  badge,
  onClick,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-xl bg-white/90 rounded-xl p-4 sm:p-5 border border-white/60 shadow-modern transition-all duration-300 hover:shadow-modern-lg hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}DD 100%)`,
          }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        {TrendIcon && (
          <TrendIcon 
            className="w-4 h-4 sm:w-5 sm:h-5" 
            style={{ color: trendColor }}
          />
        )}
      </div>

      <p
        className="text-xs sm:text-sm text-muted-foreground mb-1"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
      >
        {title}
      </p>

      <div
        className="text-2xl sm:text-3xl font-bold mb-2"
        style={{ color: valueColor, fontFamily: 'Montserrat, sans-serif' }}
      >
        {value}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      )}

      {badge && (
        <div
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            badgeVariants[badge.variant || 'primary']
          )}
        >
          {badge.text}
        </div>
      )}
    </div>
  );
}

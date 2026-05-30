import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface ModuleSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'glass';
}

export function ModuleSection({
  title,
  description,
  icon: Icon,
  children,
  actions,
  className = '',
  contentClassName = '',
  variant = 'default',
}: ModuleSectionProps) {
  const cardClasses = variant === 'glass' 
    ? 'backdrop-blur-xl bg-white/90 border border-white/60 shadow-modern-lg'
    : 'shadow-modern';

  return (
    <Card className={`${cardClasses} animate-fadeInScale ${className}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle 
                className="text-[1rem] sm:text-[1.1rem]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1 text-[0.84rem] sm:text-[0.9rem] leading-5">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`pt-0 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}

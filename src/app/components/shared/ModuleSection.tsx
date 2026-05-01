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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {Icon && (
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle 
                className="text-lg sm:text-xl"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}

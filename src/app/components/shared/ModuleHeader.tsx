import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  gradient?: boolean;
}

export function ModuleHeader({ 
  icon: Icon, 
  title, 
  description, 
  actions,
  gradient = true 
}: ModuleHeaderProps) {
  return (
    <div className={`
      ${gradient ? 'backdrop-blur-xl bg-white/90 border border-white/60' : 'bg-white border border-border'}
      rounded-xl shadow-modern p-4 sm:p-6 mb-6 animate-slideInUp
    `}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-primary flex-shrink-0 gradient-primary"
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl text-primary truncate"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

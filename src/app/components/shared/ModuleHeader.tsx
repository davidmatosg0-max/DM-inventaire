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
      rounded-[1.1rem] shadow-modern p-3.5 sm:p-5 mb-4 sm:mb-5 animate-slideInUp
    `}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-3.5 flex-1">
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-primary flex-shrink-0 gradient-primary"
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 
              className="text-lg sm:text-xl lg:text-[1.95rem] text-primary truncate"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-[0.82rem] sm:text-sm text-muted-foreground mt-1">
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

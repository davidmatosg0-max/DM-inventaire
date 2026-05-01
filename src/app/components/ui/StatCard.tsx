import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useBranding } from '../../../hooks/useBranding';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorType?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

export function StatCard({ title, value, icon: Icon, trend, colorType = 'primary' }: StatCardProps) {
  const branding = useBranding();

  const getColor = () => {
    switch (colorType) {
      case 'primary':
        return branding.primaryColor;
      case 'secondary':
        return branding.secondaryColor;
      case 'success':
        return branding.successColor;
      case 'danger':
        return branding.dangerColor;
      case 'warning':
        return branding.warningColor;
      default:
        return branding.primaryColor;
    }
  };

  const borderColor = getColor();
  const iconBgColor = getColor();

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 border-l-4 transition-all hover:shadow-lg"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <p 
            className="text-xs sm:text-sm text-gray-600 mb-1 truncate" 
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {title}
          </p>
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {value}
          </p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mes anterior
            </p>
          )}
        </div>
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
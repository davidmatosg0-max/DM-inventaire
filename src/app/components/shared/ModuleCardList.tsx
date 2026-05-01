import React from 'react';
import { cn } from '../ui/utils';

interface ModuleCardListProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function ModuleCardList<T>({
  data,
  renderCard,
  keyExtractor,
  emptyMessage = 'No hay elementos para mostrar',
  emptyIcon,
  columns = 1,
  gap = 'md',
  className,
}: ModuleCardListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        {emptyIcon && (
          <div className="mb-4 text-muted-foreground opacity-50">
            {emptyIcon}
          </div>
        )}
        <p className="text-muted-foreground text-sm text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {data.map((item, index) => (
        <div key={keyExtractor(item, index)} className="animate-fadeInScale">
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}

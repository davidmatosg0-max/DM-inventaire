import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../ui/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface ModuleTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
  hoverable?: boolean;
  striped?: boolean;
}

export function ModuleTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className,
  hoverable = true,
  striped = false,
}: ModuleTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border shadow-sm', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={cn(
                  'font-semibold text-foreground',
                  column.headerClassName
                )}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item, index)}
              onClick={() => onRowClick?.(item, index)}
              className={cn(
                'transition-colors duration-150',
                hoverable && 'cursor-pointer hover:bg-accent/50',
                striped && index % 2 === 0 && 'bg-muted/20',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={column.className}
                >
                  {column.render
                    ? column.render(item, index)
                    : (item as any)[column.key]?.toString() || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
